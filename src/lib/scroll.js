let lenis = null

export function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function bindLenis(instance) {
  lenis = instance
}

export function scrollToElement(el, { block = 'start' } = {}) {
  if (!el) return
  if (lenis) {
    lenis.scrollTo(el, {
      offset: 0,
      immediate: prefersReducedMotion(),
    })
    return
  }
  el.scrollIntoView({
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    block,
  })
}

export function scrollToId(id, options) {
  scrollToElement(document.getElementById(id), options)
}

export function scrollToTop({ immediate = true } = {}) {
  if (lenis) {
    lenis.scrollTo(0, { immediate })
    return
  }
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
}
