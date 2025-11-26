export function Sidebar() {
  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 p-6">
      <h2 className="text-xl font-bold mb-6">Seed</h2>

      <nav className="flex flex-col gap-3">
        <a className="text-gray-700 hover:text-black" href="#">Dashboard</a>
        <a className="text-gray-700 hover:text-black" href="#">Chat</a>
        <a className="text-gray-700 hover:text-black" href="#">Memory</a>
        <a className="text-gray-700 hover:text-black" href="#">Events</a>
        <a className="text-gray-700 hover:text-black" href="#">Telemetry</a>
        <a className="text-gray-700 hover:text-black" href="#">Profile</a>
        <a className="text-gray-700 hover:text-black" href="#">Settings</a>
      </nav>
    </div>
  );
}
