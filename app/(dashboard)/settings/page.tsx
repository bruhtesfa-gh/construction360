"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { api } from "../../providers";
import { useTheme } from "../../../lib/theme-context";
import { useNavigation } from "../../../lib/navigation-context";
import {
  PRESET_THEMES,
  Theme,
  ThemeColors,
  hexToHSL,
} from "../../../lib/theme-config";
import { ColorPicker } from "../../../components/ui/color-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog";
import {
  Moon,
  Sun,
  Palette,
  Save,
  Trash2,
  Edit2,
  Plus,
  Menu,
  Navigation2,
} from "lucide-react";

// Common timezone options for international use
const TIMEZONE_OPTIONS = [
  { value: "UTC", label: "UTC - Coordinated Universal Time" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Phoenix", label: "Mountain Standard Time (MST)" },
  { value: "America/Anchorage", label: "Alaska Time (AKT)" },
  { value: "Pacific/Honolulu", label: "Hawaii Time (HST)" },
  { value: "Europe/London", label: "Greenwich Mean Time (GMT)" },
  { value: "Europe/Paris", label: "Central European Time (CET)" },
  { value: "Europe/Berlin", label: "Central European Time (CET)" },
  { value: "Europe/Rome", label: "Central European Time (CET)" },
  { value: "Europe/Madrid", label: "Central European Time (CET)" },
  { value: "Europe/Amsterdam", label: "Central European Time (CET)" },
  { value: "Europe/Stockholm", label: "Central European Time (CET)" },
  { value: "Europe/Helsinki", label: "Eastern European Time (EET)" },
  { value: "Europe/Moscow", label: "Moscow Standard Time (MSK)" },
  { value: "Asia/Tokyo", label: "Japan Standard Time (JST)" },
  { value: "Asia/Shanghai", label: "China Standard Time (CST)" },
  { value: "Asia/Hong_Kong", label: "Hong Kong Time (HKT)" },
  { value: "Asia/Singapore", label: "Singapore Standard Time (SGT)" },
  { value: "Asia/Seoul", label: "Korea Standard Time (KST)" },
  { value: "Asia/Kolkata", label: "India Standard Time (IST)" },
  { value: "Asia/Dubai", label: "Gulf Standard Time (GST)" },
  { value: "Australia/Sydney", label: "Australian Eastern Time (AET)" },
  { value: "Australia/Melbourne", label: "Australian Eastern Time (AET)" },
  { value: "Australia/Perth", label: "Australian Western Time (AWT)" },
  { value: "Pacific/Auckland", label: "New Zealand Standard Time (NZST)" },
];

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [selectedTimezone, setSelectedTimezone] = useState<string>("UTC");
  const [isLoading, setIsLoading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [defaultGridPageSize, setDefaultGridPageSize] = useState<number>(50);

  // Theme state
  const {
    theme,
    setTheme,
    isDarkMode,
    toggleDarkMode,
    customThemes,
    addCustomTheme,
    deleteCustomTheme,
    updateCustomTheme,
  } = useTheme();

  // Navigation state
  const { menuOrientation, setMenuOrientation } = useNavigation();
  const [isCustomThemeModalOpen, setIsCustomThemeModalOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);
  const [customThemeName, setCustomThemeName] = useState("");
  const [customThemeDescription, setCustomThemeDescription] = useState("");
  const [customColors, setCustomColors] = useState<ThemeColors>(
    theme.colors.light
  );

  // Get builder information
  const builderId = session?.user?.builderId;
  const userId = session?.user?.id;

  // Fetch current builder data
  const {
    data: builder,
    isLoading: isLoadingBuilder,
    refetch,
  } = api.builders.getById.useQuery(
    { builderId: builderId! },
    { enabled: !!builderId }
  );

  // Fetch current user data for settings
  const {
    data: currentUser,
    isLoading: isLoadingUser,
    refetch: refetchUser,
  } = api.users.getById.useQuery(
    { builderId: builderId!, userId: userId! },
    { enabled: !!builderId && !!userId }
  );

  // Update timezone mutation
  const updateTimezoneMutation = api.builders.updateTimezone.useMutation({
    onSuccess: () => {
      setUpdateMessage({
        type: "success",
        text: `Timezone updated to ${
          TIMEZONE_OPTIONS.find((tz) => tz.value === selectedTimezone)?.label
        }`,
      });
      refetch();
      setTimeout(() => setUpdateMessage(null), 3000);
    },
    onError: (error) => {
      setUpdateMessage({
        type: "error",
        text: error.message || "Failed to update timezone. Please try again.",
      });
      setTimeout(() => setUpdateMessage(null), 3000);
    },
  });

  // Update user settings mutation
  const updateUserSettingsMutation = api.users.update.useMutation({
    onSuccess: () => {
      setUpdateMessage({
        type: "success",
        text: "Grid settings updated successfully",
      });
      refetchUser();
      setTimeout(() => setUpdateMessage(null), 3000);
    },
    onError: (error) => {
      setUpdateMessage({
        type: "error",
        text: error.message || "Failed to update settings. Please try again.",
      });
      setTimeout(() => setUpdateMessage(null), 3000);
    },
  });

  // Set the initial timezone from builder data
  React.useEffect(() => {
    if (builder?.local_time_zone_name) {
      setSelectedTimezone(builder.local_time_zone_name);
    }
  }, [builder]);

  // Set the initial grid page size from user data
  React.useEffect(() => {
    if (currentUser?.default_grid_page_size) {
      setDefaultGridPageSize(currentUser.default_grid_page_size);
    }
  }, [currentUser]);

  if (status === "loading" || isLoadingBuilder || isLoadingUser) {
    return (
      <div className="p-6">
        <Card>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground text-lg">
                  Loading settings...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="p-6">
        <Card>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-muted-foreground text-lg">
                  Please sign in to access settings.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleTimezoneUpdate = async () => {
    if (!builderId) {
      setUpdateMessage({
        type: "error",
        text: "Authentication error. Please sign in again.",
      });
      return;
    }

    setIsLoading(true);
    try {
      await updateTimezoneMutation.mutateAsync({
        builderId,
        timezone: selectedTimezone,
      });
    } catch {
      // Error handling is done in the mutation onError callback
    } finally {
      setIsLoading(false);
    }
  };

  const handleGridPageSizeUpdate = async () => {
    if (!builderId || !userId) {
      setUpdateMessage({
        type: "error",
        text: "Authentication error. Please sign in again.",
      });
      return;
    }

    setIsLoading(true);
    try {
      await updateUserSettingsMutation.mutateAsync({
        builderId,
        userId,
        defaultGridPageSize: defaultGridPageSize,
      });
    } catch {
      // Error handling is done in the mutation onError callback
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences and application settings.
          </p>
        </div>

        <div className="grid gap-6 max-w-4xl">
          {/* Theme Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Theme & Appearance</CardTitle>
              <CardDescription>
                Customize the look and feel of your application with preset
                themes or create your own.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Toggle between light and dark appearance
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleDarkMode}
                  className="w-20"
                >
                  {isDarkMode ? (
                    <Moon className="h-4 w-4" />
                  ) : (
                    <Sun className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Theme Selection */}
              <div className="space-y-2">
                <Label>Color Theme</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {/* Preset Themes */}
                  {PRESET_THEMES.map((presetTheme) => (
                    <button
                      key={presetTheme.id}
                      onClick={() => setTheme(presetTheme)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        theme.id === presetTheme.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{
                            backgroundColor: `hsl(${presetTheme.colors.light.primary})`,
                          }}
                        />
                        <span className="font-medium text-sm">
                          {presetTheme.name}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground text-left">
                        {presetTheme.description}
                      </p>
                    </button>
                  ))}

                  {/* Custom Themes */}
                  {customThemes.map((customTheme) => (
                    <button
                      key={customTheme.id}
                      onClick={() => setTheme(customTheme)}
                      className={`p-3 rounded-lg border-2 transition-all relative group ${
                        theme.id === customTheme.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{
                            backgroundColor: `hsl(${customTheme.colors.light.primary})`,
                          }}
                        />
                        <span className="font-medium text-sm">
                          {customTheme.name}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground text-left">
                        {customTheme.description}
                      </p>
                      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTheme(customTheme);
                            setCustomThemeName(customTheme.name);
                            setCustomThemeDescription(customTheme.description);
                            setCustomColors(customTheme.colors.light);
                            setIsCustomThemeModalOpen(true);
                          }}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCustomTheme(customTheme.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </button>
                  ))}

                  {/* Add Custom Theme Button */}
                  <button
                    onClick={() => {
                      setEditingTheme(null);
                      setCustomThemeName("");
                      setCustomThemeDescription("");
                      setCustomColors(theme.colors.light);
                      setIsCustomThemeModalOpen(true);
                    }}
                    className="p-3 rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-all flex flex-col items-center justify-center gap-2"
                  >
                    <Plus className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">Create Custom</span>
                  </button>
                </div>
              </div>

              {/* Current Theme Preview */}
              <div className="space-y-2">
                <Label>Current Theme Colors</Label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {Object.entries(
                    isDarkMode ? theme.colors.dark : theme.colors.light
                  )
                    .slice(0, 8)
                    .map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <div
                          className="h-8 w-8 rounded border"
                          style={{ backgroundColor: `hsl(${value})` }}
                        />
                        <span className="text-xs capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timezone Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Timezone Preferences</CardTitle>
              <CardDescription>
                Set your local timezone to display dates and times correctly.
                All data is stored in UTC for accuracy across international
                teams.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={selectedTimezone}
                  onValueChange={setSelectedTimezone}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONE_OPTIONS.map((timezone) => (
                      <SelectItem key={timezone.value} value={timezone.value}>
                        {timezone.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleTimezoneUpdate}
                  disabled={isLoading}
                  className="w-full sm:w-auto"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    "Update Timezone"
                  )}
                </Button>

                {updateMessage && (
                  <div
                    className={`mt-3 p-3 rounded-md text-sm ${
                      updateMessage.type === "success"
                        ? "bg-green-50 text-green-800 border border-green-200"
                        : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                  >
                    {updateMessage.text}
                  </div>
                )}
              </div>

              <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                <strong>Current local time:</strong>{" "}
                {new Date().toLocaleString("en-US", {
                  timeZone: selectedTimezone,
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  timeZoneName: "short",
                })}
              </div>
            </CardContent>
          </Card>

          {/* Grid Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Data Grid Preferences</CardTitle>
              <CardDescription>
                Set your default preferences for data grid display throughout
                the application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="grid-page-size">Default Records Per Page</Label>
                <Select
                  value={defaultGridPageSize.toString()}
                  onValueChange={(value) =>
                    setDefaultGridPageSize(parseInt(value))
                  }
                >
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Select page size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 records</SelectItem>
                    <SelectItem value="25">25 records</SelectItem>
                    <SelectItem value="50">50 records</SelectItem>
                    <SelectItem value="100">100 records</SelectItem>
                    <SelectItem value="200">200 records</SelectItem>
                    <SelectItem value="500">500 records</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Choose how many records to display per page in data grids.
                  Higher numbers may slow down page loading.
                </p>
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleGridPageSizeUpdate}
                  disabled={isLoading}
                  className="w-full sm:w-auto"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    "Update Grid Settings"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Navigation Preferences</CardTitle>
              <CardDescription>
                Customize how the navigation menu appears and behaves.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Menu Orientation</Label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setMenuOrientation("vertical")}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      menuOrientation === "vertical"
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Menu className="h-4 w-4" />
                    <span className="font-medium text-sm">
                      Vertical Sidebar
                    </span>
                  </button>
                  <button
                    onClick={() => setMenuOrientation("horizontal")}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      menuOrientation === "horizontal"
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Navigation2 className="h-4 w-4" />
                    <span className="font-medium text-sm">
                      Horizontal Top Bar
                    </span>
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Choose between a vertical sidebar menu or horizontal top
                  navigation bar.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Your account details and builder information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Email
                  </Label>
                  <p className="text-sm">
                    {session?.user?.email || "Not provided"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Account Type
                  </Label>
                  <p className="text-sm">Builder Account</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Custom Theme Modal */}
        <Dialog
          open={isCustomThemeModalOpen}
          onOpenChange={setIsCustomThemeModalOpen}
        >
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTheme ? "Edit Custom Theme" : "Create Custom Theme"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="theme-name">Theme Name</Label>
                <Input
                  id="theme-name"
                  value={customThemeName}
                  onChange={(e) => setCustomThemeName(e.target.value)}
                  placeholder="My Custom Theme"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="theme-description">Description</Label>
                <Input
                  id="theme-description"
                  value={customThemeDescription}
                  onChange={(e) => setCustomThemeDescription(e.target.value)}
                  placeholder="A brief description of your theme"
                />
              </div>

              <div className="space-y-4">
                <Label>Theme Colors</Label>
                <div className="grid grid-cols-2 gap-4">
                  <ColorPicker
                    label="Primary"
                    color={customColors.primary}
                    onChange={(color) =>
                      setCustomColors({ ...customColors, primary: color })
                    }
                  />
                  <ColorPicker
                    label="Secondary"
                    color={customColors.secondary}
                    onChange={(color) =>
                      setCustomColors({ ...customColors, secondary: color })
                    }
                  />
                  <ColorPicker
                    label="Accent"
                    color={customColors.accent}
                    onChange={(color) =>
                      setCustomColors({ ...customColors, accent: color })
                    }
                  />
                  <ColorPicker
                    label="Background"
                    color={customColors.background}
                    onChange={(color) =>
                      setCustomColors({ ...customColors, background: color })
                    }
                  />
                  <ColorPicker
                    label="Foreground"
                    color={customColors.foreground}
                    onChange={(color) =>
                      setCustomColors({ ...customColors, foreground: color })
                    }
                  />
                  <ColorPicker
                    label="Card"
                    color={customColors.card}
                    onChange={(color) =>
                      setCustomColors({ ...customColors, card: color })
                    }
                  />
                  <ColorPicker
                    label="Border"
                    color={customColors.border}
                    onChange={(color) =>
                      setCustomColors({ ...customColors, border: color })
                    }
                  />
                  <ColorPicker
                    label="Muted"
                    color={customColors.muted}
                    onChange={(color) =>
                      setCustomColors({ ...customColors, muted: color })
                    }
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCustomThemeModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!customThemeName) return;

                  const newTheme: Theme = {
                    id: editingTheme?.id || `custom-${Date.now()}`,
                    name: customThemeName,
                    description: customThemeDescription,
                    colors: {
                      light: {
                        ...customColors,
                        primaryForeground: "0 0% 98%",
                        secondaryForeground: customColors.foreground,
                        accentForeground: customColors.foreground,
                        cardForeground: customColors.foreground,
                        popover: customColors.card,
                        popoverForeground: customColors.foreground,
                        mutedForeground: customColors.foreground,
                        input: customColors.border,
                        ring: customColors.primary,
                        destructive: "0 84% 60%",
                        destructiveForeground: "0 0% 98%",
                      },
                      dark: {
                        ...customColors,
                        primaryForeground: "0 0% 98%",
                        secondaryForeground: "0 0% 98%",
                        accentForeground: "0 0% 98%",
                        background: "0 0% 10%",
                        foreground: "0 0% 98%",
                        card: "0 0% 12%",
                        cardForeground: "0 0% 98%",
                        popover: "0 0% 12%",
                        popoverForeground: "0 0% 98%",
                        muted: "0 0% 20%",
                        mutedForeground: "0 0% 60%",
                        border: "0 0% 20%",
                        input: "0 0% 20%",
                        ring: customColors.primary,
                        destructive: "0 84% 60%",
                        destructiveForeground: "0 0% 98%",
                      },
                    },
                    isCustom: true,
                  };

                  if (editingTheme) {
                    updateCustomTheme(newTheme);
                  } else {
                    addCustomTheme(newTheme);
                  }

                  setIsCustomThemeModalOpen(false);
                }}
                disabled={!customThemeName}
              >
                <Save className="h-4 w-4 mr-2" />
                {editingTheme ? "Update Theme" : "Save Theme"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
