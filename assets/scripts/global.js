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
