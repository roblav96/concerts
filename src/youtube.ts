import * as _ from 'npm:radash'
import * as path from 'https://deno.land/std/path/mod.ts'
import * as utils from './utils.ts'
import cache_dir from 'https://deno.land/x/dir/cache_dir/mod.ts'
import dayjs from 'npm:dayjs'
import objectSupport from 'npm:dayjs/plugin/objectSupport.js'
import type { AsyncReturnType, IterableElement } from 'npm:type-fest'
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

export async function getPlaylistVideos() {
	const videos = [] as YTNodes.PlaylistVideo[]
	let playlist = await yt.getPlaylist('PLsG-QjVBPxJtazkSMGvf8geIFJsP2ky2A')
	// let playlist = await yt.getPlaylist('PLsG-QjVBPxJtY7iTS3AEOLw4DdRbkkywB')
	// let playlist = await yt.getPlaylist('PLsG-QjVBPxJuQ98Nvo_wDAsNwxppDBQTQ')
	while (playlist.videos.length > 0) {
		videos.push(...(playlist.videos as YTNodes.PlaylistVideo[]))
		try {
			playlist = await playlist.getContinuation()
		} catch {
			break
		}
	}
	return videos
}
export async function addPlaylistVideo(id: string) {
	await yt.playlist.addVideos('PLsG-QjVBPxJtazkSMGvf8geIFJsP2ky2A', [id])
}

export async function search(artist: string) {
	artist = utils.clean(artist)
	// const suggestions = await yt.getSearchSuggestions(artist)
	// console.log('suggestions ->', suggestions)
	const search = await yt.search(artist, {
		type: 'video',
		sort_by: 'upload_date',
		// duration: 'long',
	})
	const results = ((search.results ?? []) as YTNodes.Video[]).filter((v) => {
		const seconds = v.duration?.seconds
		if (!Number.isFinite(seconds) || seconds < new Date(0).setMinutes(30) / 1000) {
			return false
		}
		if (!utils.slugify(v.title.text).includes(utils.slugify(artist))) {
			return false
		}
		return true
	})
	// console.log('results ->', JSON.parse(JSON.stringify(results)))
	// results.forEach((v) =>
	// 	console.log(
	// 		'result ->',
	// 		_.omit(v, [
	// 			'author',
	// 			'badges',
	// 			'endpoint',
	// 			'expandable_metadata',
	// 			'menu',
	// 			'snippets',
	// 			'thumbnail_overlays',
	// 		]),
	// 	),
	// )
	return results.map((v) => {
		let published = new Date(NaN)
		if (v.published.text) {
			const [int, unit] = v.published.text!.split(' ')
			published = dayjs()
				.subtract({ [unit]: Number.parseInt(int) })
				.toDate()
		}
		const rich_thumbnail = ((v.rich_thumbnail as any as any[]) ?? [])[0]?.url
		return {
			id: v.id,
			url: `https://youtu.be/${v.id}`,
			title: v.title.text!,
			description: v.description,
			duration: v.duration.seconds * 1000,
			thumbnail: v.best_thumbnail?.url,
			rich_thumbnail: rich_thumbnail as string | undefined,
			views: utils.parseInt((v.view_count.text ?? '').split(' ')[0]),
			published,
			author: {
				id: v.author.id,
				name: v.author.name,
				url: v.author.url,
				thumbnail: v.author.best_thumbnail?.url,
			},
		}
	})
}
export type YoutubeSearchResult = IterableElement<AsyncReturnType<typeof search>>

// console.log('playlist ->', playlist)

// const search = await yt.search('cool customer', {
// 	type: 'video',
// 	sort_by: 'upload_date',
// 	// duration: 'long',
// })
// const results = search.results as any as soundcloud.Following
