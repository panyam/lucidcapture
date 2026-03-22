"""
Debug the full Lucid Capture flow with the Chrome extension loaded in Playwright's Chromium.
Playwright bundles its own Chromium — no MDM policies apply.
"""
import time
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

EXTENSION_PATH = str(Path(__file__).parent.parent / "extension")
APP_URL = "http://localhost:5173"
TEST_SITE = "https://example.com"


def test_full_extension_flow():
    with sync_playwright() as p:
        # Launch Chromium with the extension loaded
        context = p.chromium.launch_persistent_context(
            user_data_dir="",
            headless=False,
            args=[
                f"--disable-extensions-except={EXTENSION_PATH}",
                f"--load-extension={EXTENSION_PATH}",
            ],
        )

        # Wait for extension service worker to register
        bg = None
        for attempt in range(10):
            sw = context.service_workers
            for w in sw:
                if "background" in w.url:
                    bg = w
                    break
            if bg:
                break
            time.sleep(1)
            # Opening a page can trigger the service worker
            if attempt == 2:
                p_temp = context.new_page()
                p_temp.goto("https://example.com")
                time.sleep(1)
                p_temp.close()

        print(f"\nService workers: {len(context.service_workers)}")
        for w in context.service_workers:
            print(f"  - {w.url}")

        if not bg:
            print("ERROR: Extension background service worker not found!")
            context.close()
            return

        # Get extension ID from service worker URL
        ext_id = bg.url.split("//")[1].split("/")[0]
        print(f"Extension ID: {ext_id}")

        # ═══════════════════════════════════════════
        # STEP 1: Verify app loads
        # ═══════════════════════════════════════════
        page = context.new_page()
        print("\n=== 1. App Landing Page ===")
        page.goto(APP_URL)
        page.wait_for_load_state("networkidle")
        print(f"  Title: {page.title()}")

        # ═══════════════════════════════════════════
        # STEP 2: Navigate to test site
        # ═══════════════════════════════════════════
        print("\n=== 2. Navigate to test site ===")
        page.goto(TEST_SITE)
        page.wait_for_load_state("networkidle")
        print(f"  URL: {page.url}")

        # ═══════════════════════════════════════════
        # STEP 3: Start recording via service worker
        # ═══════════════════════════════════════════
        print("\n=== 3. Start recording ===")

        # Send START_RECORDING to the content script via the background
        # First, trigger start via the service worker
        tab_id = bg.evaluate("""async () => {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            return tab?.id;
        }""")
        print(f"  Active tab ID: {tab_id}")

        # Use the exposed test helper to call startRecording directly
        bg.evaluate("() => globalThis.__lucid.startRecording()")
        time.sleep(1)

        # Check if recording indicator appeared
        indicator = page.locator("#lucid-capture-indicator")
        indicator_visible = indicator.is_visible()
        print(f"  Recording indicator visible: {indicator_visible}")
        if indicator_visible:
            print(f"  Indicator text: {indicator.text_content()}")

        page.screenshot(path="tests/screenshots/01_recording_started.png")
        print("  Screenshot: 01_recording_started.png")

        # ═══════════════════════════════════════════
        # STEP 4: Click on elements
        # ═══════════════════════════════════════════
        print("\n=== 4. Simulate clicks ===")

        clicks = [
            ("h1", "heading"),
            ("p", "paragraph"),
            ("a", "link"),
        ]

        for selector, label in clicks:
            el = page.locator(selector).first
            if el.is_visible():
                el.click()
                time.sleep(1)  # Wait for screenshot capture
                print(f"  Clicked: {label}")
            else:
                print(f"  Skipped: {label} (not visible)")

        page.screenshot(path="tests/screenshots/02_after_clicks.png")
        print("  Screenshot: 02_after_clicks.png")

        # Check how many steps the background has captured
        step_count = bg.evaluate("""() => {
            return globalThis.__lucid.getSession()?.steps?.length ?? 0;
        }""")
        print(f"  Steps captured in background: {step_count}")

        # ═══════════════════════════════════════════
        # STEP 5: Stop recording
        # ═══════════════════════════════════════════
        print("\n=== 5. Stop recording ===")

        # Stop recording and check for errors
        stop_result = bg.evaluate("""async () => {
            try {
                await globalThis.__lucid.stopRecording();
                return { ok: true };
            } catch (e) {
                return { ok: false, error: e.message, stack: e.stack };
            }
        }""")
        print(f"  Stop result: {stop_result}")

        # Also check storage to see if pendingSession was saved
        storage_check = bg.evaluate("""async () => {
            const result = await chrome.storage.local.get('pendingSession');
            const ps = result.pendingSession;
            if (!ps) return { found: false };
            return { found: true, stepCount: ps.steps?.length ?? 0, id: ps.id };
        }""")
        print(f"  Storage check: {storage_check}")

        # Wait for the new editor tab to open
        time.sleep(2)

        # The stop function opens a new tab — wait for it
        for attempt in range(10):
            all_pages = context.pages
            editor_found = any("/editor/" in p_tab.url for p_tab in all_pages)
            if editor_found:
                break
            time.sleep(1)

        # ═══════════════════════════════════════════
        # STEP 6: Check editor import
        # ═══════════════════════════════════════════
        print("\n=== 6. Editor import ===")
        all_pages = context.pages
        print(f"  Total tabs: {len(all_pages)}")
        for i, p_tab in enumerate(all_pages):
            print(f"    Tab {i}: {p_tab.url}")

        editor_page = None
        for p_tab in all_pages:
            if "/editor/" in p_tab.url:
                editor_page = p_tab
                break

        if editor_page:
            editor_page.bring_to_front()
            time.sleep(3)  # Wait for import
            editor_page.wait_for_load_state("networkidle")
            print(f"  Editor URL: {editor_page.url}")

            # Did it redirect from /import to /editor/<uuid>?
            if "/editor/import" in editor_page.url:
                print("  WARNING: Still on /editor/import — import may have failed")
                time.sleep(3)
                print(f"  URL after extra wait: {editor_page.url}")

            # Check for step counter
            step_text = editor_page.locator("text=/\\d+ \\/ \\d+/").first
            if step_text.is_visible():
                print(f"  Step counter: {step_text.text_content()}")
            else:
                print("  Step counter: NOT VISIBLE")

            # Check for screenshot
            img = editor_page.locator("img[alt^='Step']").first
            if img.is_visible():
                print("  Screenshot in editor: YES")
            else:
                print("  Screenshot in editor: NO")

            # Check timeline
            timeline = editor_page.locator("text=/Timeline/").first
            if timeline.is_visible():
                print(f"  Timeline: {timeline.text_content()}")
            else:
                print("  Timeline: NOT VISIBLE")

            # Check current step info in sidebar
            step_info = editor_page.locator("text=/Current Step/").first
            if step_info.is_visible():
                print("  Sidebar step info: YES")
            else:
                print("  Sidebar step info: NO")

            editor_page.screenshot(path="tests/screenshots/03_editor_imported.png")
            print("  Screenshot: 03_editor_imported.png")

            # ═══════════════════════════════════════════
            # STEP 7: Navigate steps
            # ═══════════════════════════════════════════
            print("\n=== 7. Step navigation ===")
            next_btn = editor_page.locator("text=skip_next").first
            prev_btn = editor_page.locator("text=skip_previous").first

            if next_btn.is_visible():
                next_btn.click()
                time.sleep(0.5)
                step_text2 = editor_page.locator("text=/\\d+ \\/ \\d+/").first
                if step_text2.is_visible():
                    print(f"  After next: {step_text2.text_content()}")
                editor_page.screenshot(path="tests/screenshots/04_step_2.png")
                print("  Screenshot: 04_step_2.png")
            else:
                print("  Next button not visible — may have 0 or 1 steps")

            # ═══════════════════════════════════════════
            # STEP 8: Dashboard
            # ═══════════════════════════════════════════
            print("\n=== 8. Dashboard ===")
            editor_page.goto(f"{APP_URL}/dashboard")
            editor_page.wait_for_load_state("networkidle")
            time.sleep(1)

            imported_card = editor_page.locator("text=Imported Arcade")
            print(f"  'Imported Arcade' visible: {imported_card.is_visible()}")

            editor_page.screenshot(path="tests/screenshots/05_dashboard.png")
            print("  Screenshot: 05_dashboard.png")
        else:
            print("  ERROR: No editor tab found!")

        # ═══════════════════════════════════════════
        print("\n" + "=" * 50)
        print("FLOW TEST COMPLETE — check tests/screenshots/")
        print("=" * 50)

        try:
            input("\nPress Enter to close browser...")
        except EOFError:
            time.sleep(5)

        context.close()


if __name__ == "__main__":
    os.makedirs("tests/screenshots", exist_ok=True)
    test_full_extension_flow()
