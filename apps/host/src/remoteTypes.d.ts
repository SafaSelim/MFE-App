declare module 'reactRemote/App' {
  const App: React.ComponentType;
  export default App;
}

declare module 'vueRemote/App' {
  interface MountResult {
    unmount: () => void;
    setPath: (path: string) => void;
  }

  interface MountOptions {
    initialPath?: string;
    onNavigate?: (path: string) => void;
  }

  export function mount(el: HTMLElement, options?: MountOptions): MountResult;
  export default any;
}