/** Trigger a browser download of an HTML string as a file */
export function downloadHTML(html: string, filename: string): void {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Sanitize a project title into a safe filename */
export function safeFilename(title: string): string {
  return (title.replace(/[^a-zA-Z0-9\-_ ]/g, '').trim() || 'lucid-scene') + '.html'
}
