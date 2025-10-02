"use client";

import { useState, useCallback } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { api } from "../../app/providers";

interface DivisionFormProps {
  builderId: string;
  division?: any;
  users: any[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function DivisionForm({
  builderId,
  division,
  users,
  onSuccess,
  onCancel,
}: DivisionFormProps) {
  const [formData, setFormData] = useState({
    divisionCode: division?.division_code || "",
    divisionName: division?.division_name || "",
    logo: division?.logo || "",
    address1: division?.address1 || "",
    address2: division?.address2 || "",
    city: division?.city || "",
    state: division?.state || "",
    zip: division?.zip || "",
    homePhone: division?.home_phone || "",
    mobilePhone: division?.mobile_phone || "",
    workPhone: division?.work_phone || "",
    fax: division?.fax || "",
    email: division?.email || "",
    dateFormat: division?.date_format || "",
    quoteExpiryDays: division?.quote_expiry_days || null,
    lotHoldExpiryDays: division?.lot_hold_expiry_days || null,
    lotHoldNumOfDays: division?.lot_hold_num_of_days || null,
    mapsApiKey: division?.maps_api_key || "",
    timeZoneId: division?.time_zone_id || "",
    businessHoursStart: division?.business_hours_start || "",
    businessHoursEnd: division?.business_hours_end || "",
    casl: division?.casl || false,
    digitalSignatureProvider: division?.digital_signature_provider || "",
    estimatedCloseDateDays: division?.estimated_close_date_days || null,
    isDigitalSignatureReviewReqd:
      division?.is_digital_signature_review_reqd || false,
    sortOptionsBy: division?.sort_options_by || "",
    externalProviderPushEventUrl:
      division?.external_provider_push_event_url || "",
    allowMultipleQuotesOnLots: division?.allow_multiple_quotes_on_lots || false,
    salesManagerId: division?.sales_manager_id || "",
    sageIntacctEntity: division?.sage_intacct_entity || "",
    salesTaxRate: division?.sales_tax_rate || null,
    accountingDbId: division?.accounting_db_id || "",
    localTimeZoneName: division?.local_time_zone_name || "",
    loanDrawLiabilityAcct: division?.loan_draw_liability_acct || "",
  });

  // Create division mutation
  const createDivisionMutation = api.divisions.create.useMutation({
    onSuccess: () => {
      onSuccess();
    },
    onError: (error) => {
      console.error("Failed to create division:", error);
    },
  });

  // Update division mutation
  const updateDivisionMutation = api.divisions.update.useMutation({
    onSuccess: () => {
      onSuccess();
    },
    onError: (error) => {
      console.error("Failed to update division:", error);
    },
  });

  // Handle form submit
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const submitData = {
        ...formData,
        quoteExpiryDays: formData.quoteExpiryDays
          ? Number(formData.quoteExpiryDays)
          : null,
        lotHoldExpiryDays: formData.lotHoldExpiryDays
          ? Number(formData.lotHoldExpiryDays)
          : null,
        lotHoldNumOfDays: formData.lotHoldNumOfDays
          ? Number(formData.lotHoldNumOfDays)
          : null,
        estimatedCloseDateDays: formData.estimatedCloseDateDays
          ? Number(formData.estimatedCloseDateDays)
          : null,
        salesTaxRate: formData.salesTaxRate
          ? Number(formData.salesTaxRate)
          : null,
        salesManagerId: formData.salesManagerId || null,
        accountingDbId: formData.accountingDbId || null,
        timeZoneId: formData.timeZoneId || null,
      };

      if (division) {
        // Update existing division
        updateDivisionMutation.mutate({
          builderId: builderId,
          divisionId: division.division_id,
          ...submitData,
        });
      } else {
        // Create new division
        createDivisionMutation.mutate({
          builderId: builderId,
          ...submitData,
        });
      }
    },
    [
      formData,
      division,
      builderId,
      createDivisionMutation,
      updateDivisionMutation,
    ]
  );

