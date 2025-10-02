"use client";

import React, { useState } from "react";
import { api } from "../../app/providers";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import type { LotStatus } from "../../types/database";

interface LotStatusFormProps {
  lotStatus: LotStatus | null;
  onClose: () => void;
  builderId: string;
}

export function LotStatusForm({
  lotStatus,
  onClose,
  builderId,
}: LotStatusFormProps) {
  const [formData, setFormData] = useState({
    divisionId: lotStatus?.division_id || "",
    lotStatus: lotStatus?.lot_status || "",
    lotStatusCustomDesc: lotStatus?.lot_status_custom_desc || "",
    colorCode: lotStatus?.color_code || "",
  });

  const { data: divisions } = api.divisions.getAll.useQuery({ builderId });

  const createLotStatus = api.lotStatuses.create.useMutation({
    onSuccess: () => {
      onClose();
    },
  });

  const updateLotStatus = api.lotStatuses.update.useMutation({
    onSuccess: () => {
      onClose();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = {
        builderId,
        divisionId: formData.divisionId,
        lotStatus: formData.lotStatus,
        lotStatusCustomDesc: formData.lotStatusCustomDesc,
        colorCode: formData.colorCode || null,
      };

      if (lotStatus) {
        await updateLotStatus.mutateAsync({
          ...data,
          lotStatusId: lotStatus.lot_status_id,
        });
      } else {
        await createLotStatus.mutateAsync(data);
      }
    } catch (error) {
      console.error("Error saving lot status:", error);
    }
  };

  const handleChange = (field: string, value: string) => {
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
            {lotStatus ? "Edit Lot Status" : "Add New Lot Status"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="divisionId">Division *</Label>
            <Select
              value={formData.divisionId}
              onValueChange={(value) => handleChange("divisionId", value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a division" />
              </SelectTrigger>
              <SelectContent>
                {divisions?.map((division: any) => (
                  <SelectItem
                    key={division.division_id}
                    value={division.division_id}
                  >
                    {division.division_code} - {division.division_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="lotStatus">Lot Status *</Label>
            <Input
              id="lotStatus"
              value={formData.lotStatus}
              onChange={(e) => handleChange("lotStatus", e.target.value)}
              required
              placeholder="e.g., Available"
            />
          </div>

          <div>
            <Label htmlFor="lotStatusCustomDesc">Description *</Label>
            <Input
              id="lotStatusCustomDesc"
              value={formData.lotStatusCustomDesc}
              onChange={(e) =>
                handleChange("lotStatusCustomDesc", e.target.value)
              }
              required
              placeholder="e.g., Lot is available for sale"
            />
          </div>

          <div>
            <Label htmlFor="colorCode">Color Code</Label>
            <div className="flex gap-2">
              <Input
                id="colorCode"
                type="color"
                value={formData.colorCode || "#000000"}
                onChange={(e) => handleChange("colorCode", e.target.value)}
                className="w-20"
              />
              <Input
                value={formData.colorCode}
                onChange={(e) => handleChange("colorCode", e.target.value)}
                placeholder="#RRGGBB"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {lotStatus ? "Update" : "Create"} Lot Status
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
