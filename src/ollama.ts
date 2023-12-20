import * as _ from 'npm:radash'
import * as webp from './webp.ts'
import pMap from 'npm:p-map'
import { Ollama } from 'npm:langchain/llms/ollama'
import { YoutubeSearchResult } from './youtube.ts'

export async function isConcert(result: YoutubeSearchResult) {
	const base64s = await webp.extractBase64s(result)
	if (base64s.rich_thumbnail.length > 0) {
		const images = _.cluster(
			_.shuffle(base64s.rich_thumbnail),
			Math.ceil(base64s.rich_thumbnail.length / 2),
		)[0]
		const answers = await _.map(images, async (image) => check(image))
		console.log('answers ->', answers)
		const yeses = answers.filter((v) => v.toLowerCase().includes('yes'))
		return yeses.length / answers.length >= 0.75
	}
	if (base64s.thumbnail.length > 0) {
		return (await check(base64s.thumbnail[0])).toLowerCase().includes('yes')
	}
	return false
}

async function check(image: string) {
	const res = await fetch('http://localhost:11434/api/generate', {
		method: 'POST',
		body: JSON.stringify({
			model: 'bakllava',
			prompt: 'is this live music?',
			// prompt: 'is this a live music concert?',
			images: [image],
			stream: false,
			// options: {
			// 	temperature: 0.2,
			// },
		}),
	})
	const json = (await res.json()) as OllamaGenerateResponse
	return json.response.trim()
	// let content = ''
	// if (!res.body) {
	// 	console.warn('!res.body')
	// 	return content
	// }
	// for await (const chunk of res.body) {
	// 	const json = JSON.parse(new TextDecoder().decode(chunk))
	// 	if (!json.done) {
	// 		content += json.response
	// 	}
	// }
	// return content.trim()
}

interface OllamaGenerateResponse {
	context: number[]
	created_at: string
	done: boolean
	eval_count: number
	eval_duration: number
	load_duration: number
	model: string
	prompt_eval_count: number
	prompt_eval_duration: number
	response: string
	total_duration: number
}
