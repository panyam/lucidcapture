.PHONY: dev build ext ext-watch ext-zip sync clean gh-pages godev gobuild

NUM_LINKED_GOMODS=$(shell cat go.mod 2>/dev/null | grep -v "^//" | grep replace | wc -l | sed -e "s/ *//g")

# ── React App (existing) ──

dev:
	cd app && pnpm run dev

build:
	cd app && pnpm run build

# ── Go Stack App ──

run:
	go run ./cmd/server

godev:
	cd cmd/server && go run .

gobuild:
	go build -o ./bin/lucidcapture ./cmd/server

# ── Chrome Extension ──

ext:
	cd extension && pnpm run build

ext-watch:
	cd extension && pnpm run watch

ext-zip: ext
	cd extension && zip -r ../lucid-capture-extension.zip manifest.json popup/ dist/ icons/ -x "*.DS_Store"
	@echo "Created lucid-capture-extension.zip"

# ── Stitch Design Sync ──

sync:
	./stitch-sync/sync.sh all

sync-manifest:
	./stitch-sync/sync.sh manifest

# ── Deploy ──

deploy: build
	@cp docs/privacy.html app/dist/privacy.html
	cd app && gcloud app deploy app.yaml --project=lucidcapture --quiet
	@echo "Deployed! https://lucidcapture.appspot.com"

godeploy: checklinks gobuild
	@echo "TODO: Deploy Go stack to App Engine"

gh-pages:
	@echo "Deploying privacy policy to gh-pages..."
	@rm -rf /tmp/lucid-gh-pages
	@cp -r docs /tmp/lucid-gh-pages
	@cd /tmp/lucid-gh-pages && \
		touch .nojekyll && \
		git init && \
		git add -A && \
		git commit -m "Deploy to GitHub Pages" && \
		git branch -M gh-pages && \
		git remote add origin git@panyam-github:panyam/lucidcapture.git && \
		git push -f origin gh-pages
	@rm -rf /tmp/lucid-gh-pages
	@echo "Privacy policy: https://panyam.github.io/lucidcapture/privacy.html"

# ── Setup ──

install:
	cd app && pnpm install
	cd extension && pnpm install

resymlink:
	mkdir -p locallinks
	rm -Rf locallinks/*
	cd locallinks && ln -s ~/newstack

checklinks:
	@if [ x"${NUM_LINKED_GOMODS}" != "x0" ]; then	\
		echo "You are trying to deploy with symlinks. Remove them first and make sure versions exist" && false ;	\
	fi

# ── Clean ──

clean:
	rm -rf app/dist extension/dist lucid-capture-extension.zip
	rm -rf gen ts/gen
	rm -rf bin

cleanall: clean
	cd protos ; make cleanall
