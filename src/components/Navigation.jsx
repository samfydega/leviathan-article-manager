import { Home, Database, FileText, Edit3, Star } from "lucide-react";
import { NavLink } from "react-router-dom";

function Navigation() {
  const sections = [
    {
      title: "MAIN",
      items: [
        { path: "/", icon: Home, label: "Home" },
        { path: "/entities", icon: Database, label: "Entities" },
        { path: "/notability", icon: Star, label: "Notability" },
        { path: "/draft", icon: FileText, label: "Draft" },
        { path: "/edit", icon: Edit3, label: "Edit" },
        { path: "/all", icon: FileText, label: "All" },
      ],
    },
  ];

  return (
    <nav className="w-64 bg-gray-50 border-r border-gray-200 h-screen overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <img
          src="./serpent3.png"
          alt="Leviathan Encyclopedia"
          className="w-14 h-14"
        />
        {/* <h1 className="text-3xl font-playfair font-medium text-[#554348] tracking-tighter leading-7">
          Leviathan Encyclopedia
        </h1> */}
      </div>

      <div className="p-4">
        {sections.map((section, index) => (
          <div key={index} className="mb-6">
            <h3 className="text-xs font-libre font-medium text-gray-500 uppercase tracking-wider mb-3 px-3">
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const IconComponent = item.icon;
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center px-3 py-2.25 rounded-md text-sm font-libre transition-colors duration-150 ${
                          isActive
                            ? "bg-gray-200 text-gray-900"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        }`
                      }
                    >
                      <IconComponent className="w-4.5 h-4.5 mr-3.5" />
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}

export default Navigation;
