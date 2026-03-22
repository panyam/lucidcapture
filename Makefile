.PHONY: dev build ext ext-watch ext-zip sync clean gh-pages

# App
dev:
	cd app && pnpm run dev

build:
	cd app && pnpm run build

# Chrome Extension
ext:
	cd extension && pnpm run build

ext-watch:
	cd extension && pnpm run watch

ext-zip: ext
	cd extension && zip -r ../lucid-capture-extension.zip manifest.json popup/ dist/ icons/ -x "*.DS_Store"
	@echo "Created lucid-capture-extension.zip"

# Stitch Design Sync
sync:
	./stitch-sync/sync.sh all

sync-manifest:
	./stitch-sync/sync.sh manifest

# GitHub Pages — builds the app + includes privacy policy
gh-pages: build
	@echo "Preparing GitHub Pages deploy..."
	@rm -rf /tmp/lucid-gh-pages
	@cp -r app/dist /tmp/lucid-gh-pages
	@cp docs/privacy.html /tmp/lucid-gh-pages/privacy.html
	@cd /tmp/lucid-gh-pages && \
		touch .nojekyll && \
		cp index.html 404.html && \
		git init && \
		git add -A && \
		git commit -m "Deploy to GitHub Pages" && \
		git branch -M gh-pages && \
		git remote add origin git@panyam-github:panyam/lucidcapture.git && \
		git push -f origin gh-pages
	@rm -rf /tmp/lucid-gh-pages
	@echo "Deployed!"
	@echo "  App:     https://panyam.github.io/lucidcapture/"
	@echo "  Privacy: https://panyam.github.io/lucidcapture/privacy.html"

# Setup
install:
	cd app && pnpm install
	cd extension && pnpm install

# Clean
clean:
	rm -rf app/dist extension/dist lucid-capture-extension.zip
