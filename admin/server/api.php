<?php
/**
 * The content admin's backend, for the deployed site.
 *
 * Hostinger runs PHP, not Node, so this stands in for scripts/admin-server.mjs
 * once the site is live. It reads published files from GitHub and keeps one
 * protected draft file on the host. Save updates the draft; Publish commits it
 * back to GitHub; the push automatically starts the build workflow.
 *
 * Secrets live in config.php, which .htaccess refuses to serve.
 */

declare(strict_types=1);

// config.php refuses to define anything unless it is reached through here.
define('ADMIN_ENTRY', true);
require __DIR__ . '/config.php';

header('Content-Type: application/json');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('X-Robots-Tag: noindex, nofollow');

session_name('eiretech_admin');
session_set_cookie_params([
    'lifetime' => 0,
    'path'     => '/',
    'secure'   => !empty($_SERVER['HTTPS']),
    'httponly' => true,
    'samesite' => 'Strict',
]);
session_start();

/* ------------------------------------------------------------------
   Helpers
------------------------------------------------------------------ */

/**
 * Sends a JSON response and stops.
 *
 * @param int   $status HTTP status.
 * @param array $body   Response body.
 */
function reply(int $status, array $body): void
{
    http_response_code($status);
    echo json_encode($body);
    exit;
}

/**
 * Checks a password against the stored hash.
 *
 * The format is the one scripts/admin-auth.mjs writes:
 * "pbkdf2$sha256$iterations$saltHex$keyHex". PBKDF2 is used precisely because
 * Node and PHP both have it built in, so one password works locally and here.
 *
 * hash_equals is constant-time; a plain === would leak how much of the hash
 * matched through how long the comparison took.
 */
function verify_password(string $password, string $stored): bool
{
    $parts = explode('$', $stored);
    if (count($parts) !== 5 || $parts[0] !== 'pbkdf2') {
        return false;
    }

    list(, $digest, $iterations, $saltHex, $keyHex) = $parts;

    $rounds = (int) $iterations;
    if ($rounds < 1000 || !in_array($digest, hash_algos(), true)) {
        return false;
    }

    $expected = hex2bin($keyHex);
    $salt     = hex2bin($saltHex);
    if ($expected === false || $salt === false || $expected === '') {
        return false;
    }

    $actual = hash_pbkdf2($digest, $password, $salt, $rounds, strlen($expected), true);

    return hash_equals($expected, $actual);
}

/** The decoded JSON request body, or an empty array. */
function request_body(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') {
        return [];
    }
    $decoded = json_decode($raw, true);

    return is_array($decoded) ? $decoded : [];
}

/**
 * One call to the GitHub API.
 *
 * @param string     $method HTTP method.
 * @param string     $path   Path under https://api.github.com.
 * @param array|null $body   JSON body, or null for none.
 * @return array{status:int,body:mixed}
 */
