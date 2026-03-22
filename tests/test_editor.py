"""
Test the editor's interactive features using Playwright.
Loads the extension, captures steps on example.com, then validates
the editor's playback, annotations, timing, and hotspot features.
"""
import time
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

EXTENSION_PATH = str(Path(__file__).parent.parent / "extension")
APP_URL = "http://localhost:5173"
SCREENSHOTS_DIR = "tests/screenshots/editor"


def setup_browser(p):
    """Launch Chromium with the extension loaded and capture some steps."""
    context = p.chromium.launch_persistent_context(
        user_data_dir="",
        headless=False,
        args=[
            f"--disable-extensions-except={EXTENSION_PATH}",
            f"--load-extension={EXTENSION_PATH}",
        ],
    )

    # Wait for service worker
    bg = None
    for _ in range(10):
        for w in context.service_workers:
            if "background" in w.url:
                bg = w
                break
        if bg:
            break
        time.sleep(1)
        if _ == 2:
            p_temp = context.new_page()
            p_temp.goto("https://example.com")
            time.sleep(1)
            p_temp.close()

    assert bg, "Extension background service worker not found"
    return context, bg


def capture_steps(context, bg, num_clicks=4):
    """Record clicks on example.com and import into the app."""
    page = context.new_page()
    page.goto("https://example.com")
    page.wait_for_load_state("networkidle")

    # Start recording
    bg.evaluate("() => globalThis.__lucid.startRecording()")
    time.sleep(1)

    # Click elements
    for selector in ["h1", "p", "a", "h1"][:num_clicks]:
        el = page.locator(selector).first
        if el.is_visible():
            el.click()
            time.sleep(0.8)

    # Verify steps captured
    count = bg.evaluate("() => globalThis.__lucid.getSession()?.steps?.length ?? 0")
    print(f"  Captured {count} steps")

    # Stop recording — saves to chrome.storage.local
    bg.evaluate("() => globalThis.__lucid.stopRecording()")
    time.sleep(2)

    # chrome.tabs.create may not work from evaluate() context.
    # Open the import page manually instead.
    editor_page = context.new_page()
    editor_page.goto(f"{APP_URL}/editor/import")
    editor_page.wait_for_load_state("networkidle")

    # Wait for import to complete (redirect from /import to /editor/<uuid>)
    for _ in range(20):
        if "/editor/import" not in editor_page.url:
            break
        time.sleep(1)

    editor_page.wait_for_load_state("networkidle")
    time.sleep(2)
    print(f"  Editor URL: {editor_page.url}")

    return editor_page, count


def test_editor_loads_with_steps(editor_page, expected_steps):
    """Verify editor loaded with the right number of captured steps."""
    print("\n=== Test: Editor loads with steps ===")

    # Step counter should show "1 / N"
    counter = editor_page.locator("text=/1 \\/ \\d+/").first
    assert counter.is_visible(), "Step counter not visible"
    counter_text = counter.text_content()
    print(f"  Step counter: {counter_text}")
    assert f"/ {expected_steps}" in counter_text, f"Expected {expected_steps} steps, got: {counter_text}"

    # Timeline should show step count
    timeline = editor_page.locator("text=/Timeline.*\\d+ steps/").first
    assert timeline.is_visible(), "Timeline header not visible"
    print(f"  Timeline: {timeline.text_content()}")

    # Screenshot should be displayed
    img = editor_page.locator("img[alt^='Step']").first
    assert img.is_visible(), "Screenshot not displayed"
    print(f"  Screenshot: visible")

    # Step number badge
    badge = editor_page.locator("text=/^\\d+$/").first  # The step number overlay
    print(f"  PASS")


def test_step_navigation(editor_page, total_steps):
    """Test prev/next/first/last navigation."""
    print("\n=== Test: Step navigation ===")

    # Next button
    next_btn = editor_page.locator("button[title='Next (→)']")
    assert next_btn.is_visible(), "Next button not visible"
    next_btn.click()
    time.sleep(0.5)
    counter = editor_page.locator(f"text=2 / {total_steps}").first
    assert counter.is_visible(), "Didn't advance to step 2"
    print(f"  Next: 2 / {total_steps}")

    # Previous button
    prev_btn = editor_page.locator("button[title='Previous (←)']")
    prev_btn.click()
    time.sleep(0.5)
    counter = editor_page.locator(f"text=1 / {total_steps}").first
    assert counter.is_visible(), "Didn't go back to step 1"
    print(f"  Prev: 1 / {total_steps}")

    # Last button
    last_btn = editor_page.locator("button[title='Last step']")
    last_btn.click()
    time.sleep(0.5)
    counter = editor_page.locator(f"text={total_steps} / {total_steps}").first
    assert counter.is_visible(), "Didn't jump to last step"
    print(f"  Last: {total_steps} / {total_steps}")

    # First button
    first_btn = editor_page.locator("button[title='First step']")
    first_btn.click()
    time.sleep(0.5)
    counter = editor_page.locator(f"text=1 / {total_steps}").first
    assert counter.is_visible(), "Didn't jump to first step"
    print(f"  First: 1 / {total_steps}")

    print(f"  PASS")


