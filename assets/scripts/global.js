// ==================================================
// JavaScript Detection
// ==================================================

document.documentElement.classList.remove('no-js')
document.documentElement.classList.add('js')

// ==================================================
// Global Header
// ==================================================

class GlobalHeader {
  constructor() {
    this.el = document.getElementById('globalheader')
    this.init()
  }

  init() {
    window.addEventListener('resize', () => {
      this.el.classList.add('no-transitions')
      setTimeout(() => this.el.classList.remove('no-transitions'), 250)
    })
  }
}

new GlobalHeader()

// Global Header - Dropdown
// ==================================================

class GlobalHeaderDropdown {
  constructor() {
    this.el = document.getElementById('globalheader-head-dropdown')
    this.trigger = document.getElementById('globalheader-head-dropdown-trigger')
    this.handleClick = this.handleClick.bind(this)
    this.handleOutsideClick = this.handleOutsideClick.bind(this)
    this.handleKeydown = this.handleKeydown.bind(this)
    this.handleFocusout = this.handleFocusout.bind(this)
    this.init()
  }

  init() {
    this.trigger.addEventListener('click', this.handleClick)
  }

  openList() {
    this.trigger.setAttribute('aria-expanded', 'true')
    document.addEventListener('click', this.handleOutsideClick)
    this.el.addEventListener('keydown', this.handleKeydown)
    this.el.addEventListener('focusout', this.handleFocusout)
  }

  closeList() {
    this.trigger.setAttribute('aria-expanded', 'false')
    document.removeEventListener('click', this.handleOutsideClick)
    this.el.removeEventListener('keydown', this.handleKeydown)
    this.el.removeEventListener('focusout', this.handleFocusout)
  }

  handleClick() {
    const isExpanded = this.trigger.getAttribute('aria-expanded') === 'true'
    if (isExpanded) {
      this.closeList()
    } else {
      this.openList()
    }
  }

  handleOutsideClick(event) {
    if (!this.el.contains(event.target)) {
      this.closeList()
    }
  }

  handleKeydown(event) {
    if (event.key === 'Escape') {
      this.closeList()
      this.trigger.focus()
    }
  }

  handleFocusout(event) {
    if (!this.el.contains(event.relatedTarget)) {
      this.closeList()
    }
  }
}

new GlobalHeaderDropdown()

// Global Header - Navigation
// ==================================================

class GlobalHeaderNav {
  constructor() {
    this.globalheader = document.getElementById('globalheader')
    this.bodyChildren = document.querySelectorAll('body > *:not(.globalheader), .globalheader-user, .globalheader-placeholder')
    this.menutriggerBtn = document.getElementById('globalheader-head-menutrigger-button')
    this.init()
  }

  init() {
    this.menutriggerBtn.addEventListener('click', () => (this.isOpen() ? this.closeMenu() : this.openMenu()))
    document.addEventListener('keydown', event => event.key === 'Escape' && this.isOpen() && this.closeMenu())
    window.addEventListener('resize', () => window.innerWidth >= 768 && this.isOpen() && this.closeMenu())
  }

  animateMenu() {
    this.globalheader.classList.add('globalheader-menu-animating')
    setTimeout(() => this.globalheader.classList.remove('globalheader-menu-animating'), 250)
  }

  openMenu() {
    document.documentElement.classList.add('noscroll')
    this.globalheader.classList.add('globalheader-with-menu-open')
    this.animateMenu()
    this.bodyChildren.forEach(el => (el.inert = true))
    this.menutriggerBtn.setAttribute('aria-label', 'Fechar Menu')
  }

  closeMenu() {
    document.documentElement.classList.remove('noscroll')
    this.globalheader.classList.remove('globalheader-with-menu-open')
    this.animateMenu()
    this.bodyChildren.forEach(el => (el.inert = false))
    this.menutriggerBtn.setAttribute('aria-label', 'Abrir Menu')
    this.menutriggerBtn.focus()
    ghCloseAllSubmenus()
  }

  isOpen() {
    return this.globalheader.classList.contains('globalheader-with-menu-open')
  }
}

new GlobalHeaderNav()

// Global Header - Submenu
// ==================================================

class GlobalHeaderSubmenuHover {
  constructor(container) {
    this.container = container
    this.trigger = container.querySelector('.globalheader-nav-link')
    this.handleMouseOver = this.handleMouseOver.bind(this)
    this.handleMouseLeave = this.handleMouseLeave.bind(this)
  }

  handleMouseOver() {
    this.container.setAttribute('data-globalheader-nav-submenu-open', '')
    this.trigger.setAttribute('aria-expanded', 'true')
  }

  handleMouseLeave() {
    this.container.removeAttribute('data-globalheader-nav-submenu-open')
    this.trigger.setAttribute('aria-expanded', 'false')
  }

  init() {
    this.container.addEventListener('mouseover', this.handleMouseOver)
    this.container.addEventListener('mouseleave', this.handleMouseLeave)
  }