function github(string $method, string $path, ?array $body = null): array
{
    $handle = curl_init('https://api.github.com' . $path);

    $headers = [
        'Accept: application/vnd.github+json',
        'Authorization: Bearer ' . ADMIN_GITHUB_TOKEN,
        'X-GitHub-Api-Version: 2022-11-28',
        'User-Agent: eiretech-content-admin',
    ];

    curl_setopt($handle, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($handle, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($handle, CURLOPT_TIMEOUT, 30);

    if ($body !== null) {
        $headers[] = 'Content-Type: application/json';
        curl_setopt($handle, CURLOPT_POSTFIELDS, json_encode($body));
    }

    curl_setopt($handle, CURLOPT_HTTPHEADER, $headers);

    $response = curl_exec($handle);
    $status   = (int) curl_getinfo($handle, CURLINFO_HTTP_CODE);
    $error    = curl_error($handle);
    curl_close($handle);

    if ($response === false || $status === 0) {
        return ['status' => 0, 'body' => ['message' => $error ?: 'Could not reach GitHub']];
    }

    return ['status' => $status, 'body' => json_decode($response, true)];
}

/**
 * Turns a failed GitHub call into something an editor can act on.
 *
 * @param array  $result What github() returned.
 * @param string $what   What was being attempted.
 */
function github_error(array $result, string $what): string
{
    $message = is_array($result['body']) && isset($result['body']['message'])
        ? $result['body']['message']
        : '';

    if ($result['status'] === 0) {
        return 'Could not reach GitHub while trying to ' . $what . '. ' . $message;
    }
    if ($result['status'] === 401 || $result['status'] === 403) {
        return 'GitHub refused the access token while trying to ' . $what
            . '. It may have expired or lost permission.';
    }
    if ($result['status'] === 404) {
        return 'GitHub could not find what it needed to ' . $what
            . '. Check the repository name and that the token can see it.';
    }

    return 'GitHub returned ' . $result['status'] . ' while trying to ' . $what
        . ($message !== '' ? ': ' . $message : '.');
}

/**
 * Reads one JSON file from the repository at the configured branch.
 *
 * Returns null on any failure; $result comes back with the call that failed,
 * so the caller can say why rather than just that something went wrong.
 *
 * @param string $path   Path within the repository.
 * @param array  $result Set to the GitHub response.
 */
function read_repo_file(string $path, array &$result = [])
{
    $result = github('GET', '/repos/' . ADMIN_GITHUB_REPO . '/contents/' . $path . '?ref=' . ADMIN_GITHUB_BRANCH);

    if ($result['status'] !== 200 || !isset($result['body']['content'])) {
        return null;
    }

    $decoded = base64_decode(str_replace("\n", '', $result['body']['content']), true);

    return $decoded === false ? null : json_decode($decoded, true);
}

/** Drafts live on the host and are never exposed through a public URL. */
function draft_file(): string
{
    return __DIR__ . '/.draft.json';
}

function read_draft(): ?array
{
    $file = draft_file();
    if (!is_file($file)) {
        return null;
    }

    $decoded = json_decode((string) file_get_contents($file), true);
    return is_array($decoded) ? $decoded : null;
}

function write_draft(array $value): void
{
    $tmp = draft_file() . '.tmp';
    file_put_contents($tmp, json_encode($value, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . "\n", LOCK_EX);
    rename($tmp, draft_file());
}

function clear_draft(): void
{
    if (is_file(draft_file())) {
        unlink(draft_file());
    }
}

/* ------------------------------------------------------------------
   Sign-in throttling

   Kept in a file beside this script rather than the session, so clearing
   cookies does not reset it.
------------------------------------------------------------------ */

function throttle_state(): array
{
    $file = __DIR__ . '/.login-attempts';
    if (!is_file($file)) {
        return ['failures' => 0, 'until' => 0];
    }
    $decoded = json_decode((string) file_get_contents($file), true);

    return is_array($decoded) ? $decoded + ['failures' => 0, 'until' => 0] : ['failures' => 0, 'until' => 0];
}

function throttle_write(array $state): void
{
    file_put_contents(__DIR__ . '/.login-attempts', json_encode($state), LOCK_EX);
}

/* ------------------------------------------------------------------
   Validation

   The site imports these files directly, so a bad save would break the build
   rather than show an error here. This mirrors the checks in
   scripts/admin-server.mjs; both ends have to agree.
------------------------------------------------------------------ */

function validate(array $next): array
{
    $errors = [];

    $need = function ($value, string $where) use (&$errors) {
        if (!is_string($value) || trim($value) === '') {
            $errors[] = $where . ' cannot be empty';
        }
    };

    if (!isset($next['site']['routes']) || !is_array($next['site']['routes'])) {
        return ['site.routes is missing'];
    }

    $need($next['site']['site']['url'] ?? null, 'Site URL');
    $need($next['site']['site']['name'] ?? null, 'Site name');

    $url = $next['site']['site']['url'] ?? '';
    if ($url !== '' && !preg_match('#^https?://[^\s/]+#', $url)) {
        $errors[] = 'Site URL must start with http:// or https://';
    }

    $email = $next['site']['contact']['email'] ?? '';
    if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Contact email is not a valid address';
    }

    $seenSlug = [];
    $seenKey  = [];

    foreach ($next['site']['routes'] as $route) {
        $key = $route['key'] ?? '';
        $need($key, 'A page key');
        $need($route['navLabel'] ?? null, $key . ': navigation label');
        $need($route['footerLabel'] ?? null, $key . ': footer label');

        if (in_array($key, $seenKey, true)) {
            $errors[] = 'Two pages share the key "' . $key . '"';
        }
        $seenKey[] = $key;

        $slug = $route['slug'] ?? '';
        if ($slug === '') {
            if ($key !== 'home') {
                $errors[] = $key . ': only the home page may have an empty slug';
            }
        } elseif (!preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $slug)) {
            $errors[] = $key . ': the slug "' . $slug . '" must be lower-case letters, numbers and single hyphens';
        }

        if (isset($seenSlug[$slug])) {
            $errors[] = '"' . ($slug === '' ? '/' : $slug) . '" is used by both ' . $seenSlug[$slug] . ' and ' . $key;
        }
        $seenSlug[$slug] = $key;

        $page = $next['pages'][$key] ?? null;
        if (!is_array($page)) {
            $errors[] = $key . ': page content is missing';
            continue;
        }

        $need($page['seo']['title'] ?? null, $key . ': meta title');
        $need($page['seo']['description'] ?? null, $key . ': meta description');

        $canonical = $page['seo']['canonical'] ?? '';
        if ($canonical !== '' && !preg_match('#^https?://#', $canonical)) {
            $errors[] = $key . ': canonical URL must start with http:// or https://';
        }

        if ($key === 'home') {
            if (!isset($page['hero']['headline']) || !is_array($page['hero']['headline']) || count($page['hero']['headline']) === 0) {
                $errors[] = 'home: the headline needs at least one line';
            }
        } else {
            $need($page['hero']['title'] ?? null, $key . ': page heading');
        }
    }

    if (!in_array('home', $seenKey, true)) {
        $errors[] = 'The home page cannot be removed';
    }
    if (!in_array('contact', $seenKey, true)) {
        $errors[] = 'The contact page cannot be removed';
    }

    foreach ([['services', 'services'], ['platforms', 'platforms'], ['testimonials', 'testimonials'], ['projects', 'projects']] as $pair) {
        if (!isset($next[$pair[0]]) || !is_array($next[$pair[0]])) {
            $errors[] = $pair[1] . ' must be a list';
        }
    }

    $seenServiceSlug = [];
    foreach ($next['services'] ?? [] as $service) {
        $serviceSlug = trim((string) ($service['slug'] ?? ''));
        if ($serviceSlug !== '') {
            if (!preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $serviceSlug)) {
                $errors[] = ($service['title'] ?? 'A service') . ': the page address "' . $serviceSlug . '" must be lower-case letters, numbers and single hyphens';
            } elseif (isset($seenServiceSlug[$serviceSlug])) {
                $errors[] = 'The page address "' . $serviceSlug . '" is used by more than one service';
            }
            $seenServiceSlug[$serviceSlug] = true;
        }
        $need($service['title'] ?? null, 'A service title');
    }
    foreach ($next['platforms'] ?? [] as $group) {
        $need($group['title'] ?? null, 'A platform group title');
    }
    $serviceSlugs = [];
    foreach ($next['services'] ?? [] as $service) {
        $serviceSlugs[] = trim((string) ($service['slug'] ?? ''));
    }
    // A bullet point page that names nothing would render as a link to nowhere.
    foreach ($next['services'] ?? [] as $service) {
        if (!isset($service['pointPages']) || !is_array($service['pointPages'])) {
            continue;
        }
        $pointCount = is_array($service['points'] ?? null) ? count($service['points']) : 0;
        if (count($service['pointPages']) > $pointCount) {
            $errors[] = (($service['title'] ?? '') ?: 'A service') . ': there are more bullet point pages than bullet points';
        }
        foreach ($service['pointPages'] as $page) {
            $target = trim((string) $page);
            if ($target !== '' && !in_array($target, $serviceSlugs, true)) {
                $errors[] = (($service['title'] ?? '') ?: 'A service') . ': "' . $target . '" is not a service page address';
            }
        }
    }
    foreach ($next['projects'] ?? [] as $project) {
        $need($project['title'] ?? null, 'A project name');
        $projectService = trim((string) ($project['service'] ?? ''));
        if (!in_array($projectService, $serviceSlugs, true)) {
            $errors[] = (($project['title'] ?? '') ?: 'A project') . ': "' . $projectService . '" is not a service page address';
        }
    }
    foreach ($next['testimonials'] ?? [] as $quote) {
        $need($quote['name'] ?? null, 'A testimonial name');
        $need($quote['quote'] ?? null, (($quote['name'] ?? '') ?: 'A testimonial') . ': the quote');
    }

    $checkLink = function ($value, string $where) use (&$errors, $seenKey) {
        if (!is_string($value) || $value === '') {
            return;
        }
        if (preg_match('#^(https?:)?//#', $value)) {
            return;
        }
        if (!in_array($value, $seenKey, true)) {
            $errors[] = $where . ': "' . $value . '" is not a page key or a URL';
        }
    };

    foreach ($next['site']['routes'] as $route) {
        $page = $next['pages'][$route['key'] ?? ''] ?? null;
        if (!is_array($page)) {
            continue;
        }
        $checkLink($page['cta']['buttonTo'] ?? null, ($route['key'] ?? '') . ': call-to-action link');
        $checkLink($page['hero']['primaryTo'] ?? null, ($route['key'] ?? '') . ': primary button link');
        $checkLink($page['hero']['secondaryTo'] ?? null, ($route['key'] ?? '') . ': secondary button link');
    }

    return array_merge($errors, validate_blog($next['blog'] ?? null));
}

