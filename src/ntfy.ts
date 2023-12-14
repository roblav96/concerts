export async function publish(body: NtfyPublishBody) {
	await fetch('https://concerts.bassnectar.video', {
		method: 'POST',
		body: JSON.stringify(body),
	})
}

export interface NtfyPublishBody {
	actions?: {
		action?: string
		label?: string
		url?: string
	}[]
	attach?: string
	click?: string
	delay?: string
	filename?: string
	icon?: string
	message: string
	priority?: number
	tags?: string[]
	title: string
	topic: string
}
