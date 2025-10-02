import React, { useState } from "react";
import { JobFormField } from "./EnhancedFormField";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

// Example of how to use Enhanced Form Fields in a Job form
export const JobFormExample: React.FC = () => {
  const [formData, setFormData] = useState({
    job_number: "",
    description: "",
    construction_stage: 0,
    warranty_rep_id: "",
    site_superintendent_id: "",
  });

  const handleFieldChange = (field: string) => (value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Create New Job</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* These fields will automatically use custom labels, placeholders, and help text */}

        <JobFormField
          columnName="job_number"
          defaultLabel="Job Number"
          defaultPlaceholder="Enter job number..."
          value={formData.job_number}
          onChange={handleFieldChange("job_number")}
        />

        <JobFormField
          columnName="description"
          defaultLabel="Description"
          defaultPlaceholder="Enter job description..."
          type="textarea"
          value={formData.description}
          onChange={handleFieldChange("description")}
        />

        <JobFormField
          columnName="construction_stage"
          defaultLabel="Construction Stage"
          defaultPlaceholder="Enter stage number..."
          type="number"
          value={formData.construction_stage}
          onChange={handleFieldChange("construction_stage")}
        />

        <JobFormField
          columnName="warranty_rep_id"
          defaultLabel="Warranty Representative"
          defaultPlaceholder="Select warranty rep..."
          value={formData.warranty_rep_id}
          onChange={handleFieldChange("warranty_rep_id")}
        />

        <JobFormField
          columnName="site_superintendent_id"
          defaultLabel="Site Superintendent"
          defaultPlaceholder="Select superintendent..."
          value={formData.site_superintendent_id}
          onChange={handleFieldChange("site_superintendent_id")}
        />

        <div className="flex space-x-2 pt-4">
          <Button type="submit">Create Job</Button>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Example: What users see with different builder configurations

/*
BUILDER A (Residential) Configuration:
- job_number: 
  - Label: "Project Number"
  - Placeholder: "Enter project number (e.g., PROJ-2024-001)"
  - Help: "Unique identifier for this home construction project"

- warranty_rep_id:
  - Label: "Service Manager" 
  - Placeholder: "Choose your service manager..."
  - Help: "Person responsible for warranty and customer service"

BUILDER B (Commercial) Configuration:
- job_number:
  - Label: "Contract ID"
  - Placeholder: "Enter contract identifier"
  - Help: "Commercial project contract reference number"

- warranty_rep_id:
  - Label: "Facility Manager"
  - Placeholder: "Select facility manager..."
  - Help: "Responsible for building maintenance and operations"
*/