  // Handle input changes
  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const isLoading =
    createDivisionMutation.isPending || updateDivisionMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="divisionCode">Division Code *</Label>
              <Input
                id="divisionCode"
                value={formData.divisionCode}
                onChange={(e) =>
                  handleInputChange("divisionCode", e.target.value)
                }
                placeholder="e.g., DIV001"
                required
              />
            </div>
            <div>
              <Label htmlFor="divisionName">Division Name</Label>
              <Input
                id="divisionName"
                value={formData.divisionName}
                onChange={(e) =>
                  handleInputChange("divisionName", e.target.value)
                }
                placeholder="Division name"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="salesManagerId">Sales Manager</Label>
              <Select
                value={formData.salesManagerId || "no-manager"}
                onValueChange={(value) =>
                  handleInputChange(
                    "salesManagerId",
                    value === "no-manager" ? "" : value
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a sales manager" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-manager">No manager</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.user_id} value={user.user_id}>
                      {user.first_name} {user.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="logo">Logo URL</Label>
              <Input
                id="logo"
                value={formData.logo}
                onChange={(e) => handleInputChange("logo", e.target.value)}
                placeholder="Logo URL"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Address</Label>
            <Input
              value={formData.address1}
              onChange={(e) => handleInputChange("address1", e.target.value)}
              placeholder="Address Line 1"
            />
            <Input
              value={formData.address2}
              onChange={(e) => handleInputChange("address2", e.target.value)}
              placeholder="Address Line 2"
            />
            <div className="grid grid-cols-3 gap-2">
              <Input
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                placeholder="City"
              />
              <Input
                value={formData.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                placeholder="State"
                maxLength={2}
              />
              <Input
                value={formData.zip}
                onChange={(e) => handleInputChange("zip", e.target.value)}
                placeholder="ZIP"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="email@example.com"
              />
            </div>
            <div>
              <Label htmlFor="workPhone">Work Phone</Label>
              <Input
                id="workPhone"
                value={formData.workPhone}
                onChange={(e) => handleInputChange("workPhone", e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="homePhone">Home Phone</Label>
              <Input
                id="homePhone"
                value={formData.homePhone}
                onChange={(e) => handleInputChange("homePhone", e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <Label htmlFor="mobilePhone">Mobile Phone</Label>
              <Input
                id="mobilePhone"
                value={formData.mobilePhone}
                onChange={(e) =>
                  handleInputChange("mobilePhone", e.target.value)
                }
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="fax">Fax</Label>
            <Input
              id="fax"
              value={formData.fax}
              onChange={(e) => handleInputChange("fax", e.target.value)}
              placeholder="(555) 123-4567"
            />
          </div>
        </TabsContent>

        <TabsContent value="business" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quoteExpiryDays">Quote Expiry Days</Label>
              <Input
                id="quoteExpiryDays"
                type="number"
                value={formData.quoteExpiryDays || ""}
                onChange={(e) =>
                  handleInputChange("quoteExpiryDays", e.target.value)
                }
                placeholder="30"
              />
            </div>
            <div>
              <Label htmlFor="estimatedCloseDateDays">
                Estimated Close Date Days
              </Label>
              <Input
                id="estimatedCloseDateDays"
                type="number"
                value={formData.estimatedCloseDateDays || ""}
                onChange={(e) =>
                  handleInputChange("estimatedCloseDateDays", e.target.value)
                }
                placeholder="90"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lotHoldExpiryDays">Lot Hold Expiry Days</Label>
              <Input
                id="lotHoldExpiryDays"
                type="number"
                value={formData.lotHoldExpiryDays || ""}
                onChange={(e) =>
                  handleInputChange("lotHoldExpiryDays", e.target.value)
                }
                placeholder="7"
              />
            </div>
            <div>
              <Label htmlFor="lotHoldNumOfDays">Lot Hold Number of Days</Label>
              <Input
                id="lotHoldNumOfDays"
                type="number"
                value={formData.lotHoldNumOfDays || ""}
                onChange={(e) =>
                  handleInputChange("lotHoldNumOfDays", e.target.value)
                }
                placeholder="14"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="salesTaxRate">Sales Tax Rate (%)</Label>
              <Input
                id="salesTaxRate"
                type="number"
                step="0.01"
                value={formData.salesTaxRate || ""}
                onChange={(e) =>
                  handleInputChange("salesTaxRate", e.target.value)
                }
                placeholder="8.25"
              />
            </div>
            <div>
              <Label htmlFor="sageIntacctEntity">Sage Intacct Entity</Label>
              <Input
                id="sageIntacctEntity"
                value={formData.sageIntacctEntity}
                onChange={(e) =>
                  handleInputChange("sageIntacctEntity", e.target.value)
                }
                placeholder="Entity ID"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="businessHoursStart">Business Hours Start</Label>
              <Input
                id="businessHoursStart"
                value={formData.businessHoursStart}
                onChange={(e) =>
                  handleInputChange("businessHoursStart", e.target.value)
                }
                placeholder="9:00 AM"
              />
            </div>
            <div>
              <Label htmlFor="businessHoursEnd">Business Hours End</Label>
              <Input
                id="businessHoursEnd"
                value={formData.businessHoursEnd}
                onChange={(e) =>
                  handleInputChange("businessHoursEnd", e.target.value)
                }
                placeholder="5:00 PM"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4 mt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>CASL Compliance</Label>
                <p className="text-sm text-muted-foreground">
                  Enable Canadian Anti-Spam Legislation compliance
                </p>
              </div>
              <Switch
                checked={formData.casl}
                onCheckedChange={(checked) =>
                  handleInputChange("casl", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Digital Signature Review Required</Label>
                <p className="text-sm text-muted-foreground">
                  Require review before sending for digital signature
                </p>
              </div>
              <Switch
                checked={formData.isDigitalSignatureReviewReqd}
                onCheckedChange={(checked) =>
                  handleInputChange("isDigitalSignatureReviewReqd", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Multiple Quotes on Lots</Label>
                <p className="text-sm text-muted-foreground">
                  Allow multiple quotes for the same lot
                </p>
              </div>
              <Switch
                checked={formData.allowMultipleQuotesOnLots}
                onCheckedChange={(checked) =>
                  handleInputChange("allowMultipleQuotesOnLots", checked)
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="digitalSignatureProvider">
                Digital Signature Provider
              </Label>
              <Input
                id="digitalSignatureProvider"
                value={formData.digitalSignatureProvider}
                onChange={(e) =>
                  handleInputChange("digitalSignatureProvider", e.target.value)
                }
                placeholder="DocuSign"
              />
            </div>
            <div>
              <Label htmlFor="sortOptionsBy">Sort Options By</Label>
              <Input
                id="sortOptionsBy"
                value={formData.sortOptionsBy}
                onChange={(e) =>
                  handleInputChange("sortOptionsBy", e.target.value)
                }
                placeholder="name"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="mapsApiKey">Maps API Key</Label>
            <Input
              id="mapsApiKey"
              value={formData.mapsApiKey}
              onChange={(e) => handleInputChange("mapsApiKey", e.target.value)}
              placeholder="Your Google Maps API key"
            />
          </div>

          <div>
            <Label htmlFor="externalProviderPushEventUrl">
              External Provider Push Event URL
            </Label>
            <Input
              id="externalProviderPushEventUrl"
              type="url"
              value={formData.externalProviderPushEventUrl}
              onChange={(e) =>
                handleInputChange(
                  "externalProviderPushEventUrl",
                  e.target.value
                )
              }
              placeholder="https://api.example.com/webhook"
            />
          </div>

          <div>
            <Label htmlFor="localTimeZoneName">Local Time Zone</Label>
            <Input
              id="localTimeZoneName"
              value={formData.localTimeZoneName}
              onChange={(e) =>
                handleInputChange("localTimeZoneName", e.target.value)
              }
              placeholder="America/New_York"
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
            ? division
              ? "Updating..."
              : "Creating..."
            : division
            ? "Update Division"
            : "Create Division"}
        </Button>
      </div>
    </form>
  );
}
