"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "../ui/button";
import { ChevronDown, LogOut, Menu, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { api } from "../../app/providers";
import { NavigationItem } from "./Navigation";
import { useGetByIdQuery } from "../../store/apis/buildersApi";

interface HorizontalNavigationProps {
  navigationItems: NavigationItem[];
  children: React.ReactNode;
}

export function HorizontalNavigation({
  navigationItems,
  children,
}: HorizontalNavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([]);
  const navRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Reset navigation loading when pathname changes
  useEffect(() => {
    setIsNavigating(false);
    // Also close any open dropdowns when navigating to new page
    setOpenDropdowns([]);
  }, [pathname]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdowns([]);
      }
    };

    if (openDropdowns.length > 0) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [openDropdowns]);

  // Handle navigation loading state
  const handleNavigation = (href: string) => {
    if (pathname !== href) {
      setIsNavigating(true);
      router.push(href);
    }
    setMobileMenuOpen(false);
    setOpenDropdowns([]);
  };

  // Toggle dropdown
  const toggleDropdown = (menuName: string) => {
    setOpenDropdowns((prev) =>
      prev.includes(menuName)
        ? prev.filter((name) => name !== menuName)
        : [...prev, menuName]
    );
  };

  // Fetch builder data including logo
  const { data: builderData } = useGetByIdQuery({
    builderId: "e5e94058-75c6-4514-88a3-531af3afb750",
  });

  // Handle sign out with loading state
  const handleSignOut = async () => {};

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header ref={navRef} className="bg-card border-b shadow-sm">
        <div className="px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              onClick={() => handleNavigation("/dashboard")}
              className="flex items-center space-x-2"
            >
              <Image
                src="/logo_house.png"
                alt="My Construction App Logo"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="text-xl font-bold">My Construction App</span>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                const hasChildren = item.children && item.children.length > 0;
                const isOpen = openDropdowns.includes(item.name);
                const isChildActive =
                  hasChildren &&
                  item.children?.some((child) => pathname === child.href);

                return (
                  <div key={item.name} className="relative">
                    {hasChildren ? (
                      <div>
                        <button
                          onClick={() => toggleDropdown(item.name)}
                          className={cn(
                            "flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                            isChildActive
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.name}</span>
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 transition-transform",
                              isOpen && "rotate-180"
                            )}
                          />
                        </button>

                        {/* Dropdown Menu */}
                        {isOpen && (
                          <div className="absolute top-full left-0 mt-1 w-56 bg-card border rounded-lg shadow-lg z-50">
                            <div className="py-2">
                              {item.children?.map((subItem) => {
                                const isSubActive = pathname === subItem.href;
                                return (
                                  <button
                                    key={subItem.name}
                                    onClick={() =>
                                      subItem.href &&
                                      handleNavigation(subItem.href)
                                    }
                                    className={cn(
                                      "flex items-center space-x-2 px-4 py-2 text-sm w-full text-left transition-colors",
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
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => item.href && handleNavigation(item.href)}
                        className={cn(
                          "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* User Info & Sign Out */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
                  {builderData?.logo_url ? (
                    <Image
                      src={builderData.logo_url}
                      alt={`${builderData.builder_name || "Builder"} Logo`}
                      width={32}
                      height={32}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Image
                      src="/logo_house.png"
                      alt="Default Logo"
                      width={16}
                      height={16}
                      className="h-4 w-4"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{"User"}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {"Builder"}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                disabled={isSigningOut}
              >
                {isSigningOut ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                ) : (
                  <LogOut className="h-4 w-4 mr-2" />
                )}
                {isSigningOut ? "Signing out..." : "Sign Out"}
              </Button>
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-card border-t">
            <div className="px-4 py-2 space-y-1">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                const hasChildren = item.children && item.children.length > 0;
                const isChildActive =
                  hasChildren &&
                  item.children?.some((child) => pathname === child.href);

                return (
                  <div key={item.name}>
                    <button
                      onClick={() => {
                        if (hasChildren) {
                          toggleDropdown(item.name);
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
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform",
                            openDropdowns.includes(item.name) && "rotate-180"
                          )}
                        />
                      )}
                    </button>

                    {/* Mobile Submenu items */}
                    {hasChildren && openDropdowns.includes(item.name) && (
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

              {/* Mobile User Info & Sign Out */}
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center space-x-3 px-3 py-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
                    {builderData?.logo_url ? (
                      <Image
                        src={builderData.logo_url}
                        alt={`${builderData.builder_name || "Builder"} Logo`}
                        width={32}
                        height={32}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Image
                        src="/logo_house.png"
                        alt="Default Logo"
                        width={16}
                        height={16}
                        className="h-4 w-4"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{"User"}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {"Builder"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="w-full justify-start mt-2"
                >
                  {isSigningOut ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  ) : (
                    <LogOut className="h-4 w-4 mr-2" />
                  )}
                  {isSigningOut ? "Signing out..." : "Sign Out"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
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
  );
}
