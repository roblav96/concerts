import 'https://raw.githubusercontent.com/roblav96/futon-media-iptv/main/src/console.ts'

import 'https://deno.land/std/dotenv/load.ts'
import * as _ from 'npm:radash'
import * as async from 'https://deno.land/std/async/mod.ts'
import * as soundcloud from './soundcloud.ts'
import * as spotify from './spotify.ts'
import dayjs from 'npm:dayjs'
import { clean, irregular, minify } from './utils.ts'

while (true) {
	let artists = soundcloud.followings.reduce(
		(artists, following) => {
			if (artists.some((v) => minify(v) == minify(following.username))) {
				return artists
			}
			return [...artists, following.username]
		},
		(await spotify.followings()).map((v) => v.name),
	)
	artists = artists.filter((v) => !v.toLowerCase().includes(' record'))
	artists = _.alphabetical(artists, (v) => v)
	console.log('artists ->', artists.length)
	if (Deno.env.get('NODE_ENV') == 'development') {
		break
	}
	await async.delay(irregular(new Date(0).setMinutes(1)))
}
