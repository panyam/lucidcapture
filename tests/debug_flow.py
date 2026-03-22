"""Debug the Lucid Capture extension flow in Firefox using Playwright."""
import time
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

EXTENSION_PATH = str(Path(__file__).parent.parent / "extension")
APP_URL = "http://localhost:5173"
TEST_SITE = "https://example.com"


def test_full_flow():
    with sync_playwright() as p:
        # Launch Firefox with the extension loaded as a temporary add-on
        browser = p.firefox.launch(
            headless=False,
            args=[],
        )
        context = browser.new_context()

        # First, let's test the app pages work
        page = context.new_page()

        # 1. Landing page
        print("\n=== 1. Landing Page ===")
        page.goto(APP_URL)
        page.wait_for_load_state("networkidle")
        title = page.title()
        print(f"  Title: {title}")
        hero = page.locator("h1").first.text_content()
        print(f"  Hero: {hero}")

        # 2. Navigate to dashboard
        print("\n=== 2. Dashboard ===")
        page.goto(f"{APP_URL}/dashboard")
        page.wait_for_load_state("networkidle")
        heading = page.locator("h1").first.text_content()
        print(f"  Heading: {heading}")

        # Check create new card exists
        create_btn = page.locator("text=Create New Arcade")
        print(f"  Create New Arcade button visible: {create_btn.is_visible()}")

        # 3. Click Create New → should go to editor
        print("\n=== 3. Create New Arcade ===")
        create_btn.click()
        page.wait_for_url("**/editor/**", timeout=5000)
        print(f"  URL after create: {page.url}")

        # 4. Check editor loads
        print("\n=== 4. Editor ===")
        page.wait_for_load_state("networkidle")
        # Check for the empty state message
        empty_msg = page.locator("text=Use the Chrome extension").or_(
            page.locator("text=No steps captured")
        )
        if empty_msg.first.is_visible():
            print(f"  Empty state message: {empty_msg.first.text_content()}")
        else:
            print("  No empty state message found")

        # Check sidebar exists
        sidebar = page.locator("text=Editor Tools")
        print(f"  Editor Tools sidebar visible: {sidebar.is_visible()}")

        # Check timeline exists
        timeline = page.locator("text=Timeline")
        print(f"  Timeline visible: {timeline.is_visible()}")

        # 5. Go back to dashboard, check the project was created
        print("\n=== 5. Dashboard after create ===")
        page.goto(f"{APP_URL}/dashboard")
        page.wait_for_load_state("networkidle")
        time.sleep(1)  # let IndexedDB load

        # Look for "Untitled Arcade" card
        untitled = page.locator("text=Untitled Arcade")
        print(f"  Untitled Arcade card visible: {untitled.is_visible()}")

        # Count projects
        step_labels = page.locator("text=steps").all()
        print(f"  Project cards with step counts: {len(step_labels)}")

        # 6. Test the /editor/import route without extension data
        print("\n=== 6. Import route (no extension data) ===")
        page.goto(f"{APP_URL}/editor/import")
        page.wait_for_load_state("networkidle")
        time.sleep(2)
        print(f"  URL after import (should redirect): {page.url}")

        # Take a screenshot of final state
        page.screenshot(path="tests/debug_dashboard.png")
        print("\n  Screenshot saved to tests/debug_dashboard.png")

        print("\n=== Flow test complete ===")
        input("\nPress Enter to close browser...")
        browser.close()


if __name__ == "__main__":
    test_full_flow()