/**
 * The blog articles. Mirrors validateBlog() in scripts/admin-server.mjs.
 * Drafts only need a title and an address, since they are never built.
 *
 * @param mixed $blog The decoded content/blog.json, or null when absent.
 */
function validate_blog($blog): array
{
    if ($blog === null) {
        return [];
    }
    if (!is_array($blog)) {
        return ['blog must be a list'];
    }

    $errors = [];
    $seen   = [];

    foreach ($blog as $post) {
        $title = trim((string) ($post['title'] ?? ''));
        $name  = $title !== '' ? $title : 'An article';
        if ($title === '') {
            $errors[] = 'An article has no title';
        }

        $slug = (string) ($post['slug'] ?? '');
        if (!preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $slug)) {
            $errors[] = $name . ': the page address "' . $slug . '" must be lower-case letters, numbers and single hyphens';
        } elseif (isset($seen[$slug])) {
            $errors[] = 'The page address "' . $slug . '" is used by more than one article';
        }
        $seen[$slug] = true;

        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', (string) ($post['date'] ?? ''))) {
            $errors[] = $name . ': the publication date must be set';
        }
        if (!isset($post['body']) || !is_string($post['body'])) {
            $errors[] = $name . ': the article text is missing';
        }

        if (empty($post['draft'])) {
            if (trim(strip_tags((string) ($post['body'] ?? ''))) === '') {
                $errors[] = $name . ': a published article needs some text';
            }
            if (!empty($post['cover']) && trim((string) ($post['coverAlt'] ?? '')) === '') {
                $errors[] = $name . ': the cover image needs alt text';
            }
        }
    }

    return $errors;
}

