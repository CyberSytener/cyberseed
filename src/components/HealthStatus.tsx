import { useEffect, useState } from 'react';
import { useHealth } from '../hooks/useApi';

export function HealthStatus() {
  const { checkHealth, isHealthy, isLoading, error } = useHealth();
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(() => {
      checkHealth();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [checkHealth]);

  const getStatusColor = () => {
    if (isLoading) return 'bg-yellow-500';
    if (error || !isHealthy) return 'bg-red-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (isLoading) return 'Checking...';
    if (error) return 'Disconnected';
    if (isHealthy) return 'Connected';
    return 'Unknown';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        title="API Connection Status"
      >
        <div className={`w-2 h-2 rounded-full ${getStatusColor()} animate-pulse`} />
        <span className="text-sm text-gray-700">{getStatusText()}</span>
      </button>

      {showDetails && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
          <h3 className="font-semibold text-gray-900 mb-2">API Status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium ${isHealthy ? 'text-green-600' : 'text-red-600'}`}>
                {getStatusText()}
              </span>
            </div>
            {error && (
              <div className="text-red-600 text-xs mt-2 p-2 bg-red-50 rounded">
                {error}
              </div>
            )}
            <button
              onClick={checkHealth}
              disabled={isLoading}
              className="w-full mt-3 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Checking...' : 'Refresh'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
