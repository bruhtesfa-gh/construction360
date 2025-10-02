"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { api } from "../../app/providers";

interface ElevationFormProps {
  builderId: string;
  userId: string;
  elevation?: any;
  regions: any[];
  communities: any[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function ElevationForm({
  builderId,
  userId,
  elevation,
  regions,
  communities,
  onSuccess,
  onCancel,
}: ElevationFormProps) {
  const [formData, setFormData] = useState({
    regionId: elevation?.region_id || "",
    communityId: elevation?.community_id || "",
    communityPhaseId: elevation?.community_phase_id || "",
    floorPlanCode: elevation?.floor_plan_code || "",
    series: elevation?.series || "",
    elevationCode: elevation?.elevation_code || "",
    assemblyId: elevation?.assembly_id || "",
    floorPlanAssemblyId: elevation?.floor_plan_assembly_id || "",
    description: elevation?.description || "",
    comments: elevation?.comments || "",
    numOfBeds: elevation?.num_of_beds || null,
    numOfBaths: elevation?.num_of_baths || null,
    numOfGarages: elevation?.num_of_garages || null,
    mainFloorSize: elevation?.main_floor_size || null,
    lowerLevelSize: elevation?.lower_level_size || null,
    secondLevelSize: elevation?.second_level_size || null,
    thirdLevelSize: elevation?.third_level_size || null,
    garageSize: elevation?.garage_size || null,
    totalSize: elevation?.total_size || null,
    sellingPrice: elevation?.selling_price || null,
    cost: elevation?.cost || null,
    inactive: elevation?.inactive || false,
  });

  // Fetch related data
  const { data: floorPlans = [] } = api.elevations.getFloorPlans.useQuery(
    {
      builderId: builderId,
      communityId: formData.communityId || undefined,
    },
    { enabled: !!builderId && !!formData.communityId }
  );

  const { data: communityPhases = [] } =
    api.elevations.getCommunityPhases.useQuery(
      {
        builderId: builderId,
        communityId: formData.communityId,
      },
      { enabled: !!builderId && !!formData.communityId }
    );

  // Create elevation mutation
  const createElevationMutation = api.elevations.create.useMutation({
    onSuccess: () => {
      onSuccess();
    },
    onError: (error) => {
      console.error("Failed to create elevation:", error);
    },
  });

  // Update elevation mutation
  const updateElevationMutation = api.elevations.update.useMutation({
    onSuccess: () => {
      onSuccess();
    },
    onError: (error) => {
      console.error("Failed to update elevation:", error);
    },
  });

  // Filter communities by selected region
  const filteredCommunities = formData.regionId
    ? communities.filter((c: any) => c.region_id === formData.regionId)
    : communities;

  // Calculate total size when floor sizes change
  useEffect(() => {
    const main = Number(formData.mainFloorSize) || 0;
    const lower = Number(formData.lowerLevelSize) || 0;
    const second = Number(formData.secondLevelSize) || 0;
    const third = Number(formData.thirdLevelSize) || 0;
    const garage = Number(formData.garageSize) || 0;

    const total = main + lower + second + third + garage;
    setFormData((prev) => ({ ...prev, totalSize: total || null }));
  }, [
    formData.mainFloorSize,
    formData.lowerLevelSize,
    formData.secondLevelSize,
    formData.thirdLevelSize,
    formData.garageSize,
  ]);

  // Handle form submit
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const submitData = {
        ...formData,
        numOfBeds: formData.numOfBeds ? Number(formData.numOfBeds) : null,
        numOfBaths: formData.numOfBaths ? Number(formData.numOfBaths) : null,
        numOfGarages: formData.numOfGarages
          ? Number(formData.numOfGarages)
          : null,
        mainFloorSize: formData.mainFloorSize
          ? Number(formData.mainFloorSize)
          : null,
        lowerLevelSize: formData.lowerLevelSize
          ? Number(formData.lowerLevelSize)
          : null,
        secondLevelSize: formData.secondLevelSize
          ? Number(formData.secondLevelSize)
          : null,
        thirdLevelSize: formData.thirdLevelSize
          ? Number(formData.thirdLevelSize)
          : null,
        garageSize: formData.garageSize ? Number(formData.garageSize) : null,
        totalSize: formData.totalSize ? Number(formData.totalSize) : null,
        sellingPrice: formData.sellingPrice
          ? Number(formData.sellingPrice)
          : null,
        cost: formData.cost ? Number(formData.cost) : null,
        assemblyId: formData.assemblyId || null,
      };

      // Find a floor plan assembly ID if not set
      if (!submitData.floorPlanAssemblyId && formData.floorPlanCode) {
        const floorPlan = floorPlans.find(
          (fp: any) => fp.floor_plan_code === formData.floorPlanCode
        );
        if (floorPlan?.floor_plan_assembly_id) {
          submitData.floorPlanAssemblyId = floorPlan.floor_plan_assembly_id;
        }
      }

      if (elevation) {
        // Update existing elevation
        updateElevationMutation.mutate({
          builderId: builderId,
          elevationId: elevation.elevation_id,
          userId: userId,
          ...submitData,
        });
      } else {
        // Create new elevation
        createElevationMutation.mutate({
          builderId: builderId,
          userId: userId,
          ...submitData,
        });
      }
    },
    [
      formData,
      elevation,
      builderId,
      userId,
      floorPlans,
      createElevationMutation,
      updateElevationMutation,
    ]
  );

