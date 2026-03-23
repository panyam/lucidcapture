import { serializeSteps, compileToHTML, downloadHTML, safeFilename } from './compiler'
import { getProject, getSteps } from './scene-db'

/**
 * Wire up all export buttons on the page.
 * Any element with class `lc-export-btn` and a `data-project-id` attribute
 * becomes a working export button. Works on editor, player, or any page.
 */
export function initExportButtons() {
  document.querySelectorAll<HTMLElement>('.lc-export-btn').forEach(initButton)
}

function initButton(btn: HTMLElement) {
  const projectId = btn.dataset.projectId
  if (!projectId || projectId === 'new') return

  // Show the button (hidden by default in template)
  btn.classList.remove('hidden')

  let exporting = false
  btn.addEventListener('click', async () => {
    if (exporting) return
    exporting = true

    const icon = btn.querySelector('.material-symbols-outlined')
    const textNode = btn.childNodes[btn.childNodes.length - 1]
    if (icon) { icon.textContent = 'sync'; icon.classList.add('animate-spin') }
    if (textNode) textNode.textContent = ' Exporting...'

    try {
      const project = await getProject(projectId)
      const steps = await getSteps(projectId)
      if (!project || steps.length === 0) return

      const serialized = await serializeSteps(steps)
      const html = compileToHTML({
        title: project.title,
        steps: serialized,
        compiledAt: new Date().toISOString(),
      })
      downloadHTML(html, safeFilename(project.title))
    } finally {
      exporting = false
      if (icon) { icon.textContent = 'download'; icon.classList.remove('animate-spin') }
      if (textNode) textNode.textContent = ' Export HTML'
    }
  })
}
