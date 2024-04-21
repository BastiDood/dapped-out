# Dapped Out!

_Dapped Out!_ is a timing-based casino game for the Solana blockchain. The objective of the game is simple: try to press a button as close to a targeted marker as possible. The closest contestant to the target wins the greatest share in the contested pot.

_Dapped Out!_ accepts any valid token in the Solana blockchain as a currency for each contest. When creating a new contest, simply point it to the mint account of the token being transacted. For convenience, it is also possible to create (only) one brand new program-derived user-generated token instead. The creator has the privilege of minting new supply as well as transferring tokens to other wallets.

Users may now join the existing contest by staking some tokens into the shared pot. As mentioned earlier, they now try their luck in timing the meter as closely as possible. At any point in the future, the contest host may close the contest to finally distribute the winnings in proportion to the accuracy of each contestant.

## Development

> [!IMPORTANT]
> _Dapped Out!_ uses [pnpm] (via [Corepack] for [Node.js]) as its package and workspace manager.

[Corepack]: https://github.com/nodejs/corepack
[Node.js]: https://nodejs.org/

For the user interface, _Dapped Out!_ uses the [SvelteKit] framwork for full-stack web development with JavaScript. To add a cherry on top, _Dapped Out!_ features an installable [progressive web application][pwa].

[SvelteKit]: https://kit.svelte.dev/
[pwa]: https://web.dev/explore/progressive-web-apps
[pnpm]: https://pnpm.io/

### Formatters

```bash
# Check formatting
pnpm --filter=dapped-anchor fmt
pnpm --filter=dapped-sveltekit fmt

# Apply suggestions from formatter
pnpm --filter=dapped-anchor fmt:fix
pnpm --filter=dapped-sveltekit fmt:fix
```

### Linters

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

### Program Compilation

```bash
# Compile the program and its TypeScript types
pnpm --filter=dapped-anchor build

# Run unit tests
pnpm --filter=dapped-anchor test
```

### User Interface

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
