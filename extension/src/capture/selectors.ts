/**
 * Generate a unique CSS selector for an element.
 * Tries: id > data attributes > nth-child path.
 */
export function getUniqueSelector(el: Element): string {
  if (el.id) return `#${CSS.escape(el.id)}`

  const htmlEl = el as HTMLElement
  if (htmlEl.dataset?.testid) return `[data-testid="${CSS.escape(htmlEl.dataset.testid)}"]`
  const ariaLabel = el.getAttribute('aria-label')
  if (ariaLabel) return `[aria-label="${CSS.escape(ariaLabel)}"]`

  // Build nth-child path
  const path: string[] = []
  let current: Element | null = el
  while (current && current !== document.body) {
    const parent = current.parentElement
    if (!parent) break
    const siblings = Array.from(parent.children)
    const index = siblings.indexOf(current) + 1
    const tag = current.tagName.toLowerCase()
    path.unshift(`${tag}:nth-child(${index})`)
    current = parent
  }
  return path.join(' > ')
}

/**
 * Get a human-readable label for an element.
 */
export function getElementLabel(el: Element): string {
  const ariaLabel = el.getAttribute('aria-label')
  if (ariaLabel) return ariaLabel.slice(0, 80)

  const text = el.textContent?.trim()
  if (text && text.length <= 80) return text

  const htmlEl = el as HTMLInputElement
  if (htmlEl.placeholder) return htmlEl.placeholder.slice(0, 80)

  return `${el.tagName.toLowerCase()}${el.className ? '.' + el.className.toString().split(' ')[0] : ''}`
}
