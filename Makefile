.PHONY: dev test lint build seed

dev:
	docker compose up

test:
	npm --prefix server test
	npm --prefix web test

lint:
	npm --prefix server run lint
	npm --prefix server run typecheck
	npm --prefix web run lint
	npm --prefix web run typecheck

build:
	npm --prefix server run build
	npm --prefix web run build

seed:
	npm --prefix server run seed
