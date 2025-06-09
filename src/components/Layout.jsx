import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from './ApperIcon';
import { routes } from '../config/routes';

const Layout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const location = useLocation();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 h-16 bg-white border-b border-gray-200 z-40">
        <div className="h-full flex items-center justify-between px-4 lg:px-6">
          {/* Left section */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ApperIcon name="Menu" size={20} className="text-gray-600" />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <ApperIcon name="Cloud" size={18} className="text-white" />
              </div>
              <h1 className="font-heading font-bold text-xl text-gray-900 hidden sm:block">
                CloudVault
              </h1>
            </div>
          </div>

          {/* Center section - Search */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <ApperIcon 
                name="Search" 
                size={20} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
              />
              <input
                type="text"
                placeholder="Search files and folders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-2">
            <div className="hidden sm:flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <ApperIcon name="Grid3X3" size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <ApperIcon name="List" size={16} />
              </button>
            </div>

            <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <ApperIcon name="Search" size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 bg-surface border-r border-gray-200 z-40">
          <div className="h-full overflow-y-auto p-4">
            <nav className="space-y-1">
              {Object.values(routes).map((route) => (
                <NavLink
                  key={route.id}
                  to={route.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-gray-700 hover:bg-white hover:text-primary hover:shadow-sm'
                    }`
                  }
                >
                  <ApperIcon name={route.icon} size={20} />
                  <span className="font-medium">{route.label}</span>
                </NavLink>
              ))}
            </nav>

            {/* Storage indicator */}
            <div className="mt-8 p-4 bg-white rounded-lg shadow-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Storage</span>
                <span className="text-xs text-gray-500">2.3 GB of 15 GB</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="gradient-primary h-2 rounded-full transition-all duration-300" 
                  style={{ width: '15%' }}
                ></div>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="lg:hidden fixed inset-0 bg-black/50 z-50"
                onClick={closeMobileMenu}
              />
              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-surface border-r border-gray-200 z-50"
              >
                <div className="h-full overflow-y-auto p-4">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                        <ApperIcon name="Cloud" size={18} className="text-white" />
                      </div>
                      <h1 className="font-heading font-bold text-xl text-gray-900">
                        CloudVault
                      </h1>
                    </div>
                    <button
                      onClick={closeMobileMenu}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <ApperIcon name="X" size={20} className="text-gray-600" />
                    </button>
                  </div>

                  <nav className="space-y-1">
                    {Object.values(routes).map((route) => (
                      <NavLink
                        key={route.id}
                        to={route.path}
                        onClick={closeMobileMenu}
                        className={({ isActive }) =>
                          `flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                            isActive
                              ? 'bg-primary text-white shadow-sm'
                              : 'text-gray-700 hover:bg-white hover:text-primary hover:shadow-sm'
                          }`
                        }
                      >
                        <ApperIcon name={route.icon} size={20} />
                        <span className="font-medium">{route.label}</span>
                      </NavLink>
                    ))}
                  </nav>

                  {/* Storage indicator */}
                  <div className="mt-8 p-4 bg-white rounded-lg shadow-card">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Storage</span>
                      <span className="text-xs text-gray-500">2.3 GB of 15 GB</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="gradient-primary h-2 rounded-full transition-all duration-300" 
                        style={{ width: '15%' }}
                      ></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-background">
          <Outlet context={{ viewMode, searchQuery }} />
        </main>
      </div>
    </div>
  );
};

export default Layout;