  destroy() {
    this.container.removeEventListener('mouseover', this.handleMouseOver)
    this.container.removeEventListener('mouseleave', this.handleMouseLeave)
    this.container.removeAttribute('data-globalheader-nav-submenu-open')
    this.trigger.setAttribute('aria-expanded', 'false')
  }
}

class GlobalHeaderSubmenuClick {
  constructor(container) {
    this.container = container
    this.trigger = container.querySelector('.globalheader-nav-link')
    this.lastPointerType = null
    this.handlePointerDown = this.handlePointerDown.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.handleFocusout = this.handleFocusout.bind(this)
    this.init()
  }

  init() {
    this.trigger.addEventListener('pointerdown', this.handlePointerDown)
    this.trigger.addEventListener('click', this.handleClick)
    this.container.addEventListener('focusout', this.handleFocusout)
  }

  handlePointerDown(event) {
    this.lastPointerType = event.pointerType
  }

  handleClick(event) {
    event.preventDefault()

    const isKeyboard = event.detail === 0
    const isMouse = this.lastPointerType === 'mouse'
    this.lastPointerType = null

    if (isMouse && !isKeyboard) return

    const isExpanded = this.trigger.getAttribute('aria-expanded') === 'true'

    ghCloseOtherSubmenus(this.container)

    this.trigger.setAttribute('aria-expanded', String(!isExpanded))
    this.container.toggleAttribute('data-globalheader-nav-submenu-open', !isExpanded)
  }

  handleFocusout(event) {
    if (!ghHoverCapable.matches) return
    if (!this.container.contains(event.relatedTarget)) {
      ghCloseSubmenu(this.container)
    }
  }
}

const ghSubmenuContainers = document.querySelectorAll('[data-globalheader-nav-submenu-container]')
const ghHoverCapable = window.matchMedia('(min-width: 768px) and (hover: hover) and (pointer: fine)')

const ghCloseSubmenu = container => {
  container.removeAttribute('data-globalheader-nav-submenu-open')
  container.querySelector('.globalheader-nav-link').setAttribute('aria-expanded', 'false')
}

const ghCloseAllSubmenus = () => {
  ghSubmenuContainers.forEach(ghCloseSubmenu)
}

const ghCloseOtherSubmenus = except => {
  ghSubmenuContainers.forEach(container => {
    if (container !== except) ghCloseSubmenu(container)
  })
}

ghSubmenuContainers.forEach(container => new GlobalHeaderSubmenuClick(container))

const ghSubmenuHover = Array.from(ghSubmenuContainers).map(container => new GlobalHeaderSubmenuHover(container))
let ghHoverActive = false

const ghSubmenuHoverSync = () => {
  if (ghHoverCapable.matches && !ghHoverActive) {
    ghSubmenuHover.forEach(submenu => submenu.init())
    ghHoverActive = true
  } else if (!ghHoverCapable.matches && ghHoverActive) {
    ghSubmenuHover.forEach(submenu => submenu.destroy())
    ghHoverActive = false
  }
}

document.addEventListener('DOMContentLoaded', ghSubmenuHoverSync)
ghHoverCapable.addEventListener('change', ghSubmenuHoverSync)

// ==================================================
// Global Footer
// ==================================================

// Global Footer - Directory
// ==================================================

class GlobalFooterDirectory {
  constructor() {
    this.gfDirectory = document.getElementById('globalfooter-directory')
    this.gfDirectoryButtons = this.gfDirectory.querySelectorAll('.globalfooter-directory-section-title-button')
    this.viewport = window.matchMedia('(max-width: 767px)')
    this.bindClicks()
    this.init(this.viewport)
    this.viewport.addEventListener('change', evt => this.init(evt))
  }

  bindClicks() {
    this.gfDirectoryButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.disabled) return
        const isExpanded = btn.getAttribute('aria-expanded') === 'true'
        btn.setAttribute('aria-expanded', String(!isExpanded))
        btn.parentElement.parentElement.classList.toggle('globalfooter-directory-section-expanded', !isExpanded)
      })
    })
  }

  init(evt) {
    this.gfDirectoryButtons.forEach(btn => {
      btn.querySelector('.globalfooter-directory-section-title-button-icon').innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M297.4 438.6C309.9 451.1 330.2 451.1 342.7 438.6L502.7 278.6C515.2 266.1 515.2 245.8 502.7 233.3C490.2 220.8 469.9 220.8 457.4 233.3L320 370.7L182.6 233.4C170.1 220.9 149.8 220.9 137.3 233.4C124.8 245.9 124.8 266.2 137.3 278.7L297.3 438.7z"/></svg>'
      if (evt.matches) {
        btn.removeAttribute('disabled')
        btn.setAttribute('aria-expanded', 'false')
        btn.setAttribute('aria-controls', btn.parentElement.nextElementSibling.getAttribute('id'))
      } else {
        btn.setAttribute('disabled', '')
        btn.removeAttribute('aria-expanded')
        btn.removeAttribute('aria-controls')
        btn.parentElement.parentElement.classList.remove('globalfooter-directory-section-expanded')
      }
    })
  }
}

new GlobalFooterDirectory()
