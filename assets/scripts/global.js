;(() => {
  'use strict'

  // ==================================================
  // JavaScript Detection
  // ==================================================

  document.documentElement.classList.remove('no-js')
  document.documentElement.classList.add('js')

  // ==================================================
  // Shared
  // ==================================================

  let ghCloseAllSubmenus = () => {}

  // ==================================================
  // Global Header
  // ==================================================

  function initGlobalHeader() {
    const el = document.getElementById('globalheader')
    if (!el) return

    let timeoutId = null

    window.addEventListener('resize', () => {
      el.classList.add('no-transitions')
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => el.classList.remove('no-transitions'), 250)
    })
  }

  // Global Header - Dropdown
  // ==================================================

  function initGlobalHeaderDropdown() {
    const el = document.getElementById('globalheader-head-dropdown')
    const trigger = document.getElementById('globalheader-head-dropdown-trigger')
    if (!el || !trigger) return

    let controller = null

    const closeList = () => {
      trigger.setAttribute('aria-expanded', 'false')
      controller?.abort()
      controller = null
    }

    const openList = () => {
      trigger.setAttribute('aria-expanded', 'true')

      controller = new AbortController()
      const { signal } = controller

      document.addEventListener(
        'click',
        event => {
          if (!el.contains(event.target)) closeList()
        },
        { signal }
      )

      el.addEventListener(
        'keydown',
        event => {
          if (event.key === 'Escape') {
            closeList()
            trigger.focus()
          }
        },
        { signal }
      )

      el.addEventListener(
        'focusout',
        event => {
          if (!el.contains(event.relatedTarget)) closeList()
        },
        { signal }
      )
    }

    trigger.addEventListener('click', event => {
      event.stopPropagation()
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true'
      if (isExpanded) {
        closeList()
      } else {
        openList()
      }
    })
  }

  // Global Header - Navigation
  // ==================================================

  function initGlobalHeaderNav() {
    const globalheader = document.getElementById('globalheader')
    const menutriggerBtn = document.getElementById('globalheader-head-menutrigger-button')
    if (!globalheader || !menutriggerBtn) return

    const bodyChildren = document.querySelectorAll('body > *:not(.globalheader), .globalheader-user, .globalheader-placeholder')
    const desktop = window.matchMedia('(min-width: 768px)')

    const isOpen = () => globalheader.classList.contains('globalheader-with-menu-open')

    const animateMenu = () => {
      globalheader.classList.add('globalheader-menu-animating')
      setTimeout(() => globalheader.classList.remove('globalheader-menu-animating'), 250)
    }

    const openMenu = () => {
      document.documentElement.classList.add('noscroll')
      globalheader.classList.add('globalheader-with-menu-open')
      animateMenu()
      bodyChildren.forEach(el => (el.inert = true))
      menutriggerBtn.setAttribute('aria-label', 'Fechar Menu')
    }

    const closeMenu = ({ restoreFocus = true } = {}) => {
      document.documentElement.classList.remove('noscroll')
      globalheader.classList.remove('globalheader-with-menu-open')
      animateMenu()
      bodyChildren.forEach(el => (el.inert = false))
      menutriggerBtn.setAttribute('aria-label', 'Abrir Menu')
      if (restoreFocus) menutriggerBtn.focus()
      ghCloseAllSubmenus()
    }

    menutriggerBtn.addEventListener('click', () => (isOpen() ? closeMenu() : openMenu()))

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && isOpen()) closeMenu()
    })

    desktop.addEventListener('change', event => {
      if (event.matches && isOpen()) closeMenu({ restoreFocus: false })
    })
  }

  // Global Header - Submenus
  // ==================================================

  function createSubmenuHover(container, trigger, closeOthers) {
    const handleMouseOver = () => {
      closeOthers(container)
      container.classList.add('globalheader-nav-item-expanded')
      trigger.setAttribute('aria-expanded', 'true')
    }

    const handleMouseLeave = () => {
      container.classList.remove('globalheader-nav-item-expanded')
      trigger.setAttribute('aria-expanded', 'false')
    }

    let controller = null

    const init = () => {
      controller = new AbortController()
      const { signal } = controller
      container.addEventListener('mouseover', handleMouseOver, { signal })
      container.addEventListener('mouseleave', handleMouseLeave, { signal })
    }

    const destroy = () => {
      controller?.abort()
      controller = null
      container.classList.remove('globalheader-nav-item-expanded')
      trigger.setAttribute('aria-expanded', 'false')
    }

    return { init, destroy }
  }

  function initSubmenuClick(container, trigger, hoverCapable, closeOne, closeOthers) {
    let lastPointerType = null

    container.addEventListener('pointerdown', event => {
      lastPointerType = event.pointerType
    })

    trigger.addEventListener('click', event => {
      event.preventDefault()

      const isKeyboard = event.detail === 0
      const isMouse = lastPointerType === 'mouse'
      lastPointerType = null

      if (isMouse && !isKeyboard) return

      const isExpanded = trigger.getAttribute('aria-expanded') === 'true'

      closeOthers(container)

      trigger.setAttribute('aria-expanded', String(!isExpanded))
      container.classList.toggle('globalheader-nav-item-expanded', !isExpanded)
    })

    container.addEventListener('focusout', event => {
      if (!hoverCapable.matches) return
      if (!container.contains(event.relatedTarget)) closeOne(container)
    })
  }

  function initGlobalHeaderSubmenus() {
    const hoverCapable = window.matchMedia('(min-width: 768px) and (hover: hover) and (pointer: fine)')

    const submenus = Array.from(document.querySelectorAll('[data-globalheader-nav-submenu-container]'), container => ({ container, trigger: container.querySelector('.globalheader-nav-link') })).filter(submenu => submenu.trigger)

    if (!submenus.length) return

    const closeOne = container => {
      const submenu = submenus.find(item => item.container === container)
      if (!submenu) return
      container.classList.remove('globalheader-nav-item-expanded')
      submenu.trigger.setAttribute('aria-expanded', 'false')
    }

    const closeOthers = except => {
      submenus.forEach(({ container }) => {
        if (container !== except) closeOne(container)
      })
    }

    ghCloseAllSubmenus = () => submenus.forEach(({ container }) => closeOne(container))

    submenus.forEach(({ container, trigger }) => initSubmenuClick(container, trigger, hoverCapable, closeOne, closeOthers))

    const hoverInstances = submenus.map(({ container, trigger }) => createSubmenuHover(container, trigger, closeOthers))

    let hoverActive = false

    const syncHover = () => {
      if (hoverCapable.matches && !hoverActive) {
        hoverInstances.forEach(submenu => submenu.init())
        hoverActive = true
      } else if (!hoverCapable.matches && hoverActive) {
        hoverInstances.forEach(submenu => submenu.destroy())
        hoverActive = false
      }
    }

    syncHover()
    hoverCapable.addEventListener('change', syncHover)
  }

  // ==================================================
  // Global Footer
  // ==================================================

  // Global Footer - Directory
  // ==================================================

  function initGlobalFooterDirectory() {
    const directory = document.getElementById('globalfooter-directory')
    if (!directory) return

    const buttons = directory.querySelectorAll('.globalfooter-directory-section-title-button')
    if (!buttons.length) return

    const mobile = window.matchMedia('(max-width: 767px)')

    const getSection = btn => btn.closest('.globalfooter-directory-section')

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.disabled) return

        const section = getSection(btn)
        if (!section) return

        const isExpanded = btn.getAttribute('aria-expanded') === 'true'
        btn.setAttribute('aria-expanded', String(!isExpanded))
        section.classList.toggle('globalfooter-directory-section-expanded', !isExpanded)
      })
    })

    const syncViewport = event => {
      buttons.forEach(btn => {
        const section = getSection(btn)
        const panel = btn.parentElement?.nextElementSibling

        if (event.matches) {
          btn.removeAttribute('disabled')
          btn.setAttribute('aria-expanded', 'false')
          if (panel?.id) btn.setAttribute('aria-controls', panel.id)
        } else {
          btn.setAttribute('disabled', '')
          btn.removeAttribute('aria-expanded')
          btn.removeAttribute('aria-controls')
          section?.classList.remove('globalfooter-directory-section-expanded')
        }
      })
    }

    syncViewport(mobile)
    mobile.addEventListener('change', syncViewport)
  }

  // ==================================================
  // Init
  // ==================================================

  initGlobalHeader()
  initGlobalHeaderDropdown()
  initGlobalHeaderNav()
  initGlobalHeaderSubmenus()
  initGlobalFooterDirectory()
})()