/* ------------------------------------------------------------------
   Blog images

   Uploads are written straight into the site's own uploads/blog/ folder on
   the host, so they show in the editor and on the live site at once. Commit
   then copies the ones an article uses into the repository (public/uploads/
   blog/), so the next build ships them too and they are never lost.
------------------------------------------------------------------ */

/**
 * The uploads folder at the website's public root.
 *
 * The Node deployment can serve the admin from a versioned release directory,
 * so dirname(__DIR__) is not always the same place as the public document
 * root. Uploaded article images are publicly served from /uploads/blog, hence
 * DOCUMENT_ROOT is the authoritative location whenever PHP provides it.
 */
function uploads_dir(): string
{
    $documentRoot = rtrim((string) ($_SERVER['DOCUMENT_ROOT'] ?? ''), '/\\');
    if ($documentRoot !== '') {
        return $documentRoot . '/uploads/blog';
    }

    return dirname(__DIR__) . '/uploads/blog';
}

/**
 * Stores one uploaded image and returns its site path.
 *
 * The type is read from the bytes, never trusted from the request, and the
 * file name is generated, so nothing but an image can land in the folder and
 * nothing can land outside it.
 */
function store_upload(array $body): string
{
    $data = isset($body['data']) && is_string($body['data']) ? base64_decode($body['data'], true) : false;
    if ($data === false || $data === '') {
        throw new RuntimeException('The upload was empty.');
    }
    if (strlen($data) > 8 * 1024 * 1024) {
        throw new RuntimeException('That image is larger than 8 MB.');
    }

    $info = @getimagesizefromstring($data);
    $types = [IMAGETYPE_JPEG => 'jpg', IMAGETYPE_PNG => 'png', IMAGETYPE_WEBP => 'webp', IMAGETYPE_GIF => 'gif'];
    if ($info === false || !isset($types[$info[2]])) {
        throw new RuntimeException('Use a JPG, PNG, WebP or GIF image.');
    }
    $ext = $types[$info[2]];

    $stem = strtolower((string) preg_replace('/\.[^.]+$/', '', (string) ($body['name'] ?? 'image')));
    $stem = trim((string) preg_replace('/[^a-z0-9]+/', '-', $stem), '-');
    $stem = substr($stem !== '' ? $stem : 'image', 0, 60);
    $file = $stem . '-' . bin2hex(random_bytes(3));

    $dir = uploads_dir();
    if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
        throw new RuntimeException('Could not create the uploads folder on the server.');
    }
    // Belt and braces: even a file that slipped through could never run here.
    $guard = dirname($dir) . '/.htaccess';
    if (!is_file($guard)) {
        file_put_contents($guard, "Options -Indexes\n<FilesMatch \"\\.(?i:php\\d?|phtml|phar)$\">\n  Require all denied\n</FilesMatch>\n");
    }

    // Large photos are resized and re-encoded as WebP when the host's GD can;
    // GIFs are kept as they are so animation survives.
    if ($ext !== 'gif' && function_exists('imagecreatefromstring') && function_exists('imagewebp')) {
        $image = @imagecreatefromstring($data);
        if ($image !== false) {
            $width  = imagesx($image);
            $height = imagesy($image);
            if ($width > 1920) {
                $scaled = imagescale($image, 1920, (int) round($height * 1920 / $width), IMG_BICUBIC);
                if ($scaled !== false) {
                    imagedestroy($image);
                    $image = $scaled;
                }
            }
            imagepalettetotruecolor($image);
            imagealphablending($image, true);
            imagesavealpha($image, true);
            $path = $dir . '/' . $file . '.webp';
            $ok   = imagewebp($image, $path, 80);
            imagedestroy($image);
            if ($ok) {
                return '/uploads/blog/' . $file . '.webp';
            }
        }
    }

    if (file_put_contents($dir . '/' . $file . '.' . $ext, $data, LOCK_EX) === false) {
        throw new RuntimeException('Could not save the image on the server.');
    }

    return '/uploads/blog/' . $file . '.' . $ext;
}

