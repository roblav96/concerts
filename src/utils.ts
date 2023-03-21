import * as _ from 'npm:radash'
import * as async from 'https://deno.land/std/async/mod.ts'

export function minify(value: string) {
	return _.trim(value.replace(/[^a-z\d]/gi, '').toLowerCase())
}

export function clean(value: string) {
	return _.trim(value.replace(/[^\x01-\xFF]/gi, ' '))
}

export function irregular(ms: number) {
	let [min, max] = [ms * Math.E * 0.1, ms]
	return Math.ceil(Math.floor(Math.random() * (max - min + 1)) + min)
}
