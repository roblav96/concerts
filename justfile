#!/usr/bin/env just --justfile
# https://github.com/casey/just

# set dotenv-load
set shell := ["bash", "-uc"]



install:
	fd -tf -e ts -E '*.d.ts' -X deno cache --unstable --no-check --reload

run main:
	-@setsid --fork fd -tf -e ts -E '*.d.ts' -X deno cache --unstable --no-check
	-@setsid --fork deno check --unstable --quiet {{main}}
	-@deno run --unstable --no-check --allow-all {{main}}

watch main:
	export NODE_ENV="development" && \
		watchexec --clear --restart --shell=bash --watch=src --exts=ts \
		-- 'echo "█ " && echo && just run {{main}}'

serve:
	just run src/mod.ts & \
		miniserve --verbose --header 'Cache-Control: no-cache, no-store, must-revalidate' --interfaces=127.0.0.1 --port=14023 dist
