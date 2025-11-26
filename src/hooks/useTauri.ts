/**
 * Tauri Integration Hooks
 * Hooks for interacting with Tauri backend manager
 */

import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface BackendStatus {
  isRunning: boolean;
  port: number;
  error?: string;
}

interface Dependencies {
  pythonAvailable: boolean;
  requirementsInstalled: boolean;
  checking: boolean;
  error?: string;
}

/**
 * Hook to monitor and control backend process
 */
export function useBackendStatus() {
  const [status, setStatus] = useState<BackendStatus>({
    isRunning: false,
    port: 8000,
  });
  const [isLoading, setIsLoading] = useState(false);

  const checkStatus = useCallback(async () => {
    try {
      const running = await invoke<boolean>('check_backend_status');
      const port = await invoke<number>('get_backend_port');
      setStatus({ isRunning: running, port });
    } catch (error) {
      console.error('Failed to check backend status:', error);
      setStatus(prev => ({ ...prev, error: String(error) }));
    }
  }, []);

  const startBackend = useCallback(async (pythonPath?: string, backendDir?: string) => {
    setIsLoading(true);
    try {
      // Get the current directory or use a default path
      const defaultDir = typeof window !== 'undefined' && (window as any).__TAURI__ 
        ? await import('@tauri-apps/api/path').then(p => p.appDataDir())
        : './backend';
      
      const result = await invoke<string>('start_backend', {
        pythonPath,
        backendDir: backendDir || defaultDir,
      });
      console.log('Backend start result:', result);
      await checkStatus();
      return result;
    } catch (error) {
      console.error('Failed to start backend:', error);
      setStatus(prev => ({ ...prev, error: String(error) }));
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [checkStatus]);

  const stopBackend = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await invoke<string>('stop_backend');
      console.log('Backend stop result:', result);
      await checkStatus();
      return result;
    } catch (error) {
      console.error('Failed to stop backend:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [checkStatus]);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [checkStatus]);

  return {
    status,
    isLoading,
    startBackend,
    stopBackend,
    checkStatus,
  };
}

/**
 * Hook to check and install Python dependencies
 */
export function useDependencies() {
  const [dependencies, setDependencies] = useState<Dependencies>({
    pythonAvailable: false,
    requirementsInstalled: false,
    checking: true,
  });
  const [isInstalling, setIsInstalling] = useState(false);

  const checkDependencies = useCallback(async (pythonPath?: string, requirementsPath?: string) => {
    setDependencies(prev => ({ ...prev, checking: true }));
    try {
      const defaultPath = './backend/requirements.txt';
      const result = await invoke<{ python_available: boolean; requirements_installed: boolean }>(
        'check_dependencies',
        {
          pythonPath,
          requirementsPath: requirementsPath || defaultPath,
        }
      );
      setDependencies({
        pythonAvailable: result.python_available,
        requirementsInstalled: result.requirements_installed,
        checking: false,
      });
      return result;
    } catch (error) {
      console.error('Failed to check dependencies:', error);
      setDependencies({
        pythonAvailable: false,
        requirementsInstalled: false,
        checking: false,
        error: String(error),
      });
      throw error;
    }
  }, []);

  const installRequirements = useCallback(async (pythonPath?: string, requirementsPath?: string) => {
    setIsInstalling(true);
    try {
      const defaultPath = './backend/requirements.txt';
      const result = await invoke<string>('install_requirements', {
        pythonPath,
        requirementsPath: requirementsPath || defaultPath,
      });
      console.log('Install result:', result);
      await checkDependencies(pythonPath, requirementsPath);
      return result;
    } catch (error) {
      console.error('Failed to install requirements:', error);
      throw error;
    } finally {
      setIsInstalling(false);
    }
  }, [checkDependencies]);

  useEffect(() => {
    checkDependencies();
  }, [checkDependencies]);

  return {
    dependencies,
    isInstalling,
    checkDependencies,
    installRequirements,
  };
}

/**
 * Hook to handle app lifecycle events
 */
export function useAppLifecycle() {
  const { stopBackend } = useBackendStatus();

  useEffect(() => {
    const handleBeforeUnload = async () => {
      try {
        await stopBackend();
      } catch (error) {
        console.error('Failed to stop backend on unload:', error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload();
    };
  }, [stopBackend]);
}
