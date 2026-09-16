let lenis = null

export function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function bindLenis(instance) {
  lenis = instance
}

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3
}

export function scrollToElement(el, { block = 'start', immediate = false } = {}) {
  if (!el) return
  const useImmediate = immediate || prefersReducedMotion()
  if (lenis) {
    lenis.scrollTo(el, {
      offset: 0,
      immediate: useImmediate,
      duration: 1.05,
      easing: easeOutCubic,
    })
    return
  }
  el.scrollIntoView({
    behavior: useImmediate ? 'auto' : 'smooth',
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
