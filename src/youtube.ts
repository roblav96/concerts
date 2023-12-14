import * as _ from 'npm:radash'
import * as fs from 'https://deno.land/std/fs/mod.ts'
import * as path from 'https://deno.land/std/path/mod.ts'
import * as utils from './utils.ts'
import cache_dir from 'https://deno.land/x/dir/cache_dir/mod.ts'
import dayjs from 'npm:dayjs'
import objectSupport from 'npm:dayjs/plugin/objectSupport.js'
import { Innertube, UniversalCache, YTNodes } from 'https://deno.land/x/youtubei/deno.ts'

dayjs.extend(objectSupport)

const yt = await Innertube.create({
	retrieve_player: false,
	cache: new UniversalCache(true, path.join(cache_dir()!, 'concerts/youtubei')),
})

yt.session.on('auth-pending', (data) => {
	console.warn('[youtube] auth-pending ->', data)
})
yt.session.on('auth', ({ credentials }) => {
	// console.info('[youtube] auth ->', credentials)
})
yt.session.on('update-credentials', async ({ credentials }) => {
	console.info('[youtube] update-credentials ->', credentials)
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
	artist = utils.clean(artist)
	// const suggestions = await yt.getSearchSuggestions(artist)
	// console.log('suggestions ->', suggestions)
	const search = await yt.search(artist, {
		type: 'video',
		sort_by: 'upload_date',
		duration: 'long',
	})
	artist = utils.slugify(artist)
	const results = ((search.results ?? []) as YTNodes.Video[]).filter((v) => {
		const seconds = v.duration?.seconds
		if (!Number.isFinite(seconds) || seconds * 1000 < new Date(0).setMinutes(30)) {
			return false
		}
		if (!utils.slugify(v.title.text).includes(artist)) {
			return false
		}
		return true
	})
	// results.forEach((v) => console.log('result ->', v))
	// return results
	return results.map((v) => {
		const [int, unit] = v.published.text!.split(' ')
		return {
			id: v.id,
			title: v.title.text!,
			description: v.description,
			duration: v.duration.seconds * 1000,
			thumbnail: v.best_thumbnail?.url,
			rich_thumbnail: ((v.rich_thumbnail as any as any[]) ?? [])[0]?.url,
			views: utils.parseInt(v.view_count.text!.split(' ')[0]),
			published: dayjs()
				.subtract({ [unit]: Number.parseInt(int) })
				.toDate(),
			author: {
				id: v.author.id,
				name: v.author.name,
				url: v.author.url,
				thumbnail: v.author.best_thumbnail?.url,
			},
		}
	})
}

// console.log('playlist ->', playlist)

// const search = await yt.search('cool customer', {
// 	type: 'video',
// 	sort_by: 'upload_date',
// 	// duration: 'long',
// })
// const results = search.results as any as soundcloud.Following
