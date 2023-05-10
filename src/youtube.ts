import * as _ from 'npm:radash'
import * as async from 'https://deno.land/std/async/mod.ts'
import { Innertube, UniversalCache, YTNodes } from 'https://deno.land/x/youtubei/deno.ts'
import { clean, irregular, minify, slugify } from './utils.ts'
import * as fs from 'https://deno.land/std/fs/mod.ts'

const yt = await Innertube.create({
	retrieve_player: false,
	cache: new UniversalCache(false),
})

yt.session.on('auth-pending', (data) => {
	console.warn('[yt.session] auth-pending ->', data)
})
yt.session.on('auth', ({ credentials }) => {
	console.info('[yt.session] auth ->', credentials)
})
yt.session.on('update-credentials', async ({ credentials }) => {
	console.log('[yt.session] update-credentials ->', credentials)
	await yt.session.oauth.cacheCredentials()
})
await yt.session.signIn()
await yt.session.oauth.cacheCredentials()

export { yt }

export async function getPlaylist() {
	const playlist = await yt.getPlaylist('PLsG-QjVBPxJtazkSMGvf8geIFJsP2ky2A')
	return playlist
}

export async function search(artist: string) {
	artist = clean(artist)
	const search = await yt.search(artist, {
		type: 'video',
		sort_by: 'upload_date',
		// duration: 'long',
	})
	artist = slugify(artist)
	const results = ((search.results ?? []) as YTNodes.Video[]).filter((v) => {
		if (v.duration?.seconds < 600) {
			return false
		}
		if (!slugify(v.title.text).includes(artist)) {
			return false
		}
		return true
	})
	// results.forEach((v) => console.log('result ->', v))
	return results
}

// console.log('playlist ->', playlist)

// const search = await yt.search('cool customer', {
// 	type: 'video',
// 	sort_by: 'upload_date',
// 	// duration: 'long',
// })
// const results = search.results as any as soundcloud.Following
