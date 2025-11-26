/**
 * Setup Screen Component
 * First-run setup UI for checking dependencies and starting backend
 */

import { useState, useEffect } from 'react';
import { useBackendStatus, useDependencies } from '../hooks/useTauri';

interface SetupScreenProps {
  onSetupComplete: () => void;
}

export function SetupScreen({ onSetupComplete }: SetupScreenProps) {
  const { status, startBackend, isLoading: backendLoading } = useBackendStatus();
  const { dependencies, installRequirements, isInstalling, checkDependencies } = useDependencies();
  const [setupStep, setSetupStep] = useState<'checking' | 'installing' | 'starting' | 'ready' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Auto-proceed through setup steps
    if (dependencies.checking) {
      setSetupStep('checking');
    } else if (!dependencies.pythonAvailable) {
      setSetupStep('error');
      setErrorMessage('Python not found. Please install Python 3.11+ or run with embedded Python.');
    } else if (!dependencies.requirementsInstalled && !isInstalling) {
      setSetupStep('installing');
    } else if (dependencies.requirementsInstalled && !status.isRunning && !backendLoading) {
      setSetupStep('starting');
    } else if (status.isRunning) {
      setSetupStep('ready');
      // Give backend a moment to fully initialize
      setTimeout(() => {
        onSetupComplete();
      }, 1000);
    }
  }, [dependencies, status, isInstalling, backendLoading, onSetupComplete]);

  const handleInstallDependencies = async () => {
    try {
      setErrorMessage('');
      await installRequirements();
    } catch (error) {
      setSetupStep('error');
      setErrorMessage(`Failed to install dependencies: ${error}`);
    }
  };

  const handleStartBackend = async () => {
    try {
      setErrorMessage('');
      await startBackend();
    } catch (error) {
      setSetupStep('error');
      setErrorMessage(`Failed to start backend: ${error}`);
    }
  };

  const handleRetry = async () => {
    setRetryCount(prev => prev + 1);
    setErrorMessage('');
    setSetupStep('checking');
    try {
      await checkDependencies();
    } catch (error) {
      setErrorMessage(`Retry failed: ${error}`);
    }
  };

  // Auto-install and auto-start
  useEffect(() => {
    if (setupStep === 'installing' && !isInstalling) {
      handleInstallDependencies();
    }
  }, [setupStep, isInstalling]);

  useEffect(() => {
    if (setupStep === 'starting' && !backendLoading && !status.isRunning) {
      handleStartBackend();
    }
  }, [setupStep, backendLoading, status.isRunning]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 max-w-md w-full border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Cyberseed</h1>
          <p className="text-gray-300">Setting up your environment</p>
        </div>

        <div className="space-y-6">
          {/* Python Check */}
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              dependencies.pythonAvailable ? 'bg-green-500' : dependencies.checking ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
            }`}>
              {dependencies.pythonAvailable ? '✓' : dependencies.checking ? '...' : '✗'}
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">Python 3.11+</p>
              <p className="text-sm text-gray-400">
                {dependencies.checking ? 'Checking...' : dependencies.pythonAvailable ? 'Found' : 'Not found'}
              </p>
            </div>
          </div>

          {/* Dependencies Check */}
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              dependencies.requirementsInstalled ? 'bg-green-500' : isInstalling ? 'bg-yellow-500 animate-pulse' : 'bg-gray-500'
            }`}>
              {dependencies.requirementsInstalled ? '✓' : isInstalling ? '...' : '○'}
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">Dependencies</p>
              <p className="text-sm text-gray-400">
                {isInstalling ? 'Installing...' : dependencies.requirementsInstalled ? 'Installed' : 'Pending'}
              </p>
            </div>
          </div>

          {/* Backend Status */}
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              status.isRunning ? 'bg-green-500' : backendLoading ? 'bg-yellow-500 animate-pulse' : 'bg-gray-500'
            }`}>
              {status.isRunning ? '✓' : backendLoading ? '...' : '○'}
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">Backend Server</p>
              <p className="text-sm text-gray-400">
                {backendLoading ? 'Starting...' : status.isRunning ? `Running on port ${status.port}` : 'Not started'}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-8 mb-4">
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-500 ease-out"
              style={{
                width: setupStep === 'checking' ? '25%' : 
                       setupStep === 'installing' ? '50%' : 
                       setupStep === 'starting' ? '75%' : 
                       setupStep === 'ready' ? '100%' : '0%'
              }}
            />
          </div>
        </div>

        {/* Status Message */}
        <div className="text-center">
          {errorMessage ? (
            <div className="space-y-4">
              <p className="text-red-400 text-sm">{errorMessage}</p>
              <button
                onClick={handleRetry}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
              >
                Retry {retryCount > 0 && `(${retryCount})`}
              </button>
            </div>
          ) : (
            <p className="text-gray-300 text-sm">
              {setupStep === 'checking' && 'Checking system requirements...'}
              {setupStep === 'installing' && 'Installing dependencies...'}
              {setupStep === 'starting' && 'Starting backend server...'}
              {setupStep === 'ready' && 'Setup complete! Starting app...'}
            </p>
          )}
        </div>

        {/* Manual Actions (if auto-setup fails) */}
        {setupStep === 'error' && (
          <div className="mt-6 space-y-2">
            {!dependencies.pythonAvailable && (
              <p className="text-xs text-gray-400 text-center">
                Install Python from{' '}
                <a href="https://www.python.org/downloads/" className="text-purple-400 hover:underline">
                  python.org
                </a>
              </p>
            )}
            {dependencies.pythonAvailable && !dependencies.requirementsInstalled && (
              <button
                onClick={handleInstallDependencies}
                disabled={isInstalling}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isInstalling ? 'Installing...' : 'Install Dependencies Manually'}
              </button>
            )}
            {dependencies.requirementsInstalled && !status.isRunning && (
              <button
                onClick={handleStartBackend}
                disabled={backendLoading}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {backendLoading ? 'Starting...' : 'Start Backend Manually'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
