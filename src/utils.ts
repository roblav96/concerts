import * as _ from 'npm:radash'
import * as async from 'https://deno.land/std/async/mod.ts'

export function trim(value = '') {
	return _.trim(value).replace(/\s+/g, ' ')
}

export function minify(value = '') {
	return trim(value.replace(/[^a-z\d]/gi, '').toLowerCase())
}

export function slugify(value = '') {
	return trim(value.replace(/[^a-z\d]/gi, ' ').toLowerCase())
}

export function clean(value = '') {
	return trim(value.replace(/[^\x01-\xFF]/gi, ' '))
}

export function irregular(ms: number) {
	let [min, max] = [ms * Math.E * 0.1, ms]
	return Math.ceil(Math.floor(Math.random() * (max - min + 1)) + min)
}

export function parseInt(value: string) {
	return Number.parseInt(value.replace(/[^\d]/g, ''))
}
