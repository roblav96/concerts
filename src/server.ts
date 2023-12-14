import * as spotify from './spotify.ts'
import { router, HandlerContext } from 'https://deno.land/x/rutt/mod.ts'
import { STATUS_CODE, STATUS_TEXT } from 'https://deno.land/std/http/status.ts'

const routes = router<Ctx>(
    {
        ...spotify.routes,

        '/favicon.ico': (req, ctx) => new Response(),
    },
    {
        errorHandler: (req, ctx, error: any) => {
            console.error('errorHandler ->', req.method, req.url, error)
            return new Response(error?.message ?? null, {
                status: STATUS_CODE.InternalServerError,
                statusText: STATUS_TEXT[STATUS_CODE.InternalServerError],
            })
        },
        otherHandler: (req, ctx) => {
            console.warn('otherHandler ->', req.method, req.url)
            return new Response(null, {
                status: STATUS_CODE.NotFound,
                statusText: STATUS_TEXT[STATUS_CODE.NotFound],
            })
        },
    },
)

Deno.serve(
    {
        ...(!Deno.env.get('DENO_DEPLOYMENT_ID') && { port: 46349 }),
    },
    async (req, ctx) => {
        const CORS = {
            'access-control-allow-headers': '*',
            'access-control-allow-methods': '*',
            'access-control-allow-origin': '*',
        }

        if (req.method == 'OPTIONS') {
            return new Response(null, {
                headers: new Headers(CORS),
                status: STATUS_CODE.NoContent,
                statusText: STATUS_TEXT[STATUS_CODE.NoContent],
            })
        }

        const res = await routes(req, ctx)

        for (const [key, value] of Object.entries(CORS)) {
            res.headers.set(key, value)
        }

        return res
    },
)

export type Ctx = {}
export type Handler = (
    req: Request,
    ctx: HandlerContext<Ctx>,
    match: Record<string, string>,
) => Response | Promise<Response>
