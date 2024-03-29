// The shape of 'domains' should be a `Record<string, string>`
// where the keys are domain names (not including subdomains, e.g. `google.com` but not `www.google.com`)
// and the associated value is an asynchronous callback returning nothing (() => Promise<void>)
import domains from './domains/_map'

async function runDomainScript(domain: string): Promise<boolean> {
	if (!Object.prototype.hasOwnProperty.call(domains, domain)) {
		console.debug(`Missing domain script: ${domain}`)
		return false
	}

	console.debug(`Running domain script: ${domain}`)
	await domains[domain]()
	return true
}

const alreadyRun = '__ALREADY_RUN_VAR'

if (!(alreadyRun in window)) {
	const assignableWindow = window as unknown as Record<string, unknown>
	assignableWindow[alreadyRun] = true

	runDomainScript('_generic')

	if (location.protocol === 'file:') {
		runDomainScript('_files')
	} else {
		runDomainScript(location.hostname.split('.').slice(-2).join('.')).then(scriptExists => {
			if (!scriptExists) {
				runDomainScript(location.hostname)
			}
		})
	}
}
