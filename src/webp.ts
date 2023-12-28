import * as _ from 'npm:radash'
import * as base64 from 'https://deno.land/std/encoding/base64.ts'
import * as fs from 'https://deno.land/std/fs/mod.ts'
import * as path from 'https://deno.land/std/path/mod.ts'
import * as utils from './utils.ts'
import cache_dir from 'https://deno.land/x/dir/cache_dir/mod.ts'
import ForOfStatement from 'https://esm.sh/v135/jintr@1.1.0/dist/nodes/ForOfStatement.js'
import { YoutubeSearchResult } from './youtube.ts'

const CACHE_DIR = path.join(cache_dir()!, 'concerts/webp')
await fs.emptyDir(CACHE_DIR)

export async function extractBase64s(result: YoutubeSearchResult) {
	const dirpath = `${CACHE_DIR}/${result.id}`
	await fs.emptyDir(dirpath)

	const base64s = await _.all({
		thumbnail: toBase64s(result.thumbnail, dirpath),
		rich_thumbnail: toBase64s(result.rich_thumbnail, dirpath),
	})

	await Deno.remove(dirpath, { recursive: true })

	return base64s
}

async function toBase64s(thumbnail = '', dirpath: string) {
	const base64s = [] as string[]
	if (!thumbnail) {
		return base64s
	}

	const filename = new URL(thumbnail).pathname.replaceAll('/', '')
	const filepath = `${dirpath}/${filename}`
	const framepaths = [] as string[]

	try {
		const res = await fetch(thumbnail)
		if (!res.body) {
			console.warn('!res.body ->', thumbnail)
			return base64s
		}
		const qfile = await Deno.open(filepath, { write: true, create: true })
		await res.body.pipeTo(qfile.writable)
		await _.sleep(100)

		const { success, stdout, stderr } = await new Deno.Command('webpmux', {
			args: ['-info', filepath],
		}).output()
		if (!success) {
			throw new Error(`!success webpmux -info -> ${new TextDecoder().decode(stderr)}`)
		}
		const info = new TextDecoder().decode(stdout)
		if (info.includes('animation')) {
			const iframes = Number.parseInt(info.match(/frames: (?<iframes>\d+)/)?.groups?.iframes!)
			for (const i of _.range(1, iframes)) {
				const framepath = `${dirpath}/frame_${i}_${filename}`
				const { success, stdout, stderr } = await new Deno.Command('webpmux', {
					args: ['-get', 'frame', `${i}`, filepath, '-o', framepath],
				}).output()
				if (!success) {
					console.warn('!success webpmux -get ->', new TextDecoder().decode(stderr))
					continue
				}
				framepaths.push(framepath)
			}
		} else {
			framepaths.push(filepath)
		}

		for (const framepath of framepaths) {
			const pngpath = `${framepath}.png`
			const { success, stdout, stderr } = await new Deno.Command('dwebp', {
				args: [framepath, '-o', pngpath],
			}).output()
			if (!success) {
				console.warn('!success dwebp ->', new TextDecoder().decode(stderr))
				continue
			}
			const pngfile = await Deno.readFile(pngpath)
			base64s.push(base64.encodeBase64(pngfile))
		}
	} catch (error) {
		console.error('catch ->', error)
	}
	return base64s
}
