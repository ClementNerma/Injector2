import { domains } from './map'

function innerRun() {
	const retypedWindow = window as unknown as Record<string, unknown>
	retypedWindow[alreadyRun] = true

	async function runDomainScript(domain: string): Promise<void> {
		if (!Object.prototype.hasOwnProperty.call(domains, domain)) {
			console.debug(`Missing domain script: ${domain}`)
			return
		}

		console.debug(`Running domain script: ${domain}`)
		await domains[domain]()
	}

	runDomainScript('_generic')
	runDomainScript(location.hostname.split('.').slice(-2).join('.'))
}

const alreadyRun = '__ALREADY_RUN_VAR'

if (!(alreadyRun in window)) {
	innerRun()
}
