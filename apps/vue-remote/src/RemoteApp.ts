import { createApp, h, App as VueApp } from 'vue'
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

export function mount(el: HTMLElement, options: MountOptions = {}): MountResult {
  const { initialPath = '/', onNavigate } = options

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
