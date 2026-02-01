import React, { useEffect, useRef } from 'react';
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

  // Extract the sub-path after the base path (e.g., /vue/dashboard -> /dashboard)
  const getSubPath = (pathname: string) => {
    const subPath = pathname.replace(basePath, '') || '/';
    return subPath.startsWith('/') ? subPath : '/' + subPath;
  };

  useEffect(() => {
    if (containerRef.current && !mountResultRef.current && vueModule?.mount) {
      const initialSubPath = getSubPath(location.pathname);

      mountResultRef.current = vueModule.mount(containerRef.current, {
        initialPath: initialSubPath,
        onNavigate: (vuePath: string) => {
          // When Vue navigates internally, update React Router
          const fullPath = basePath + (vuePath === '/' ? '' : vuePath);
          if (location.pathname !== fullPath) {
            navigate(fullPath, { replace: true });
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
  }, [vueModule]);

  // Sync React Router location changes to Vue Router
  useEffect(() => {
    if (mountResultRef.current) {
      const subPath = getSubPath(location.pathname);
      mountResultRef.current.setPath(subPath);
    }
  }, [location.pathname]);

  return <div ref={containerRef} />;
}
