;(() => {
  'use strict'

  // ==================================================
  // Section Hero - Autoplay
  // ==================================================

  const AUTOPLAY_DELAY = 5000

  const hero = document.querySelector('.section-hero')
  const gallery = hero.querySelector('[data-component=tabnav]')
  const galleryItems = gallery.querySelector('[data-part=panels]')
  const autoplayBtn = document.getElementById('hero-gallery-autoplay')
  if (!gallery || !gallery.tabnav || !galleryItems || !autoplayBtn) return

  const { tabs, panels, goTo } = gallery.tabnav
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

  let intervalId = null

  const isPlaying = () => autoplayBtn.classList.contains('is-playing')

  function advance() {
    const current = gallery.tabnav.current
    const active = document.activeElement
    const fromSlide = panels[current].contains(active)
    const fromTab = tabs[current] === active
    const next = (current + 1) % panels.length

    goTo(next)

    if (fromSlide) {
      panels[next].querySelector('.button')?.focus()
    } else if (fromTab) {
      tabs[next].focus()
    }
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
  window.addEventListener('resize', pause)
  reducedMotion.addEventListener('change', () => (reducedMotion.matches ? pause() : play()))

  galleryItems.setAttribute('aria-live', 'polite')

  play()
})()
