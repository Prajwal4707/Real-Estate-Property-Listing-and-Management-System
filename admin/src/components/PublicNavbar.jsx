import React from "react";
import { Home } from "lucide-react";

const PublicNavbar = () => {
  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Home className="h-5 w-5 text-blue-600" />
            </div>
            <span className="ml-2 text-xl font-bold text-gray-900">
              Admin Panel
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default PublicNavbar;
