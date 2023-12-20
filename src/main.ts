import * as _ from 'npm:radash'
import * as async from 'https://deno.land/std/async/mod.ts'
import * as ntfy from './ntfy.ts'
import * as ollama from './ollama.ts'
import * as soundcloud from './soundcloud.ts'
import * as spotify from './spotify.ts'
import * as utils from './utils.ts'
import dayjs from 'npm:dayjs'
import ms from 'npm:pretty-ms'
import { yt, search } from './youtube.ts'

while (true) {
	const followings = await Promise.all([
		spotify.followings().then((v) => v.map((vv) => vv.name)),
		soundcloud.followings().then((v) => v.filter((vv) => vv.verified).map((vv) => vv.username)),
	])
	let artists = _.unique(followings.flat(), (v) => utils.minify(v))
	artists = artists.filter((v) => {
		const artist = v.toLowerCase()
		if (artist.includes(' record')) return false
		return true
	})
	artists = _.alphabetical(artists, (v) => v)
	// console.log('artists ->', artists)

	if (Deno.env.get('NODE_ENV') == 'development') {
		artists = _.shuffle(['LSDREAM', 'Mersiv', 'Liquid Stranger', 'Zeds Dead'])
		artists = artists.slice(-1)
		artists = ['Mersiv']
	}

	for (const artist of artists) {
		console.warn('artist ->', artist)
		const results = await search(artist)
		console.log('results ->', results)

		for (const result of results) {
			console.log('result ->', result)
			// break

			const isConcert = await ollama.isConcert(result)
			console.log('isConcert ->', isConcert)

			break

			await ntfy.publish({
				topic: artist,
				title: `[${artist}] ${result.title}`,
				message: `${ms(result.duration)}`,
				...(result.thumbnail && { attach: result.thumbnail }),
				...(result.author.thumbnail && { icon: result.author.thumbnail }),
			})
		}

		// await async.delay(utils.irregular(new Date(0).setSeconds(5)))
	}

	if (Deno.env.get('NODE_ENV') == 'development') {
		break
	}
}
