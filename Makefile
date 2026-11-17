install:
	npm install

build:
	npm run build

start:
	npx start-server -s ./dist

.PHONY: install build start
