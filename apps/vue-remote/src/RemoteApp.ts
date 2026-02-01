import { createApp, App as VueApp } from 'vue'
import { createRouter, createMemoryHistory, Router } from 'vue-router'
import AppComponent from './App.vue'
import HomePage from './views/HomePage.vue'
import DashboardPage from './views/DashboardPage.vue'
import SettingsPage from './views/SettingsPage.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardPage,
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsPage,
  },
]

interface MountOptions {
  initialPath?: string
  onNavigate?: (path: string) => void
}

interface MountResult {
  unmount: () => void
  setPath: (path: string) => void
}

let appInstance: VueApp | null = null
let routerInstance: Router | null = null
let linkElement: HTMLLinkElement | null = null

const VUE_REMOTE_BASE_URL = 'http://localhost:3002'

// Inject CSS link into the document
function injectStyles() {
  if (typeof document === 'undefined') return

  // Check if already injected
  if (document.querySelector('link[data-vue-remote]')) {
    return
  }

  linkElement = document.createElement('link')
  linkElement.rel = 'stylesheet'
  linkElement.href = `${VUE_REMOTE_BASE_URL}/assets/style.css`
  linkElement.setAttribute('data-vue-remote', '')
  document.head.appendChild(linkElement)
}

// Remove injected CSS
function removeStyles() {
  if (linkElement && linkElement.parentNode) {
    linkElement.parentNode.removeChild(linkElement)
    linkElement = null
  }
}

export function mount(el: HTMLElement, options: MountOptions = {}): MountResult {
  const { initialPath = '/', onNavigate } = options

  // Inject styles
  injectStyles()

  // Create router with memory history for nested routing
  routerInstance = createRouter({
    history: createMemoryHistory(),
    routes,
  })

  // Navigate to initial path
  routerInstance.push(initialPath)

  // Listen for route changes and notify parent
  if (onNavigate) {
    routerInstance.afterEach((to) => {
      onNavigate(to.path)
    })
  }

  // Create Vue app
  appInstance = createApp(AppComponent)
  appInstance.use(routerInstance)
  appInstance.mount(el)

  return {
    unmount: () => {
      if (appInstance) {
        appInstance.unmount()
        appInstance = null
        routerInstance = null
        removeStyles()
      }
    },
    setPath: (path: string) => {
      if (routerInstance) {
        routerInstance.push(path)
      }
    },
  }
}

// Export for standalone usage (when running vue-remote independently)
export { AppComponent as default }
