import { NavLink } from "react-router-dom";
import { Sword, Users, Trophy, Archive } from "lucide-react";

const navigationItems = [
  { to: "/", label: "Current War", icon: Sword },
  { to: "/roster", label: "Player Roster", icon: Users },
  { to: "/cwl", label: "CWL", icon: Trophy },
  { to: "/archives", label: "Archives", icon: Archive },
];

export function Navigation() {
  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="glass-panel px-8 py-4">
        <div className="flex items-center space-x-8">
          <div className="text-xl font-bold red-glow">Project Chimera</div>
          <div className="flex space-x-6">
            {navigationItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                    isActive
                      ? "red-glow bg-primary/20"
                      : "text-glass hover:text-primary-glow hover:bg-glass-hover"
                  }`
                }
              >
                <Icon size={18} />
                <span className="font-medium">{label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}