/**
 * The uploaded images the articles use, plus any paths that are referenced in
 * content but are unavailable on this host. A missing file must stop the
 * publish before it creates a Git commit: otherwise the static build fails
 * later with a much less useful error.
 *
 * @param array $blog The decoded content/blog.json.
 */
function referenced_uploads(array $blog): array
{
    $found = [];
    $missing = [];
    foreach ($blog as $post) {
        $text = (string) ($post['cover'] ?? '') . ' ' . (string) ($post['body'] ?? '');
        if (preg_match_all('#/uploads/blog/([a-z0-9-]+\.(?:webp|jpg|png|gif))#', $text, $matches)) {
            foreach ($matches[1] as $name) {
                $file = uploads_dir() . '/' . $name;
                if (is_file($file)) {
                    $found['public/uploads/blog/' . $name] = $file;
                } else {
                    $missing['/uploads/blog/' . $name] = true;
                }
            }
        }
    }
    return ['files' => $found, 'missing' => array_keys($missing)];
}

/* ------------------------------------------------------------------
   Routing
------------------------------------------------------------------ */

$action    = isset($_GET['action']) ? (string) $_GET['action'] : '';
$method    = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$signedIn  = !empty($_SESSION['signed_in']);

if ($action === 'session' && $method === 'GET') {
    reply(200, ['signedIn' => $signedIn]);
}

if ($action === 'login' && $method === 'POST') {
    $state = throttle_state();
    $wait  = $state['until'] - time();

    if ($wait > 0) {
        reply(429, ['ok' => false, 'error' => 'Too many attempts. Try again in ' . $wait . 's.']);
    }

    $password = request_body()['password'] ?? '';

    if (!is_string($password) || !verify_password($password, ADMIN_PASSWORD_HASH)) {
        $state['failures']++;
        // The first few are free — typos are normal. After that it climbs.
        $state['until'] = $state['failures'] > 3
            ? time() + min(60, 2 ** ($state['failures'] - 3))
            : 0;
        throttle_write($state);
        reply(401, ['ok' => false, 'error' => 'That password is not right.']);
    }

    throttle_write(['failures' => 0, 'until' => 0]);
    session_regenerate_id(true);
    $_SESSION['signed_in'] = true;
    reply(200, ['ok' => true]);
}

