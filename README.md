# Injector2

Injector2 is a browser extension (mainly aimed at Chrome) replacing the previous Injector app.

It allows to write scripts that will be run on every or only some websites.

# Features

- Inject custom JS scripts in any website
- Split your code in multiple modules using `require()`
- JS with full typing support through JSDoc (and a [`jsconfig.json`](scripts/jsconfig.json) file)
- Use any file editor to manage your scripts
- Create and edit your scripts with 100% typing support in VSCode
- No need to reload the extension when the scripts are modified

# Setup

1. Clone this repository
2. Run in the background the [`server/index.js`](server/index.js) script
3. Load the cloned repository as an extension in your browser
4. Enjoy!

# Directory structure

All website scripts go into the `scripts/domains` directory. One file per domain, without the subdomain (e.g. `google.com.js`).

Each script is recommended to be written as `runModuleAnonymous(module, async () => { /* your code goes here */ })`

Note that you can `require()` scripts anywhere in the `scripts` directory, like Node.js, and use `module.exports = /* whatever */`# Injector2

Injector2 is a browser extension (mainly aimed at Chrome) replacing the previous Injector app.

It allows to write scripts that will be run on every or only some websites.

# Setup

1. Clone this repository
2. Run in the background the [`server/index.js`](server/index.js) script
3. Load the cloned repository as an extension in your browser
4. Enjoy!

# Directory structure

All website scripts go into the `scripts/domains` directory. One file per domain, without the subdomain (e.g. `google.com.js`).

Each script is recommended to be written as `runModuleAnonymous(module, async () => { /* your code goes here */ })`

Note that you can `require()` scripts anywhere in the `scripts` directory, like Node.js, and use `module.exports = /* whatever */`.

There can also be two special domain files: `_files.js` which will run on `file:///` URLs ; and `_generic.js` which will run on every single website.

Also note that all scripts import the content of [`include/lib.js`](scripts/include/lib.js) as well as [`include/prelude.js`](scripts/include/prelude.js) before they start.
