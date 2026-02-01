declare module 'reactRemote/App' {
  const App: React.ComponentType;
  export default App;
}

// Vue remote types - loaded via dynamic ESM import
interface VueRemoteMountResult {
  unmount: () => void;
  setPath: (path: string) => void;
}

interface VueRemoteMountOptions {
  initialPath?: string;
  onNavigate?: (path: string) => void;
}

interface VueRemoteModule {
  mount: (el: HTMLElement, options?: VueRemoteMountOptions) => VueRemoteMountResult;
}