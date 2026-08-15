;(() => {
  'use strict'

  // ==================================================
  // Hero
  // ==================================================

  const AUTOPLAY_DELAY = 5000

  const slidesEl = document.getElementById('hero-carousel-slides')
  const tabsEl = document.getElementById('hero-carousel-tabs')
  const autoplayBtn = document.getElementById('hero-carousel-autoplay')
  if (!slidesEl || !tabsEl || !autoplayBtn) return

  const slides = Array.from(slidesEl.querySelectorAll('.hero-carousel-slide'))
  const tabs = Array.from(tabsEl.querySelectorAll('.hero-carousel-tab'))
  if (!slides.length || !tabs.length) return

  slides.forEach((slide, index) => {
    slide.setAttribute('id', `hero-carousel-slide-${index}`)
    slide.setAttribute('role', 'tabpanel')
    slide.setAttribute('aria-labelledby', `hero-carousel-tab-${index}`)
  })

  tabsEl.setAttribute('role', 'tablist')

  tabs.forEach((tab, index) => {
    tab.setAttribute('id', `hero-carousel-tab-${index}`)
    tab.setAttribute('role', 'tab')
    tab.setAttribute('aria-selected', 'false')
    tab.setAttribute('aria-controls', `hero-carousel-slide-${index}`)
    tab.setAttribute('tabindex', '-1')
  })

  slides[0].classList.add('is-active')
  tabs[0].classList.add('is-active')
  tabs[0].setAttribute('aria-selected', 'true')
  tabs[0].setAttribute('tabindex', '0')

  let current = 0

  function goTo(index, focusTab) {
    if (index === current) return
    slides[current].classList.remove('is-active')
    tabs[current].classList.remove('is-active')
    tabs[current].setAttribute('aria-selected', 'false')
    tabs[current].setAttribute('tabindex', '-1')

    current = index

    slides[current].classList.add('is-active')
    tabs[current].classList.add('is-active')
    tabs[current].setAttribute('aria-selected', 'true')
    tabs[current].setAttribute('tabindex', '0')
    if (focusTab) tabs[current].focus()
  }

  // Hero - Autoplay
  // ==================================================

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

  let intervalId = null

  const isPlaying = () => autoplayBtn.classList.contains('is-playing')

  function advance() {
    const active = document.activeElement
    const fromSlide = slides[current].contains(active)
    const fromTab = tabs[current] === active

    goTo((current + 1) % slides.length)

    if (fromSlide) {
      slides[current].querySelector('.button')?.focus()
    } else if (fromTab) {
      tabs[current].focus()
    }
  }

  function play() {
    if (reducedMotion.matches || isPlaying()) return
    autoplayBtn.classList.add('is-playing')
    autoplayBtn.setAttribute('aria-label', 'Pausar apresentação automática')
    slidesEl.setAttribute('aria-live', 'off')
    intervalId = setInterval(advance, AUTOPLAY_DELAY)
  }

  function pause() {
    if (!isPlaying()) return
    autoplayBtn.classList.remove('is-playing')
    autoplayBtn.setAttribute('aria-label', 'Iniciar apresentação automática')
    slidesEl.setAttribute('aria-live', 'polite')
    clearInterval(intervalId)
    intervalId = null
  }

  autoplayBtn.addEventListener('click', () => (isPlaying() ? pause() : play()))

  window.addEventListener('resize', pause)

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => {
      pause()
      goTo(i)
    })
  })

  tabsEl.addEventListener('keydown', e => {
    let next = null
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        next = (current + 1) % tabs.length
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        next = (current - 1 + tabs.length) % tabs.length
        break
      case 'Home':
        next = 0
        break
      case 'End':
        next = tabs.length - 1
        break
      default:
        return
    }
    e.preventDefault()
    pause()
    goTo(next, true)
  })

  slidesEl.setAttribute('aria-live', 'polite')

  reducedMotion.addEventListener('change', () => (reducedMotion.matches ? pause() : play()))

  play()
})()
