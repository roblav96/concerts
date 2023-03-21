import type { SetRequired } from 'https://cdn.skypack.dev/type-fest?dts'
import { getStdin } from 'https://deno.land/x/get_stdin/mod.ts'
import { OAuth2Client, Tokens } from 'https://deno.land/x/oauth2_client/mod.ts'

export async function followings() {
	const items = [] as SpotifyArtist[]
	let next = 'https://api.spotify.com/v1/me/following?type=artist&limit=50&locale=*'
	while (next) {
		const { artists } = (await (
			await fetch(next, {
				headers: { Authorization: `Bearer ${await authorization()}` },
			})
		).json()) as { artists: SpotifyApiResponse<SpotifyArtist> }
		items.push(...artists.items)
		next = artists.next
	}
	return items
}

export interface SpotifyArtist {
	external_urls: {
		spotify: string
	}
	followers: {
		href: string
		total: number
	}
	genres: string[]
	href: string
	id: string
	images: {
		height: number
		url: string
		width: number
	}[]
	name: string
	popularity: number
	type: string
	uri: string
}

interface SpotifyApiResponse<T> {
	cursors: {
		after: string
	}
	href: string
	items: T[]
	limit: number
	next: string
	total: number
}

interface SpotifyToken extends SetRequired<Tokens, keyof Tokens> {
	expiresAt: number
}

const db = {
	key: 'spotify_auth_state',
	get: () => {
		return JSON.parse(localStorage.getItem(db.key) ?? (null as any)) as SpotifyToken | null
	},
	set: (token: SpotifyToken) => {
		token.expiresAt = Date.now() + token.expiresIn * 1000
		localStorage.setItem(db.key, JSON.stringify(token))
	},
}

const oauth = new OAuth2Client({
	clientId: Deno.env.get('SPOTIFY_CLIENT_ID')!,
	clientSecret: Deno.env.get('SPOTIFY_CLIENT_SECRET')!,
	redirectUri: Deno.env.get('SPOTIFY_REDIRECT_URI')!,
	authorizationEndpointUri: 'https://accounts.spotify.com/authorize',
	tokenUri: 'https://accounts.spotify.com/api/token',
	defaults: { scope: 'user-follow-read' },
})

async function authorization() {
	let token = db.get()
	if (!token) {
		const { codeVerifier, uri } = await oauth.code.getAuthorizationUri()
		console.log('getAuthorizationUri ->', uri.toString())
		console.warn('authResponseUri:')
		const authResponseUri = await getStdin()
		Deno.stdout.write(new TextEncoder().encode('\n'))
		token = (await oauth.code.getToken(authResponseUri, { codeVerifier })) as SpotifyToken
		console.info('oauth.code.getToken ->', token)
		db.set(token)
	} else if (Date.now() > token.expiresAt) {
		token = (await oauth.refreshToken.refresh(token.refreshToken)) as SpotifyToken
		console.info('oauth.refreshToken.refresh ->', token)
		db.set(token)
	}
	return token.accessToken
}
