# Injector2

Injector2 is a browser extension (mainly aimed at Chrome) replacing the previous Injector app.

It allows to write scripts that will be run on every or only some websites.

# Features

- Inject custom JS in any website
- Split your code in multiple modules using standard `import` and even NPM packages!
- Full support for TypeScript (with strict options enabled)
- Use any file editor to manage your scripts
- Create and edit your scripts with 100% typing support in VSCode

**Note:** due to transitioning to Manifest V3, the extension will need to be rebuild (using a single command) and reloaded into your browser each time you modify the script. This allows though more flexibility on the code side, such as using a TypeScript toolchain, bundling NPM dependencies and minifying the generated scripts.

# Setup

1. Clone this repository
2. Run `pnpm i` (requires to have pnpm installed, if not run `npm i -g pnpm` beforehand)
3. Modify anything you want inside the [`scripts`](sripts/) folder (the recommanded way is to create a TypeScript file for each domain in `scripts/domains` and list them in `scripts/domains/map.ts`).
4. Run `pnpm build`
5. Load the produced `Injector2.zip` file inside your browser (or the whole directory if you're on Chrome)

# Directory structure

In the `scripts` folder you'll find two files: `inject.ts`, which is injected on each page at load and refresh, and `lib.ts` which contains some useful utilities to write scripts easily.

The injection script depends on the `scripts/domains/_map.ts` which is private (it's your own file) and should export by default a `Record<string, string>` with keys being domains and values being `() => Promise<void>` callbacks.

Example:

```typescript
// file: scripts/domain/_map.ts

export default {
    // note that we don't write 'www.' here, the script will be run on every subdomain no matter what happens
    // if you want to run your logic on a single subdomain, it's up to you to configure it that way
    'google.com': async () => {
        alert('Hello world!')
    }
}
```

This will display an alert box when you visit `google.com`.

Now when you have lots of domains, it's easier to split the logic into modules. You can go like this:

```typescript
// file: scripts/domains/google.com.ts

export default async () => {
    alert('Hello world!')
}
```

```typescript
// file: scripts/domains/_map.ts

import module_google_com from './google.com'

// Helps to ensure we export the correct type...
import { domainsMap } from '../lib'

// ...otherwise it will throw a compile-time error here
export default domainsMap({
    'google.com': module_google_com
})
```

And voilà! Just run `pnpm build` and you'll get a `.zip` extension to load into your browser (exactly the same as an `.xpi`).
