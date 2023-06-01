import domainModule_22pixx from './domains/22pixx.xyz'
import domainModule__files from './domains/_files'
import domainModule__generic from './domains/_generic'
import domainModule_caanoo from './domains/caanoo.forumactif.org'
import domainModule_downloads from './domains/downloads.khinsider.com'
import domainModule_gameblog from './domains/gameblog.fr'
import domainModule_literotica from './domains/literotica.com'
import domainModule_localhost from './domains/localhost'
import domainModule_meta from './domains/meta.superuser.com'
import domainModule_minimachines from './domains/minimachines.net'
import domainModule_mypenname3000 from './domains/mypenname3000.com'
import domainModule_news from './domains/news.ycombinator.com'
import domainModule_nhentai from './domains/nhentai.net'
import domainModule_nyaa from './domains/nyaa.si'
import domainModule_open from './domains/open-consoles.com'
import domainModule_reddit from './domains/reddit.com'
import domainModule_redgifs from './domains/redgifs.com'
import domainModule_scriptbin from './domains/scriptbin.works'
import domainModule_soundgasm from './domains/soundgasm.net'
import domainModule_sukebei from './domains/sukebei.nyaa.si'
import domainModule_superuser from './domains/superuser.com'
import domainModule_twitch from './domains/twitch.tv'
import domainModule_yggtorrent from './domains/yggtorrent.la'
import domainModule_youtube from './domains/youtube.com'

export const domains: Record<string, () => Promise<void>> = {
	'22pixx.xyz': domainModule_22pixx,
	_files: domainModule__files,
	_generic: domainModule__generic,
	'caanoo.forumactif.org': domainModule_caanoo,
	'downloads.khinsider.com': domainModule_downloads,
	'gameblog.fr': domainModule_gameblog,
	'literotica.com': domainModule_literotica,
	localhost: domainModule_localhost,
	'meta.superuser.com': domainModule_meta,
	'minimachines.net': domainModule_minimachines,
	'mypenname3000.com': domainModule_mypenname3000,
	'news.ycombinator.com': domainModule_news,
	'nhentai.net': domainModule_nhentai,
	'nyaa.si': domainModule_nyaa,
	'open-consoles.com': domainModule_open,
	'reddit.com': domainModule_reddit,
	'redgifs.com': domainModule_redgifs,
	'scriptbin.works': domainModule_scriptbin,
	'soundgasm.net': domainModule_soundgasm,
	'sukebei.nyaa.si': domainModule_sukebei,
	'superuser.com': domainModule_superuser,
	'twitch.tv': domainModule_twitch,
	'yggtorrent.la': domainModule_yggtorrent,
	'youtube.com': domainModule_youtube,
}
