import { useState } from "react";
import { signIn } from "./api";

/**
 * The sign-in screen.
 *
 * Shown whenever the server says there is no session — on first load, after a
 * restart, and if a session expires mid-edit.
 */
export function Login({ onSignedIn }: { onSignedIn: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;

    setBusy(true);
    setError(null);

    const result = await signIn(password);
    setBusy(false);

    if (result.ok) {
      setPassword("");
      onSignedIn();
    } else {
      setPassword("");
      setError(result.error);
    }
  };

  return (
    <div className="grid h-full place-items-center p-6">
      <form onSubmit={submit} className="card w-full max-w-sm p-7">
        <h1 className="text-lg font-extrabold tracking-tight">Eire Tech — Content</h1>
        <p className="hint mt-1">Sign in to edit the site.</p>

        <div className="mt-6">
          <label className="label" htmlFor="admin-password">
            Password
          </label>
          <input
            id="admin-password"
            className="field"
            type="password"
            autoComplete="current-password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error ? (
          <p role="alert" className="mt-3 text-sm font-semibold text-bad">
            {error}
          </p>
        ) : null}

        <button type="submit" className="btn btn-primary mt-5 w-full" disabled={busy || !password}>
          {busy ? "Checking…" : "Sign in"}
        </button>

        <p className="hint mt-5">
          Forgotten it? Run <code className="font-mono">npm run admin:password</code> to set a new
          one.
        </p>
      </form>
    </div>
  );
}
