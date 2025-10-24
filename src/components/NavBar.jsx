import { Home, CalendarDays, BarChart3, Settings } from "lucide-react";

export default function NavBar({ active, setActive }) {
  const pages = [
    { id: "home", label: "Home", icon: <Home size={22} /> },
    { id: "calendar", label: "Calendar", icon: <CalendarDays size={22} /> },
    { id: "stats", label: "Stats", icon: <BarChart3 size={22} /> },
    { id: "settings", label: "Settings", icon: <Settings size={22} /> },
  ];

  return (
    <nav className="flex justify-around items-center border-t bg-white p-3 fixed bottom-0 w-full">
      {pages.map((page) => (
        <button
          key={page.id}
          onClick={() => setActive(page.id)}
          className={`flex flex-col items-center text-sm ${
            active === page.id ? "text-blue-600" : "text-gray-500"
          }`}
        >
          {page.icon}
          <span>{page.label}</span>
        </button>
      ))}
    </nav>
  );
}
