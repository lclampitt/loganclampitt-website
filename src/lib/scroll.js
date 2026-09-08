export function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function scrollToElement(el, { block = 'start' } = {}) {
  if (!el) return
  el.scrollIntoView({
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    block,
  })
}

export function scrollToId(id, options) {
  scrollToElement(document.getElementById(id), options)
}