if ($action === 'logout' && $method === 'POST') {
    $_SESSION = [];
    session_destroy();
    reply(200, ['ok' => true]);
}

if (!$signedIn) {
    reply(401, ['ok' => false, 'error' => 'Sign in first.']);
}

if ($action === 'content' && $method === 'GET') {
    $result = [];

    /** Reads a file or stops with the reason it could not be read. */
    $load = function (string $path) use (&$result) {
        $value = read_repo_file($path, $result);
        if ($value === null) {
            reply(502, ['ok' => false, 'errors' => [github_error($result, 'read ' . $path)]]);
        }
        return $value;
    };

    $site = $load('content/site.json');

    $pages = [];
    foreach ($site['routes'] as $route) {
        $pages[$route['key']] = $load('content/pages/' . $route['key'] . '.json');
    }

    $catalogFile = __DIR__ . '/catalog.json';
    $catalog = is_file($catalogFile)
        ? json_decode((string) file_get_contents($catalogFile), true)
        : null;

    $content = [
        'site'         => $site,
        'pages'        => $pages,
        'services'     => $load('content/services.json'),
        'platforms'    => $load('content/platforms.json'),
        'testimonials' => $load('content/testimonials.json'),
        'projects'     => $load('content/projects.json'),
        // Absent until the first article is committed, which is not an error.
        'blog'         => read_repo_file('content/blog.json', $result) ?? [],
        'catalog'      => is_array($catalog) ? $catalog : ['icons' => [], 'images' => []],
        // The preview pane points at the live site.
        'siteUrl'      => rtrim($site['site']['url'], '/'),
    ];

    reply(200, $content);
}

if ($action === 'content' && $method === 'PUT') {
    $next   = request_body();
    $errors = validate($next);

    if ($errors) {
        reply(422, ['ok' => false, 'errors' => $errors]);
    }

    write_draft($next);
    reply(200, ['ok' => true, 'draft' => true]);
}