  // Handle input changes
  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const isLoading =
    createElevationMutation.isPending || updateElevationMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="regionId">Region *</Label>
              <Select
                value={formData.regionId}
                onValueChange={(value) => {
                  handleInputChange("regionId", value);
                  handleInputChange("communityId", "");
                  handleInputChange("communityPhaseId", "");
                }}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a region" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region.region_id} value={region.region_id}>
                      {region.region_code} - {region.description || ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="communityId">Community *</Label>
              <Select
                value={formData.communityId}
                onValueChange={(value) => {
                  handleInputChange("communityId", value);
                  handleInputChange("communityPhaseId", "");
                }}
                required
                disabled={!formData.regionId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a community" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCommunities.map((community: any) => (
                    <SelectItem
                      key={community.community_id}
                      value={community.community_id}
                    >
                      {community.community_code} - {community.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="communityPhaseId">Community Phase *</Label>
              <Select
                value={formData.communityPhaseId}
                onValueChange={(value) =>
                  handleInputChange("communityPhaseId", value)
                }
                required
                disabled={!formData.communityId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a phase" />
                </SelectTrigger>
                <SelectContent>
                  {communityPhases.map((phase: any) => (
                    <SelectItem
                      key={phase.community_phase_id}
                      value={phase.community_phase_id}
                    >
                      {phase.community_phase_code} -{" "}
                      {phase.phase_description || ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="floorPlanCode">Floor Plan *</Label>
              <Select
                value={formData.floorPlanCode}
                onValueChange={(value) =>
                  handleInputChange("floorPlanCode", value)
                }
                required
                disabled={!formData.communityId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a floor plan" />
                </SelectTrigger>
                <SelectContent>
                  {floorPlans.map((fp: any) => (
                    <SelectItem
                      key={fp.floor_plan_code}
                      value={fp.floor_plan_code}
                    >
                      {fp.floor_plan_code} - {fp.description || ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="series">Series *</Label>
              <Input
                id="series"
                value={formData.series}
                onChange={(e) => handleInputChange("series", e.target.value)}
                placeholder="e.g., Premier, Classic"
                required
              />
            </div>
            <div>
              <Label htmlFor="elevationCode">Elevation Code *</Label>
              <Input
                id="elevationCode"
                value={formData.elevationCode}
                onChange={(e) =>
                  handleInputChange("elevationCode", e.target.value)
                }
                placeholder="e.g., A, B, C"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Elevation description"
            />
          </div>

          <div>
            <Label htmlFor="comments">Comments</Label>
            <Textarea
              id="comments"
              value={formData.comments}
              onChange={(e) => handleInputChange("comments", e.target.value)}
              placeholder="Additional comments"
              rows={3}
            />
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4 mt-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="numOfBeds">Bedrooms</Label>
              <Input
                id="numOfBeds"
                type="number"
                step="0.5"
                value={formData.numOfBeds || ""}
                onChange={(e) => handleInputChange("numOfBeds", e.target.value)}
                placeholder="3"
              />
            </div>
            <div>
              <Label htmlFor="numOfBaths">Bathrooms</Label>
              <Input
                id="numOfBaths"
                type="number"
                step="0.5"
                value={formData.numOfBaths || ""}
                onChange={(e) =>
                  handleInputChange("numOfBaths", e.target.value)
                }
                placeholder="2.5"
              />
            </div>
            <div>
              <Label htmlFor="numOfGarages">Garage Bays</Label>
              <Input
                id="numOfGarages"
                type="number"
                step="0.5"
                value={formData.numOfGarages || ""}
                onChange={(e) =>
                  handleInputChange("numOfGarages", e.target.value)
                }
                placeholder="2"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Floor Sizes (sq ft)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mainFloorSize">Main Floor</Label>
                <Input
                  id="mainFloorSize"
                  type="number"
                  value={formData.mainFloorSize || ""}
                  onChange={(e) =>
                    handleInputChange("mainFloorSize", e.target.value)
                  }
                  placeholder="1500"
                />
              </div>
              <div>
                <Label htmlFor="secondLevelSize">Second Level</Label>
                <Input
                  id="secondLevelSize"
                  type="number"
                  value={formData.secondLevelSize || ""}
                  onChange={(e) =>
                    handleInputChange("secondLevelSize", e.target.value)
                  }
                  placeholder="800"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lowerLevelSize">Lower Level</Label>
                <Input
                  id="lowerLevelSize"
                  type="number"
                  value={formData.lowerLevelSize || ""}
                  onChange={(e) =>
                    handleInputChange("lowerLevelSize", e.target.value)
                  }
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="thirdLevelSize">Third Level</Label>
                <Input
                  id="thirdLevelSize"
                  type="number"
                  value={formData.thirdLevelSize || ""}
                  onChange={(e) =>
                    handleInputChange("thirdLevelSize", e.target.value)
                  }
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="garageSize">Garage</Label>
                <Input
                  id="garageSize"
                  type="number"
                  value={formData.garageSize || ""}
                  onChange={(e) =>
                    handleInputChange("garageSize", e.target.value)
                  }
                  placeholder="400"
                />
              </div>
              <div>
                <Label htmlFor="totalSize">Total Size (calculated)</Label>
                <Input
                  id="totalSize"
                  type="number"
                  value={formData.totalSize || ""}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sellingPrice">Selling Price</Label>
              <Input
                id="sellingPrice"
                type="number"
                step="0.01"
                value={formData.sellingPrice || ""}
                onChange={(e) =>
                  handleInputChange("sellingPrice", e.target.value)
                }
                placeholder="450000"
              />
            </div>
            <div>
              <Label htmlFor="cost">Cost</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={formData.cost || ""}
                onChange={(e) => handleInputChange("cost", e.target.value)}
                placeholder="350000"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Status</Label>
              <p className="text-sm text-muted-foreground">
                Set elevation as inactive to hide it from selections
              </p>
            </div>
            <Switch
              checked={formData.inactive}
              onCheckedChange={(checked) =>
                handleInputChange("inactive", checked)
              }
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? elevation
              ? "Updating..."
              : "Creating..."
            : elevation
            ? "Update Elevation"
            : "Create Elevation"}
        </Button>
      </div>
    </form>
  );
}
