---
name: troubleshoot-dev-proxy
description: >-
  Troubleshoots common issues with the helpdesk-web-app proxy development
  environment. Use when the user encounters errors starting mitmproxy, the dev
  server, pnpm install failures, port conflicts, or says things like "proxy
  isn't working", "can't start dev", "port in use", or "pnpm install failed".
---
# Troubleshoot Dev Proxy

This skill helps diagnose and fix common issues with the proxy development environment.

The dev proxy setup is automated by `scripts/dev-proxy-setup.sh`, which pulls latest main, installs deps, starts mitmproxy (`scripts/helpdesk_dev_proxy.py` on port 8000), and runs `pnpm dev:proxy` on port 8080.

## Step 1: Run the script

**Always start by actually running the script** and reading its output. Do NOT skip this step or just suggest the user run it — run it yourself:

```bash
bash scripts/dev-proxy-setup.sh 2>&1
```

Use a timeout of 120 seconds. The script may take a while due to `pnpm install`.

## Step 2: Read the output and diagnose

Read the output from the script execution. The error will be in the logs. Use the actual error message to determine which troubleshooting section below applies.

If the script succeeds, tell the user it's running and where to access the app (`https://acme.gorgias.docker:8080/`).

---

## Troubleshooting

### pnpm install fails

This usually happens because the GitHub personal access token has expired. The token is needed to access private `@gorgias` packages.

Tell the user to regenerate their token:

1. Go to **GitHub > Settings > Developer settings > Personal access tokens > Tokens (classic)**
2. Generate a new token with these scopes: **`repo`** and **`read:packages`**
3. Run the login command (suggest the user runs this themselves since it's interactive):
   ```
   npm login --registry=https://npm.pkg.github.com --scope=@gorgias
   ```
4. Enter their GitHub username, the new token as password, and their public email
5. Verify that `~/.npmrc` contains `@gorgias:registry=https://npm.pkg.github.com`
6. Retry `pnpm install`

### Port is busy

Before starting mitmproxy (port 8000) or the dev server (port 8080), check if the port is in use:

```bash
lsof -i :<port>
```

If a process is using the port:
1. Show the user which process is occupying the port (PID, process name)
2. Ask the user if it's OK to kill that process
3. Only if the user confirms, kill it with `kill <PID>`
4. Proceed with starting the service

### mitmproxy not found

If `mitmproxy` is not installed, tell the user to install it:

```bash
brew install mitmproxy
```

After installation, the user may need to trust the mitmproxy CA certificate. Run:

```bash
mitmproxy
```

Then quit (`q` + `y`) and install the certificate from `~/.mitmproxy/mitmproxy-ca-cert.pem` into the system keychain.

### Dev server won't start

Common causes:

1. **Node version mismatch** — Check `.nvmrc` or `package.json` engines field and ensure the correct Node version is active (`node -v`).
2. **Stale build artifacts** — Try `pnpm clean` or removing `node_modules` and reinstalling.
3. **Missing environment variables** — Check if `.env` or `.env.local` is required and properly configured.
4. **Webpack/build errors** — Read the error output carefully. Often a missing dependency or type error. Run `pnpm typecheck @repo/helpdesk` to surface type issues.
