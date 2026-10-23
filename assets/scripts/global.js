;(() => {
  'use strict'

  // ==================================================
  // JavaScript Detection
  // ==================================================

  document.documentElement.classList.remove('no-js')
  document.documentElement.classList.add('js')

  // ==================================================
  // Global Header
  // ==================================================

  const globalheader = document.getElementById('globalheader')
  const globalheaderSmallViewport = window.matchMedia('(max-width: 767px)')
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

  function initGlobalHeaderNoTransitions() {
    if (!globalheader) return

    let timeoutId = null

    window.addEventListener('resize', () => {
      globalheader.classList.add('no-transitions')
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => globalheader.classList.remove('no-transitions'), 250)
    })
  }

  // Global Header - Menu
  // ==================================================

  const globalheaderFocusable = 'a[href], area[href], button, input, select, textarea, summary, iframe, object, embed, audio[controls], video[controls], [contenteditable], [tabindex]'

  let globalheaderNav = null
  let globalheaderMenuTrigger = null
  let globalheaderMenuScrollPosition = 0
  let globalheaderInertElements = []

  function isGlobalHeaderMenuOpen() {
    return globalheader.classList.contains('globalheader-with-menu-open')
  }

  function inertOutsideGlobalHeaderNav() {
    let el = globalheaderNav

    while (el && el !== document.body) {
      Array.from(el.parentElement.children).forEach(sibling => {
        if (sibling === el || sibling.inert) return

        sibling.inert = true
        globalheaderInertElements.push(sibling)
      })

      el = el.parentElement
    }
  }

  function uninertOutsideGlobalHeaderNav() {
    globalheaderInertElements.forEach(el => (el.inert = false))
    globalheaderInertElements = []
  }

  function getGlobalHeaderNavFocusable() {
    return Array.from(globalheaderNav.querySelectorAll(globalheaderFocusable)).filter(el => {
      if (el.disabled || el.tabIndex < 0 || el.closest('[inert]')) return false

      return el.getClientRects().length > 0 && window.getComputedStyle(el).visibility !== 'hidden'
    })
  }

  function trapGlobalHeaderMenuFocus(event) {
    if (event.key !== 'Tab' || !isGlobalHeaderMenuOpen()) return

    const focusable = getGlobalHeaderNavFocusable()
    if (!focusable.length) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    const active = document.activeElement

    if (!globalheaderNav.contains(active)) {
      event.preventDefault()
      ;(event.shiftKey ? last : first).focus()
      return
    }

    if (!event.shiftKey && active === last) {
      event.preventDefault()
      first.focus()
      return
    }

    if (event.shiftKey && active === first) {
      event.preventDefault()
      last.focus()
    }
  }

  function closeGlobalHeaderMenu() {
    if (!globalheader || !isGlobalHeaderMenuOpen()) return

    closeGlobalHeaderDropdowns(dropdown => dropdown.dataset.component === 'globalheader-nav-menu-dropdown')

    globalheader.classList.remove('globalheader-with-menu-open')
    globalheaderMenuTrigger.setAttribute('aria-expanded', false)
    globalheaderMenuTrigger.setAttribute('aria-label', 'Abrir menu')

    uninertOutsideGlobalHeaderNav()

    document.documentElement.classList.remove('noscroll')
    document.body.style.insetBlockStart = ''
    window.scrollTo(0, globalheaderMenuScrollPosition)
  }

  function openGlobalHeaderMenu() {
    globalheaderMenuScrollPosition = window.scrollY

    document.documentElement.classList.add('noscroll')
    document.body.style.insetBlockStart = `-${globalheaderMenuScrollPosition}px`

    globalheader.classList.add('globalheader-with-menu-open')
    globalheaderMenuTrigger.setAttribute('aria-expanded', true)
    globalheaderMenuTrigger.setAttribute('aria-label', 'Fechar menu')

    inertOutsideGlobalHeaderNav()
  }

  function toggleGlobalHeaderMenu() {
    if (isGlobalHeaderMenuOpen()) {
      closeGlobalHeaderMenu()
      return
    }

    openGlobalHeaderMenu()
  }

  function initGlobalHeaderMenu() {
    if (!globalheader) return

    globalheaderNav = globalheader.querySelector('.globalheader-nav')
    globalheaderMenuTrigger = globalheader.querySelector('.globalheader-nav-menu-trigger')
    globalheaderMenuTrigger.addEventListener('click', toggleGlobalHeaderMenu)

    document.addEventListener('keydown', trapGlobalHeaderMenuFocus)

    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || !isGlobalHeaderMenuOpen()) return

      closeGlobalHeaderMenu()
      globalheaderMenuTrigger.focus({ preventScroll: true })
    })

    globalheaderSmallViewport.addEventListener('change', closeGlobalHeaderMenu)
  }

  // Global Header - Dropdowns
  // ==================================================

  const openGlobalHeaderDropdowns = new Set()

  function isGlobalHeaderDropdownAccordion(dropdown) {
    return globalheaderSmallViewport.matches && dropdown.dataset.component === 'globalheader-nav-menu-dropdown'
  }

  function collapseGlobalHeaderDropdownList(dropdown) {
    const list = dropdown.querySelector('[data-part=list]')

    if (!isGlobalHeaderDropdownAccordion(dropdown)) {
      list.style.height = ''
      return
    }

    list.style.height = `${list.scrollHeight}px`
    void list.offsetHeight
    list.style.height = ''
  }

  function expandGlobalHeaderDropdownList(dropdown) {
    if (!isGlobalHeaderDropdownAccordion(dropdown)) return

    const list = dropdown.querySelector('[data-part=list]')

    if (reducedMotion.matches) {
      list.style.height = 'auto'
      return
    }

    const onTransitionEnd = event => {
      if (event.propertyName !== 'height') return

      list.removeEventListener('transitionend', onTransitionEnd)

      if (openGlobalHeaderDropdowns.has(dropdown)) list.style.height = 'auto'
    }

    list.addEventListener('transitionend', onTransitionEnd)
    list.style.height = `${list.scrollHeight}px`
  }

  function closeGlobalHeaderDropdown(dropdown) {
    if (!openGlobalHeaderDropdowns.has(dropdown)) return

    collapseGlobalHeaderDropdownList(dropdown)

    dropdown.classList.remove('globalheader-with-dropdown-open')
    dropdown.querySelector('[data-part=trigger]').setAttribute('aria-expanded', false)
    openGlobalHeaderDropdowns.delete(dropdown)
  }

  function closeGlobalHeaderDropdowns(match) {
    openGlobalHeaderDropdowns.forEach(dropdown => {
      if (match && !match(dropdown)) return

      closeGlobalHeaderDropdown(dropdown)
    })
  }

  function openGlobalHeaderDropdown(dropdown) {
    closeGlobalHeaderDropdowns(other => other !== dropdown && !isGlobalHeaderDropdownAccordion(other))

    dropdown.classList.add('globalheader-with-dropdown-open')
    dropdown.querySelector('[data-part=trigger]').setAttribute('aria-expanded', true)
    openGlobalHeaderDropdowns.add(dropdown)

    expandGlobalHeaderDropdownList(dropdown)
  }

  function toggleGlobalHeaderDropdown(dropdown) {
    if (openGlobalHeaderDropdowns.has(dropdown)) {
      closeGlobalHeaderDropdown(dropdown)
      return
    }

    openGlobalHeaderDropdown(dropdown)
  }

  function initGlobalHeaderDropdowns(variant) {
    if (!globalheader) return

    const component = `globalheader-${variant}-dropdown`
    const dropdowns = globalheader.querySelectorAll(`[data-component=${component}]`)

    dropdowns.forEach(dropdown => {
      const id = `${component}-${dropdown.dataset.componentId}`

      const list = dropdown.querySelector('[data-part=list]')
      list.setAttribute('id', id)

      const trigger = dropdown.querySelector('[data-part=trigger]')
      trigger.setAttribute('aria-controls', id)

      trigger.addEventListener('click', () => toggleGlobalHeaderDropdown(dropdown))
    })
  }

  function initGlobalHeaderDropdownsDismiss() {
    document.addEventListener('click', event => {
      closeGlobalHeaderDropdowns(dropdown => !isGlobalHeaderDropdownAccordion(dropdown) && !dropdown.contains(event.target))
    })

    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return

      openGlobalHeaderDropdowns.forEach(dropdown => {
        if (isGlobalHeaderDropdownAccordion(dropdown)) return

        const trigger = dropdown.querySelector('[data-part=trigger]')

        closeGlobalHeaderDropdown(dropdown)
        trigger.focus()
      })
    })

    globalheaderSmallViewport.addEventListener('change', () => closeGlobalHeaderDropdowns())
  }

  // ==================================================
  // Init
  // ==================================================

  initGlobalHeaderNoTransitions()
  initGlobalHeaderMenu()
  initGlobalHeaderDropdowns('nav-menu')
  initGlobalHeaderDropdowns('ribbon')
  initGlobalHeaderDropdownsDismiss()
})()
