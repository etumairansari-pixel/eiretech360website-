<?php
/**
 * The content admin's backend, for the deployed site.
 *
 * Hostinger runs PHP, not Node, so this stands in for scripts/admin-server.mjs
 * once the site is live. It holds no content of its own: it reads the same
 * files from GitHub, commits changes back, and asks the build workflow to
 * publish them. Nothing is stored on the web host, so there is nothing here to
 * drift out of step with the repository.
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

    foreach ([['services', 'services'], ['platforms', 'platforms'], ['testimonials', 'testimonials']] as $pair) {
        if (!isset($next[$pair[0]]) || !is_array($next[$pair[0]])) {
            $errors[] = $pair[1] . ' must be a list';
        }
    }

    foreach ($next['services'] ?? [] as $service) {
        $need($service['title'] ?? null, 'A service title');
    }
    foreach ($next['platforms'] ?? [] as $group) {
        $need($group['title'] ?? null, 'A platform group title');
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

    return $errors;
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

    reply(200, [
        'site'         => $site,
        'pages'        => $pages,
        'services'     => $load('content/services.json'),
        'platforms'    => $load('content/platforms.json'),
        'testimonials' => $load('content/testimonials.json'),
        'catalog'      => is_array($catalog) ? $catalog : ['icons' => [], 'images' => []],
        // The preview pane points at the live site.
        'siteUrl'      => rtrim($site['site']['url'], '/'),
    ]);
}

if ($action === 'content' && $method === 'PUT') {
    $next   = request_body();
    $errors = validate($next);

    if ($errors) {
        reply(422, ['ok' => false, 'errors' => $errors]);
    }

    // One commit for the whole save, through the Git Data API: a file-at-a-time
    // write would leave the repository half-updated if a later call failed.
    $files = [
        'content/site.json'         => $next['site'],
        'content/services.json'     => $next['services'],
        'content/platforms.json'    => $next['platforms'],
        'content/testimonials.json' => $next['testimonials'],
    ];
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
        // Two spaces and a trailing newline: the same shape Prettier leaves,
        // so a save does not show up as a whitespace change.
        $json = json_encode($value, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        $json = preg_replace('/^(  +)/m', '$1', $json) . "\n";

        $blob = github('POST', $repo . '/git/blobs', ['content' => $json, 'encoding' => 'utf-8']);
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

    reply(200, ['ok' => true]);
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
