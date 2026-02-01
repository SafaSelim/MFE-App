import { useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface MountResult {
  unmount: () => void;
  setPath: (path: string) => void;
}

interface VueRemoteModule {
  mount: (el: HTMLElement, options?: {
    initialPath?: string;
    onNavigate?: (path: string) => void;
  }) => MountResult;
}

interface VueWrapperProps {
  vueModule: VueRemoteModule;
  basePath: string;
}

export default function VueWrapper({ vueModule, basePath }: VueWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mountResultRef = useRef<MountResult | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Use refs to avoid stale closures in the onNavigate callback
  const locationRef = useRef(location.pathname);
  const navigateRef = useRef(navigate);

  // Keep refs up to date
  useEffect(() => {
    locationRef.current = location.pathname;
  }, [location.pathname]);

  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  // Extract the sub-path after the base path (e.g., /vue/dashboard -> /dashboard)
  const getSubPath = useCallback((pathname: string) => {
    const subPath = pathname.replace(basePath, '') || '/';
    return subPath.startsWith('/') ? subPath : '/' + subPath;
  }, [basePath]);

  useEffect(() => {
    if (containerRef.current && !mountResultRef.current && vueModule?.mount) {
      const initialSubPath = getSubPath(location.pathname);

      mountResultRef.current = vueModule.mount(containerRef.current, {
        initialPath: initialSubPath,
        onNavigate: (vuePath: string) => {
          // When Vue navigates internally, update React Router
          // Use refs to get current values (avoid stale closure)
          const fullPath = basePath + (vuePath === '/' ? '' : vuePath);
          if (locationRef.current !== fullPath) {
            navigateRef.current(fullPath, { replace: true });
          }
        },
      });
    }

    return () => {
      if (mountResultRef.current) {
        mountResultRef.current.unmount();
        mountResultRef.current = null;
      }
    };
  }, [vueModule, basePath, getSubPath]);

  // Sync React Router location changes to Vue Router
  useEffect(() => {
    if (mountResultRef.current) {
      const subPath = getSubPath(location.pathname);
      mountResultRef.current.setPath(subPath);
    }
  }, [location.pathname, getSubPath]);

  return <div ref={containerRef} />;
}