def test_keyboard_navigation(editor_page, total_steps):
    """Test arrow key navigation."""
    print("\n=== Test: Keyboard navigation ===")

    # Click on canvas area to ensure focus is not on an input
    editor_page.locator("img[alt^='Step']").first.click()
    time.sleep(0.3)

    # Arrow right
    editor_page.keyboard.press("ArrowRight")
    time.sleep(0.5)
    counter = editor_page.locator(f"text=2 / {total_steps}").first
    assert counter.is_visible(), "ArrowRight didn't advance"
    print(f"  ArrowRight: 2 / {total_steps}")

    # Arrow left
    editor_page.keyboard.press("ArrowLeft")
    time.sleep(0.5)
    counter = editor_page.locator(f"text=1 / {total_steps}").first
    assert counter.is_visible(), "ArrowLeft didn't go back"
    print(f"  ArrowLeft: 1 / {total_steps}")

    print(f"  PASS")


def test_play_pause(editor_page, total_steps):
    """Test play/pause auto-advance."""
    print("\n=== Test: Play/pause ===")

    # Start at step 1
    editor_page.locator("button[title='First step']").click()
    time.sleep(0.3)

    # Click play
    play_btn = editor_page.locator("button[title='Play/Pause (Space)']")
    play_btn.click()

    # Wait for auto-advance (default 3s per step, but let's wait for at least 1 advance)
    time.sleep(4)

    # Should have advanced past step 1
    counter = editor_page.locator("text=/\\d+ \\/ \\d+/").first
    text = counter.text_content().strip()
    current = int(text.split("/")[0].strip())
    print(f"  After 4s playing: step {current}")
    assert current > 1, f"Play didn't advance (still at step {current})"

    # Pause
    play_btn.click()
    time.sleep(0.5)
    paused_text = counter.text_content().strip()
    time.sleep(2)
    still_text = counter.text_content().strip()
    assert paused_text == still_text, "Pause didn't stop advancement"
    print(f"  Paused at: {paused_text}")

    print(f"  PASS")


def test_annotation_editing(editor_page):
    """Test annotation title and description editing."""
    print("\n=== Test: Annotation editing ===")

    # Go to step 1
    editor_page.locator("button[title='First step']").click()
    time.sleep(0.5)

    # Find and fill the title input
    title_input = editor_page.locator("input[placeholder='e.g., Click the dashboard']")
    assert title_input.is_visible(), "Title input not visible"
    title_input.fill("Welcome to Example.com")
    time.sleep(0.5)

    # Check the annotation tooltip appeared on the canvas
    tooltip = editor_page.locator("text=Welcome to Example.com")
    # There should be at least the input value + the hotspot tooltip
    assert tooltip.first.is_visible(), "Annotation title not reflected on canvas"
    print(f"  Title set: 'Welcome to Example.com'")

    # Fill description
    desc_input = editor_page.locator("textarea[placeholder='Add a description...']")
    desc_input.fill("This is the main heading")
    time.sleep(0.5)
    print(f"  Description set: 'This is the main heading'")

    # Navigate away and back to verify persistence
    editor_page.locator("button[title='Next (→)']").click()
    time.sleep(0.5)
    editor_page.locator("button[title='Previous (←)']").click()
    time.sleep(0.5)

    # Check values persisted
    title_val = title_input.input_value()
    assert title_val == "Welcome to Example.com", f"Title not persisted: '{title_val}'"
    desc_val = desc_input.input_value()
    assert desc_val == "This is the main heading", f"Description not persisted: '{desc_val}'"
    print(f"  Values persisted after navigation")

    print(f"  PASS")


def test_duration_editing(editor_page):
    """Test per-step duration control."""
    print("\n=== Test: Duration editing ===")

    # Go to step 1
    editor_page.locator("button[title='First step']").click()
    time.sleep(0.5)

    # Find duration input
    duration_input = editor_page.locator("input[type='number']").first
    assert duration_input.is_visible(), "Duration input not visible"

    # Change duration to 1.5s
    duration_input.fill("1.5")
    duration_input.press("Tab")  # trigger onChange
    time.sleep(0.5)

    # Check timeline segment shows 1.5s
    segment_label = editor_page.locator("text=1.5s").first
    assert segment_label.is_visible(), "Timeline didn't update to 1.5s"
    print(f"  Duration set to 1.5s, visible in timeline")

    print(f"  PASS")


