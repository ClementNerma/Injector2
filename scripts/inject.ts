import { domains } from './map'

async function runDomainScript(domain: string): Promise<void> {
	if (!Object.prototype.hasOwnProperty.call(domains, domain)) {
		console.debug(`Missing domain script: ${domain}`)
		return
	}

	console.debug(`Running domain script: ${domain}`)
	await domains[domain]()
}

const alreadyRun = '__ALREADY_RUN_VAR'

if (!(alreadyRun in window)) {
	const assignableWindow = window as unknown as Record<string, unknown>
	assignableWindow[alreadyRun] = true

	runDomainScript('_generic')
	runDomainScript(location.hostname.split('.').slice(-2).join('.'))
}
