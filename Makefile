.PHONY: dev build ext ext-watch ext-zip sync clean

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

# Setup
install:
	cd app && pnpm install
	cd extension && pnpm install

# Clean
clean:
	rm -rf app/dist extension/dist
