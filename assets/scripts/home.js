;(() => {
  'use strict'

  // ==================================================
  // Section Hero - Autoplay
  // ==================================================

  const AUTOPLAY_DELAY = 5000

  const gallery = document.querySelector('.section-hero [data-component=tabnav]')
  const galleryItems = gallery?.querySelector('[data-part=panels]')
  const autoplayBtn = document.getElementById('hero-gallery-autoplay')
  if (!gallery?.tabnav || !galleryItems || !autoplayBtn) return

  const { panels, goTo } = gallery.tabnav
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

  let intervalId = null
  let lastWidth = window.innerWidth

  const isPlaying = () => autoplayBtn.classList.contains('is-playing')

  function advance() {
    goTo((gallery.tabnav.current + 1) % panels.length)
  }

  function play() {
    if (reducedMotion.matches || isPlaying()) return
    autoplayBtn.classList.add('is-playing')
    autoplayBtn.setAttribute('aria-label', 'Pausar apresentação automática')
    galleryItems.setAttribute('aria-live', 'off')
    intervalId = setInterval(advance, AUTOPLAY_DELAY)
  }

  function pause() {
    if (!isPlaying()) return
    autoplayBtn.classList.remove('is-playing')
    autoplayBtn.setAttribute('aria-label', 'Iniciar apresentação automática')
    galleryItems.setAttribute('aria-live', 'polite')
    clearInterval(intervalId)
    intervalId = null
  }

  autoplayBtn.addEventListener('click', () => (isPlaying() ? pause() : play()))
  gallery.addEventListener('tabnav:userchange', pause)

  gallery.addEventListener('focusin', e => {
    if (e.target !== autoplayBtn && e.target.matches(':focus-visible')) pause()
  })

  window.addEventListener('resize', () => {
    if (window.innerWidth === lastWidth) return
    lastWidth = window.innerWidth
    pause()
  })

  reducedMotion.addEventListener('change', () => (reducedMotion.matches ? pause() : play()))

  galleryItems.setAttribute('aria-live', 'polite')

  play()
})()
