"use client";

import React, { useState, useRef } from "react";
import { api } from "../../app/providers";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import type { Builder } from "../../types/database";

interface BuilderFormProps {
  builder: Builder | null;
  onClose: () => void;
}

const timezones = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Phoenix",
  "America/Los_Angeles",
  "America/Anchorage",
  "Pacific/Honolulu",
];

const currencies = ["USD", "CAD", "EUR", "GBP", "AUD", "MXN"];

export function BuilderForm({ builder, onClose }: BuilderFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(
    builder?.logo_url || null
  );
  const [formData, setFormData] = useState({
    builderName: builder?.builder_name || "",
    address1: builder?.address1 || "",
    city: builder?.city || "",
    state: builder?.state || "",
    zip: builder?.zip || "",
    country: builder?.country || "USA",
    currency: builder?.currency || "USD",
    workPhone: builder?.work_phone || "",
    mobilePhone: builder?.mobile_phone || "",
    fax: builder?.fax || "",
    accountingContactName: builder?.accounting_contact_name || "",
    accountingEmail: builder?.accounting_email || "",
    localTimeZoneName: builder?.local_time_zone_name || "America/New_York",
    logoUrl: builder?.logo_url || "",
  });

  const createBuilder = api.builders.create.useMutation({
    onSuccess: () => {
      onClose();
    },
  });

  const updateBuilder = api.builders.update.useMutation({
    onSuccess: () => {
      onClose();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (builder) {
        await updateBuilder.mutateAsync({
          builderId: builder.builder_id,
          ...formData,
        });
      } else {
        await createBuilder.mutateAsync(formData);
      }
    } catch (error) {
      console.error("Error saving builder:", error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ];
    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a valid image file (JPEG, PNG, GIF, WebP, or SVG)");
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert("File size must be less than 5MB");
      return;
    }

    // Convert to base64 for preview and storage
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setLogoPreview(base64String);
      setFormData((prev) => ({
        ...prev,
        logoUrl: base64String,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleLogoRemove = () => {
    setLogoPreview(null);
    setFormData((prev) => ({
      ...prev,
      logoUrl: "",
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {builder ? "Edit Builder" : "Add New Builder"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="branding">Branding</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="accounting">Accounting</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <div>
                <Label htmlFor="builderName">Builder Name *</Label>
                <Input
                  id="builderName"
                  value={formData.builderName}
                  onChange={(e) => handleChange("builderName", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="address1">Address</Label>
                <Input
                  id="address1"
                  value={formData.address1}
                  onChange={(e) => handleChange("address1", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleChange("state", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input
                    id="zip"
                    value={formData.zip}
                    onChange={(e) => handleChange("zip", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleChange("country", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => handleChange("currency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="localTimeZoneName">Time Zone</Label>
                  <Select
                    value={formData.localTimeZoneName}
                    onValueChange={(value) =>
                      handleChange("localTimeZoneName", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {tz}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="branding" className="space-y-4">
              <div>
                <Label htmlFor="logo">Company Logo</Label>
                <div className="mt-2 space-y-4">
                  {logoPreview ? (
                    <div className="relative inline-block">
                      <div className="relative w-32 h-32 border rounded-lg overflow-hidden bg-gray-50">
                        <Image
                          src={logoPreview}
                          alt="Company logo"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={handleLogoRemove}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Upload Logo</span>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <p className="text-sm text-muted-foreground">
                    Recommended size: 200x200px. Max file size: 5MB.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4">
              <div>
                <Label htmlFor="workPhone">Work Phone</Label>
                <Input
                  id="workPhone"
                  value={formData.workPhone}
                  onChange={(e) => handleChange("workPhone", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="mobilePhone">Mobile Phone</Label>
                <Input
                  id="mobilePhone"
                  value={formData.mobilePhone}
                  onChange={(e) => handleChange("mobilePhone", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="fax">Fax</Label>
                <Input
                  id="fax"
                  value={formData.fax}
                  onChange={(e) => handleChange("fax", e.target.value)}
                />
              </div>
            </TabsContent>

            <TabsContent value="accounting" className="space-y-4">
              <div>
                <Label htmlFor="accountingContactName">
                  Accounting Contact Name
                </Label>
                <Input
                  id="accountingContactName"
                  value={formData.accountingContactName}
                  onChange={(e) =>
                    handleChange("accountingContactName", e.target.value)
                  }
                />
              </div>

              <div>
                <Label htmlFor="accountingEmail">Accounting Email</Label>
                <Input
                  id="accountingEmail"
                  type="email"
                  value={formData.accountingEmail}
                  onChange={(e) =>
                    handleChange("accountingEmail", e.target.value)
                  }
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {builder ? "Update" : "Create"} Builder
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
