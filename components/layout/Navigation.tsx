"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "../ui/button";
import { Menu, X, LogOut, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";
import { navigationItems } from "../../lib/navigation-items";
import { useGetByIdQuery } from "../../store/apis/buildersApi";
export interface NavigationItem {
  name: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavigationItem[];
}

interface NavigationProps {
  children: React.ReactNode;
}

export function Navigation({ children }: NavigationProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([
    // "Sales & Marketing",
    // "Purchasing",
    // "Builder Setup",
    // "System Setup",
  ]);
  const pathname = usePathname();
  const router = useRouter();

  // Handle navigation loading state
  const handleNavigation = (href: string) => {
    if (pathname !== href) {
      setIsNavigating(true);
      router.push(href);
    }
    setSidebarOpen(false);
  };

  // Toggle submenu expansion
  const toggleSubmenu = (menuName: string) => {
    setExpandedMenus((prev) =>
      prev.includes(menuName)
        ? prev.filter((name) => name !== menuName)
        : [...prev, menuName]
    );
  };

  // Reset navigation loading when pathname changes
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  // Fetch builder data including logo
  const { data: builderData } = useGetByIdQuery({
    builderId: "e5e94058-75c6-4514-88a3-531af3afb750",
  });

  // Handle sign out with loading state
  const handleSignOut = async () => {};

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo & Close Button */}
          <div className="flex items-center justify-between p-6 border-b">
            <button
              onClick={() => handleNavigation("/dashboard")}
              className="flex items-center space-x-2"
            >
              <Image
                src="/logo_house.png"
                alt="My Constructio App Logo"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="text-xl font-bold">My Construction App</span>
            </button>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
                {builderData?.logo_url ? (
                  <Image
                    src={builderData.logo_url}
                    alt={`${builderData.builder_name || "Builder"} Logo`}
                    width={40}
                    height={40}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Image
                    src="/logo_house.png"
                    alt="Default Logo"
                    width={20}
                    height={20}
                    className="h-5 w-5"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{"User"}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {builderData?.builder_name || "Builder"}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              const hasChildren = item.children && item.children.length > 0;
              const isExpanded = expandedMenus.includes(item.name);
              const isChildActive =
                hasChildren &&
                item.children?.some((child) => pathname === child.href);

              return (
                <div key={item.name}>
                  <button
                    onClick={() => {
                      if (hasChildren) {
                        toggleSubmenu(item.name);
                      } else if (item.href) {
                        handleNavigation(item.href);
                      }
                    }}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full text-left",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : isChildActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </div>
                    {hasChildren && (
                      <div className="ml-auto">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                    )}
                  </button>

                  {/* Submenu items */}
                  {hasChildren && isExpanded && (
                    <div className="mt-1 ml-3 space-y-1">
                      {item.children?.map((subItem) => {
                        const isSubActive = pathname === subItem.href;
                        return (
                          <button
                            key={subItem.name}
                            onClick={() =>
                              subItem.href && handleNavigation(subItem.href)
                            }
                            className={cn(
                              "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors w-full text-left",
                              isSubActive
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            )}
                          >
                            <subItem.icon className="h-4 w-4" />
                            <span>{subItem.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Sign Out */}
          <div className="p-4 border-t">
            <Button
              variant="ghost"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full justify-start"
            >
              {isSigningOut ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-3" />
              ) : (
                <LogOut className="h-5 w-5 mr-3" />
              )}
              {isSigningOut ? "Signing out..." : "Sign Out"}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Mobile Header */}
        <header className="lg:hidden bg-card border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <button
              onClick={() => handleNavigation("/dashboard")}
              className="flex items-center space-x-2"
            >
              <Image
                src="/logo_house.png"
                alt="C360 Logo"
                width={24}
                height={24}
                className="h-6 w-6"
              />
              <span className="font-bold">MyConstruction App</span>
            </button>
            <div className="w-8" /> {/* Spacer for balance */}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 relative">
          {/* Navigation Loading Overlay */}
          {isNavigating && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground text-lg">Loading page...</p>
              </div>
            </div>
          )}

          {/* Sign Out Loading Overlay */}
          {isSigningOut && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground text-lg">Signing out...</p>
              </div>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
