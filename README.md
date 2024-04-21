# Development

> [!IMPORTANT]
> _Dapped Out!_ uses [pnpm] (via [Corepack] for [Node.js]) as its package and workspace manager.

[Corepack]: https://github.com/nodejs/corepack
[Node.js]: https://nodejs.org/

For the user interface, _Dapped Out!_ uses the [SvelteKit] framwork for full-stack web development with JavaScript. To add a cherry on top, _Dapped Out!_ features an installable [progressive web application][pwa].

[SvelteKit]: https://kit.svelte.dev/
[pwa]: https://web.dev/explore/progressive-web-apps
[pnpm]: https://pnpm.io/

## Formatters

```bash
# Check formatting
pnpm --filter=dapped-anchor fmt
pnpm --filter=dapped-sveltekit fmt

# Apply suggestions from formatter
pnpm --filter=dapped-anchor fmt:fix
pnpm --filter=dapped-sveltekit fmt:fix
```

## Linters

```bash
# ESLint
pnpm --filter=dapped-anchor lint:js
pnpm --filter=dapped-sveltekit lint:js

# LintHTML
pnpm --filter=dapped-sveltekit lint:html

# Stylelint
pnpm --filter=dapped-sveltekit lint:css

# Svelte Check
pnpm --filter=dapped-sveltekit lint:svelte
```

## Program Compilation

```bash
# Compile the program and its TypeScript types
pnpm --filter=dapped-anchor build

# Run unit tests
pnpm --filter=dapped-anchor test
```

## User Interface

| **Environment Variable**    | **Description**                                    |
| --------------------------- | -------------------------------------------------- |
| `PUBLIC_DEPLOYMENT_ADDRESS` | The address of the program deployment.             |
| `PUBLIC_SOLANA_RPC`         | The JSON RPC API endpoint for Solana interactions. |

```bash
# Generate SvelteKit's TypeScript types
pnpm --filter=dapped-sveltekit sync

# Start the dev server (with hot module replacement)
pnpm --filter=dapped-sveltekit dev

# Build the optimized version of the app
pnpm --filter=dapped-sveltekit build

# Host the application locally as if it were in production
pnpm --filter=dapped-sveltekit preview
```
