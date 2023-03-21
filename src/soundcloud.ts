export const followings = (
	JSON.parse(Deno.readTextFileSync('./data/soundcloud.json')) as SoundCloudFollowing[]
).filter((v) => v.verified)

export interface SoundCloudFollowing {
	avatar_url: string
	badges: {
		pro: boolean
		pro_unlimited: boolean
		verified: boolean
	}
	city: string
	comments_count: number
	country_code: string
	created_at: string
	creator_subscription: {
		product: {
			id: string
		}
	}
	creator_subscriptions: {
		product: {
			id: string
		}
	}[]
	description: string
	first_name: string
	followers_count: number
	followings_count: number
	full_name: string
	groups_count: number
	id: number
	kind: string
	last_modified: string
	last_name: string
	likes_count: number
	permalink: string
	permalink_url: string
	playlist_count: number
	playlist_likes_count: number
	reposts_count: string
	station_permalink: string
	station_urn: string
	track_count: number
	uri: string
	urn: string
	username: string
	verified: boolean
	visuals: {
		enabled: boolean
		tracking: string
		urn: string
		visuals: {
			entry_time: number
			urn: string
			visual_url: string
		}[]
	}
}
