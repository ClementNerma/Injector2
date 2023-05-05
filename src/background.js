
/** List of protocols the service can operate on */
const SUPPORTED_PROTOCOLS = ["http", "https", "ftp", "sftp", "file"]

chrome.tabs.onUpdated.addListener(async (tabId, _, tab) => {
    if (!tab.url) {
        console.debug("Encountered tab without URL (probably a browser internal page)")
        return
    }

    const match = tab.url.match(/^([a-zA-Z]+):\/\/\/?([^\/]+)(?=$|\/.*$)/)

    if (!match) {
        console.debug(`Failed to parse domain name for URL: ${tab.url} (probably an internal URL)`)
        return
    }

    const [, protocol, _domain] = match

    if (!SUPPORTED_PROTOCOLS.includes(protocol)) {
        console.debug(`Ignoring script injection for unsupported protocol "${protocol}"`)
        return
    }

    // Special handling for local files
    const domain = protocol === "file" ? "_files" : _domain

    console.debug(`Matched URL "${tab.url}" as domain "${domain}"`)

    const beforeFetching = Date.now()

    const scriptRes = await fetch('http://localhost:1235', { cache: 'no-store' })

    if (!scriptRes.ok) {
        throw new Error("Failed to fetch injector's entrypoint!")
    }

    const scriptText = await scriptRes.text()

    const scripts = JSON.parse(scriptText)

    const injectionCode = `
        (() => {
            const __INJECTOR_ALREADY_RUN_VARNAME = '__injector_already_run'

            if (!window[__INJECTOR_ALREADY_RUN_VARNAME]) {
                window[__INJECTOR_ALREADY_RUN_VARNAME] = true;

                (function __injector_bootstrap() {
                    const __beforeFetching = ${beforeFetching}
                    const __injectorFiles = ${JSON.stringify(scripts)}
                    const __injectorEntrypoint = 'entrypoint.js'

                    if (!__injectorFiles.hasOwnProperty(__injectorEntrypoint)) {
                        throw new Error("Injector's entrypoint file not found!")
                    }

                    const __injectorEntrypointItem = __injectorFiles[__injectorEntrypoint]

                    if (!('type' in __injectorEntrypointItem)) {
                        throw new Error("Injector's entrypoint is invalid!")
                    }
                    
                    if (__injectorEntrypointItem.type !== 'file') {
                        throw new Error("Injector's entrypoint is not a file!")
                    }

                    eval("function __injector_entrypoint() { " + __injectorEntrypointItem.content + "\\n}\\n__injector_entrypoint()")
                })()
            }
        })()
    `

    chrome.tabs.executeScript(tabId, {
        code: injectionCode,
        runAt: 'document_start'
    })

    console.debug(`Injected script for domain "${domain}"`)
})