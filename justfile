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
