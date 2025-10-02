"use client";

import React, { useState } from "react";
import { api } from "../../app/providers";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Switch } from "../ui/switch";
import type { InsuranceType } from "../../types/database";

interface InsuranceTypeFormProps {
  insuranceType: InsuranceType | null;
  onClose: () => void;
  builderId: string;
}

export function InsuranceTypeForm({
  insuranceType,
  onClose,
  builderId,
}: InsuranceTypeFormProps) {
  const [formData, setFormData] = useState({
    insuranceType: insuranceType?.insurance_type || "",
    description: insuranceType?.description || "",
    isTracking: insuranceType?.is_tracking || false,
  });

  const createInsuranceType = api.insuranceTypes.create.useMutation({
    onSuccess: () => {
      onClose();
    },
  });

  const updateInsuranceType = api.insuranceTypes.update.useMutation({
    onSuccess: () => {
      onClose();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (insuranceType) {
        await updateInsuranceType.mutateAsync({
          builderId,
          insuranceTypeId: insuranceType.insurance_type_id,
          ...formData,
        });
      } else {
        await createInsuranceType.mutateAsync({
          builderId,
          ...formData,
        });
      }
    } catch (error) {
      console.error("Error saving insurance type:", error);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {insuranceType ? "Edit Insurance Type" : "Add New Insurance Type"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="insuranceType">Insurance Type *</Label>
            <Input
              id="insuranceType"
              value={formData.insuranceType}
              onChange={(e) => handleChange("insuranceType", e.target.value)}
              required
              placeholder="e.g., General Liability"
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              required
              placeholder="e.g., General liability insurance coverage"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="isTracking">Enable Tracking</Label>
            <Switch
              id="isTracking"
              checked={formData.isTracking}
              onCheckedChange={(checked) => handleChange("isTracking", checked)}
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {insuranceType ? "Update" : "Create"} Insurance Type
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
