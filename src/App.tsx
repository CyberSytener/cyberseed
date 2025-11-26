import { AuthProvider, useAuth } from './providers/AuthProvider';
import { SoulProvider } from './providers/SoulProvider';
import { HealthStatus } from './components/HealthStatus';
import { LoginForm } from './components/LoginForm';
import { ChatInterface } from './components/ChatInterface';

function AppContent() {
  const { isAuthenticated, isLoading, logout, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <h1 className="text-2xl font-bold mb-8">Cyberseed</h1>
        <LoginForm />
        <div className="mt-4">
          <HealthStatus />
        </div>
      </div>
    );
  }

  return (
    <SoulProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <header className="bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Cyberseed</h1>
          <div className="flex items-center gap-4">
            <HealthStatus />
            <span className="text-sm text-gray-600">{user?.user_id}</span>
            <button
              onClick={logout}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Logout
            </button>
          </div>
        </header>
        <main className="flex-1 flex">
          <div className="flex-1 flex flex-col">
            <ChatInterface />
          </div>
        </main>
      </div>
    </SoulProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;