if (($action === 'publish' || $action === 'commit') && $method === 'POST') {
    $next = $action === 'commit' ? request_body() : read_draft();
    if ($next === null) {
        reply(422, ['ok' => false, 'code' => 422, 'output' => 'There is no saved draft to publish.']);
    }

    $errors = validate($next);
    if ($errors) {
        reply(422, ['ok' => false, 'code' => 422, 'output' => implode("\n", $errors)]);
    }

    // One commit for the whole publish, through the Git Data API: a file-at-a-time
    // write would leave the repository half-updated if a later call failed.
    $files = [
        'content/site.json'         => $next['site'],
        'content/services.json'     => $next['services'],
        'content/platforms.json'    => $next['platforms'],
        'content/testimonials.json' => $next['testimonials'],
        'content/projects.json'     => $next['projects'],
    ];
    if (isset($next['blog']) && is_array($next['blog'])) {
        $files['content/blog.json'] = array_values($next['blog']);
    }
    foreach ($next['site']['routes'] as $route) {
        $files['content/pages/' . $route['key'] . '.json'] = $next['pages'][$route['key']];
    }

    $repo = '/repos/' . ADMIN_GITHUB_REPO;

    $ref = github('GET', $repo . '/git/ref/heads/' . ADMIN_GITHUB_BRANCH);
    if ($ref['status'] !== 200) {
        reply(502, ['ok' => false, 'errors' => [github_error($ref, 'read the branch')]]);
    }
    $headSha = $ref['body']['object']['sha'];

    $head = github('GET', $repo . '/git/commits/' . $headSha);
    if ($head['status'] !== 200) {
        reply(502, ['ok' => false, 'errors' => [github_error($head, 'read the latest commit')]]);
    }
    $baseTree = $head['body']['tree']['sha'];

    $tree = [];
    foreach ($files as $path => $value) {
        // PHP pretty-prints with four spaces; Prettier — which formats these
        // files everywhere else — uses two. Halving the indentation keeps a
        // save to the lines that actually changed, instead of rewriting every
        // file and burying the edit in whitespace.
        $json = json_encode($value, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        $json = preg_replace_callback(
            '/^ +/m',
            static function (array $match): string {
                return str_repeat(' ', intdiv(strlen($match[0]), 2));
            },
            $json
        ) . "\n";

        $blob = github('POST', $repo . '/git/blobs', ['content' => $json, 'encoding' => 'utf-8']);
        if ($blob['status'] !== 201) {
            reply(502, ['ok' => false, 'errors' => [github_error($blob, 'store ' . $path)]]);
        }

        $tree[] = ['path' => $path, 'mode' => '100644', 'type' => 'blob', 'sha' => $blob['body']['sha']];
    }

    // Every image a post references is written into this Git tree, including
    // an image with the same name as a previous upload. This is deliberate:
    // it guarantees the exact bytes the article currently uses are present in
    // the source that Hostinger builds, rather than trusting a directory list
    // from an earlier Git revision.
    $uploads = referenced_uploads($next['blog'] ?? []);
    if ($uploads['missing']) {
        reply(422, [
            'ok' => false,
            'errors' => [
                'These blog images are not available on the server. Upload them again before committing: '
                . implode(', ', $uploads['missing']),
            ],
        ]);
    }
    foreach ($uploads['files'] as $path => $file) {
        $bytes = file_get_contents($file);
        if ($bytes === false) {
            reply(500, ['ok' => false, 'errors' => ['Could not read uploaded blog image: ' . basename($file)]]);
        }
        $blob = github('POST', $repo . '/git/blobs', [
            'content'  => base64_encode($bytes),
            'encoding' => 'base64',
        ]);
        if ($blob['status'] !== 201) {
            reply(502, ['ok' => false, 'errors' => [github_error($blob, 'store ' . $path)]]);
        }
        $tree[] = ['path' => $path, 'mode' => '100644', 'type' => 'blob', 'sha' => $blob['body']['sha']];
    }

    $newTree = github('POST', $repo . '/git/trees', ['base_tree' => $baseTree, 'tree' => $tree]);
    if ($newTree['status'] !== 201) {
        reply(502, ['ok' => false, 'errors' => [github_error($newTree, 'build the commit')]]);
    }

    $commit = github('POST', $repo . '/git/commits', [
        'message' => "Update site content\n\nEdited in the content admin.",
        'tree'    => $newTree['body']['sha'],
        'parents' => [$headSha],
    ]);
    if ($commit['status'] !== 201) {
        reply(502, ['ok' => false, 'errors' => [github_error($commit, 'create the commit')]]);
    }

    $update = github('PATCH', $repo . '/git/refs/heads/' . ADMIN_GITHUB_BRANCH, [
        'sha' => $commit['body']['sha'],
    ]);
    if ($update['status'] !== 200) {
        reply(502, ['ok' => false, 'errors' => ['GitHub: someone else saved first. Reload and try again.']]);
    }

    clear_draft();
    reply(200, [
        'ok'     => true,
        'code'   => 0,
        'output' => "Committed to GitHub. The deployment will start automatically from the push.\n\n"
            . 'Progress: https://github.com/' . ADMIN_GITHUB_REPO . '/actions',
    ]);
}

if ($action === 'upload' && $method === 'POST') {
    try {
        reply(200, ['ok' => true, 'url' => store_upload(request_body())]);
    } catch (RuntimeException $error) {
        reply(422, ['ok' => false, 'error' => $error->getMessage()]);
    }
}

if ($action === 'build' && $method === 'POST') {
    $result = github('POST', '/repos/' . ADMIN_GITHUB_REPO . '/actions/workflows/' . ADMIN_GITHUB_WORKFLOW . '/dispatches', [
        'ref'    => ADMIN_GITHUB_BRANCH,
        'inputs' => ['reason' => 'Published from the content admin'],
    ]);

    if ($result['status'] !== 204) {
        reply(200, [
            'ok'     => false,
            'code'   => $result['status'],
            'output' => github_error($result, 'start the build'),
        ]);
    }

    reply(200, [
        'ok'     => true,
        'code'   => 0,
        'output' => "The build has started.\n\nIt usually takes about two minutes. "
            . "The site updates on its own when it finishes — you can close this window.\n\n"
            . 'Progress: https://github.com/' . ADMIN_GITHUB_REPO . '/actions',
    ]);
}

reply(404, ['ok' => false, 'error' => 'Unknown request.']);