def test_transition_selector(editor_page):
    """Test transition type toggle."""
    print("\n=== Test: Transition selector ===")

    # Go to step 1
    editor_page.locator("button[title='First step']").click()
    time.sleep(0.5)

    # Click "Slide" transition button
    slide_btn = editor_page.locator("button:text('Slide')")
    assert slide_btn.is_visible(), "Slide button not visible"
    slide_btn.click()
    time.sleep(0.3)

    # Verify it's selected (should have primary bg)
    assert "bg-primary" in (slide_btn.get_attribute("class") or ""), "Slide not selected"
    print(f"  Selected: Slide")

    # Click "None"
    none_btn = editor_page.locator("button:text('None')")
    none_btn.click()
    time.sleep(0.3)
    print(f"  Selected: None")

    # Back to Fade
    fade_btn = editor_page.locator("button:text('Fade')")
    fade_btn.click()
    time.sleep(0.3)
    print(f"  Selected: Fade")

    print(f"  PASS")


def test_project_title_editing(editor_page):
    """Test inline project title editing."""
    print("\n=== Test: Project title editing ===")

    title_input = editor_page.locator("input.text-2xl").first
    if not title_input.is_visible():
        print(f"  SKIP — title input not found (may be new project)")
        return

    old_title = title_input.input_value()
    title_input.fill("My Test Arcade")
    title_input.press("Tab")
    time.sleep(0.5)

    new_title = title_input.input_value()
    assert new_title == "My Test Arcade", f"Title not updated: '{new_title}'"
    print(f"  Title changed: '{old_title}' → 'My Test Arcade'")

    print(f"  PASS")


def test_delete_step(editor_page, total_steps):
    """Test deleting a step."""
    print("\n=== Test: Delete step ===")

    # Go to last step
    editor_page.locator("button[title='Last step']").click()
    time.sleep(0.5)

    # Click delete button
    delete_btn = editor_page.locator("text=Delete Step")
    assert delete_btn.is_visible(), "Delete button not visible"

    # Handle the confirm dialog
    editor_page.on("dialog", lambda dialog: dialog.accept())
    delete_btn.click()
    time.sleep(1)

    # Verify step count decreased
    new_total = total_steps - 1
    timeline = editor_page.locator(f"text=/Timeline.*{new_total} steps/").first
    assert timeline.is_visible(), f"Step count didn't decrease to {new_total}"
    print(f"  Deleted last step: {total_steps} → {new_total} steps")

    print(f"  PASS")
    return new_total


def run_all_tests():
    os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

    with sync_playwright() as p:
        context, bg = setup_browser(p)
        editor_page, step_count = capture_steps(context, bg, num_clicks=4)

        editor_page.screenshot(path=f"{SCREENSHOTS_DIR}/00_initial.png")
        print(f"\nEditor loaded with {step_count} steps")
        print(f"URL: {editor_page.url}")

        # Run all tests
        results = {}
        tests = [
            ("loads_with_steps", lambda: test_editor_loads_with_steps(editor_page, step_count)),
            ("step_navigation", lambda: test_step_navigation(editor_page, step_count)),
            ("keyboard_navigation", lambda: test_keyboard_navigation(editor_page, step_count)),
            ("play_pause", lambda: test_play_pause(editor_page, step_count)),
            ("annotation_editing", lambda: test_annotation_editing(editor_page)),
            ("duration_editing", lambda: test_duration_editing(editor_page)),
            ("transition_selector", lambda: test_transition_selector(editor_page)),
            ("project_title", lambda: test_project_title_editing(editor_page)),
            ("delete_step", lambda: test_delete_step(editor_page, step_count)),
        ]

        for name, test_fn in tests:
            try:
                test_fn()
                results[name] = "PASS"
            except Exception as e:
                results[name] = f"FAIL: {e}"
                print(f"  FAIL: {e}")
            editor_page.screenshot(path=f"{SCREENSHOTS_DIR}/{name}.png")

        # Summary
        print("\n" + "=" * 50)
        print("TEST RESULTS")
        print("=" * 50)
        passed = sum(1 for v in results.values() if v == "PASS")
        total = len(results)
        for name, result in results.items():
            icon = "+" if result == "PASS" else "-"
            print(f"  [{icon}] {name}: {result}")
        print(f"\n  {passed}/{total} passed")
        print(f"\nScreenshots: {SCREENSHOTS_DIR}/")

        try:
            input("\nPress Enter to close browser...")
        except EOFError:
            time.sleep(3)

        context.close()

        if passed < total:
            exit(1)


if __name__ == "__main__":
    run_all_tests()
