import { useState } from "react";
import { AuthProvider, useAuth } from "./providers/AuthProvider";
import { SoulProvider } from "./providers/SoulProvider";
import { BreathingOrb } from "./components/BreathingOrb";
import { NeuralBackground } from "./components/NeuralBackground";
import { ConsciousnessWave } from "./components/ConsciousnessWave";
import { TopBar } from "./components/TopBar";
import { Sidebar } from "./components/Sidebar";
import { MainContent } from "./components/MainContent";
import { DashboardContent } from "./components/DashboardContent";
import { EventsContent } from "./components/EventsContent";
import { LoginForm } from "./components/LoginForm";
import { ChatInterface } from "./components/ChatInterface";

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeView, setActiveView] = useState("dashboard");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      {/* Breathing orb effects - more subtle for app shell */}
      <BreathingOrb color="#4A90E2" size={350} className="top-[-150px] left-[-100px]" />
      <BreathingOrb color="#8B5CF6" size={300} className="bottom-[-100px] right-[-50px]" />
      <BreathingOrb color="#14B8A6" size={250} className="top-1/3 right-1/4" />

      {/* Neural network background */}
      <NeuralBackground />

      {/* Consciousness wave */}
      <ConsciousnessWave />

      {/* App Shell */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top Bar */}
        <TopBar />

        {/* Main Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <Sidebar activeItem={activeView} onNavigate={setActiveView} />

          {/* Main Content Area */}
          {activeView === "chat" ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              <ChatInterface />
            </div>
          ) : activeView === "events" ? (
            <MainContent>
              <EventsContent />
            </MainContent>
          ) : (
            <MainContent>
              <DashboardContent />
            </MainContent>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SoulProvider>
        <AppContent />
      </SoulProvider>
    </AuthProvider>
  );
}