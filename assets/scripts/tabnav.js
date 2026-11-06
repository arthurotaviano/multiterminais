;(() => {
  'use strict'

  // ==================================================
  // Tabnav
  // ==================================================

  const FOCUSABLE = 'a[href], button, input, select, textarea, [tabindex]'

  function initTabnav(el, instanceIndex) {
    const tabsEl = el.querySelector('[data-part=tabs]')
    if (!tabsEl) return

    const tabs = Array.from(tabsEl.querySelectorAll('[data-part=tab]'))
    const panels = Array.from(el.querySelectorAll('[data-part=panel]'))
    if (!tabs.length || tabs.length !== panels.length) return

    const panelsEl = el.querySelector('[data-part=panels]')
    if (panelsEl) {
      ;['role', 'aria-label', 'tabindex'].forEach(attr => panelsEl.removeAttribute(attr))
    }

    const id = el.dataset.componentId || `tabnav-${instanceIndex + 1}`
    const usesClassOnly = el.dataset.panelMode === 'class'

    let current = 0

    function setActive(index, isActive) {
      tabs[index].classList.toggle('is-active', isActive)
      tabs[index].setAttribute('aria-selected', isActive ? 'true' : 'false')
      tabs[index].setAttribute('tabindex', isActive ? '0' : '-1')
      panels[index].classList.toggle('is-active', isActive)
      if (!usesClassOnly) panels[index].hidden = !isActive
    }

    function goTo(index, focusTab) {
      if (index !== current) {
        setActive(current, false)
        current = index
        setActive(current, true)
      }

      if (focusTab) tabs[current].focus()
    }

    function notifyUserChange() {
      el.dispatchEvent(new CustomEvent('tabnav:userchange'))
    }

    tabsEl.setAttribute('role', 'tablist')

    tabs.forEach((tab, index) => {
      tab.setAttribute('id', `${id}-tab-${index + 1}`)
      tab.setAttribute('role', 'tab')
      tab.setAttribute('aria-controls', `${id}-panel-${index + 1}`)
    })

    panels.forEach((panel, index) => {
      panel.setAttribute('id', `${id}-panel-${index + 1}`)
      panel.setAttribute('role', 'tabpanel')
      panel.setAttribute('aria-labelledby', `${id}-tab-${index + 1}`)
      if (!panel.querySelector(FOCUSABLE)) panel.setAttribute('tabindex', '0')
    })

    tabs.forEach((tab, index) => setActive(index, index === 0))

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => {
        notifyUserChange()
        goTo(index)
      })
    })

    tabsEl.addEventListener('keydown', e => {
      let next = null

      switch (e.key) {
        case 'ArrowRight':
          next = (current + 1) % tabs.length
          break
        case 'ArrowLeft':
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
      notifyUserChange()
      goTo(next, true)
    })

    el.tabnav = {
      tabs,
      panels,
      goTo,
      get current() {
        return current
      },
    }
  }

  document.querySelectorAll('[data-component=tabnav]').forEach(initTabnav)
})()
