
import * as _ from 'npm:radash'
import * as async from 'https://deno.land/std/async/mod.ts'
import { Innertube, UniversalCache, YTNodes } from 'https://deno.land/x/youtubei/deno.ts'
import { clean, irregular, minify } from './utils.ts'
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

const playlist = await yt.getPlaylist('PLsG-QjVBPxJtazkSMGvf8geIFJsP2ky2A')
// console.log('playlist ->', playlist)

for (const artist of artists.slice(2, 3)) {
	console.warn('artist ->', artist)
	// await async.delay(irregular(3000))
	const search = await yt.search(clean(artist), {
		type: 'video',
		sort_by: 'upload_date',
		// duration: 'long',
	})
	const results = ((search.results ?? []) as YTNodes.Video[]).filter((v) => {
		console.log('v.duration ->', v.duration, v)
		return
	})
	results.forEach((v) => console.log('result ->', v))
}

// const search = await yt.search('cool customer', {
// 	type: 'video',
// 	sort_by: 'upload_date',
// 	// duration: 'long',
// })
// const results = search.results as any as soundcloud.Following
