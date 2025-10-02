"use client";

// web/src/components/ConstructionGantt.tsx
// Main Bryntum Gantt component for construction scheduling

import React, { useRef, useEffect, useState, useCallback } from "react";
// import { BryntumGantt } from '@bryntum/gantt-react';
// import '@bryntum/gantt/gantt.stockholm.css';
import type { GanttData, Task, GanttConfig } from "../types/schedule";

interface ConstructionGanttProps {
  scheduleId: string;
  builderId?: string;
  className?: string;
}

const ConstructionGantt: React.FC<ConstructionGanttProps> = ({
  scheduleId,
  builderId,
  className = "",
}) => {
  const ganttRef = useRef<any>(null);
  const [ganttData, setGanttData] = useState<GanttData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load schedule data
  const loadScheduleData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual API call once backend is ready
      // const data = await scheduleApi.getScheduleForBryntum(scheduleId);

      // Sample construction data for now
      const sampleData: GanttData = {
        tasks: [
          {
            id: "1",
            name: "House Construction - Lot 15",
            startDate: new Date(2024, 0, 2),
            endDate: new Date(2024, 3, 30),
            expanded: true,
            jobNumber: "JOB-001",
            isMilestone: false,
          },
          {
            id: "2",
            name: "Site Preparation",
            parentId: "1",
            startDate: new Date(2024, 0, 2),
            endDate: new Date(2024, 0, 8),
            expanded: true,
            jobNumber: "JOB-001",
          },
          {
            id: "3",
            name: "Excavation",
            parentId: "2",
            startDate: new Date(2024, 0, 2),
            endDate: new Date(2024, 0, 4),
            duration: 3,
            percentDone: 100,
            isCompleted: true,
            jobNumber: "JOB-001",
            poIndex: "EXCAV-001",
            poRequired: true,
            poStatus: "Paid",
            supplierName: "ABC Excavation",
            jcCostCode: "02300",
            color: "#51cf66",
          },
          {
            id: "4",
            name: "Foundation Pour",
            parentId: "2",
            startDate: new Date(2024, 0, 5),
            endDate: new Date(2024, 0, 8),
            duration: 4,
            percentDone: 75,
            jobNumber: "JOB-001",
            poIndex: "FOUND-001",
            poRequired: true,
            poStatus: "Finished",
            supplierName: "XYZ Concrete",
            jcCostCode: "03300",
            color: "#339af0",
          },
          {
            id: "5",
            name: "Framing Package",
            parentId: "1",
            startDate: new Date(2024, 0, 9),
            endDate: new Date(2024, 0, 22),
            duration: 10,
            percentDone: 0,
            jobNumber: "JOB-001",
            poIndex: "FRAME-001",
            poRequired: true,
            poStatus: "In Progress",
            poBlocked: true,
            supplierName: "Frame Masters Inc",
            jcCostCode: "06100",
            color: "#ffa502",
          },
          {
            id: "6",
            name: "Roof Installation",
            parentId: "1",
            startDate: new Date(2024, 0, 23),
            endDate: new Date(2024, 1, 5),
            duration: 8,
            percentDone: 0,
            jobNumber: "JOB-001",
            poIndex: "ROOF-001",
            poRequired: true,
            poStatus: "New",
            poBlocked: true,
            supplierName: "Premier Roofing",
            jcCostCode: "07000",
            color: "#ffa502",
          },
          {
            id: "7",
            name: "Final Inspection",
            parentId: "1",
            startDate: new Date(2024, 3, 28),
            endDate: new Date(2024, 3, 30),
            duration: 2,
            percentDone: 0,
            isMilestone: true,
            jobNumber: "JOB-001",
          },
        ],
        dependencies: [
          { id: 1, fromTask: "3", toTask: "4", type: 0 },
          { id: 2, fromTask: "4", toTask: "5", type: 0 },
          { id: 3, fromTask: "5", toTask: "6", type: 0 },
          { id: 4, fromTask: "6", toTask: "7", type: 0 },
        ],
        resources: [
          { id: "exc1", name: "ABC Excavation", type: "supplier" },
          { id: "con1", name: "XYZ Concrete", type: "supplier" },
          { id: "fra1", name: "Frame Masters Inc", type: "supplier" },
          { id: "roo1", name: "Premier Roofing", type: "supplier" },
        ],
      };

      setGanttData(sampleData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load schedule data"
      );
      console.error("Failed to load schedule data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [scheduleId]);

  useEffect(() => {
    loadScheduleData();
  }, [loadScheduleData]);

  // Event handlers
  const handleTaskUpdate = async (event: any) => {
    const { taskRecord, changes } = event;
    console.log("Task updated:", taskRecord.id, changes);

    try {
      // TODO: Sync to database
      // await scheduleApi.syncTaskUpdate(taskRecord.id, {
      //   scheduled_start: taskRecord.startDate,
      //   scheduled_finish: taskRecord.endDate,
      //   expected_duration: taskRecord.duration,
      //   percent_complete: taskRecord.percentDone,
      //   is_completed: taskRecord.percentDone >= 100
      // });
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const handleDependencyUpdate = async (event: any) => {
    const { dependencyRecord, changes } = event;
    console.log("Dependency updated:", dependencyRecord.id, changes);

    try {
      // TODO: Sync to database
      // await scheduleApi.syncDependencyUpdate(dependencyRecord.id, changes);
    } catch (error) {
      console.error("Failed to update dependency:", error);
    }
  };

  const handleProgressUpdate = async (event: any) => {
    const { taskRecord, value } = event;
    console.log("Progress updated:", taskRecord.id, value);

    try {
      taskRecord.percentDone = value;
      await handleTaskUpdate({ taskRecord, changes: { percentDone: value } });

      // Check if task completion affects PO status
      if (value >= 100 && taskRecord.poRequired) {
        console.log(
          "Task completed - checking PO status update for:",
          taskRecord.poIndex
        );
        // TODO: Auto-update PO status
      }
    } catch (error) {
      console.error("Failed to update progress:", error);
    }
  };

  // Gantt configuration
  const ganttConfig: GanttConfig = {
    project: ganttData
      ? {
          tasksData: ganttData.tasks,
          dependenciesData: ganttData.dependencies,
          resourcesData: ganttData.resources,
          autoLoad: false,
          syncDataOnLoad: true,
        }
      : {},

    // Construction-specific columns
    columns: [
      {
        type: "name",
        field: "name",
        text: "Construction Task",
        width: 300,
        editor: { type: "text" },
      },
      {
        type: "startdate",
        text: "Start Date",
        width: 120,
      },
      {
        type: "enddate",
        text: "Finish Date",
        width: 120,
      },
      {
        type: "duration",
        text: "Duration",
        width: 100,
      },
      {
        type: "percentdone",
        text: "Progress",
        width: 100,
        renderer: ({ record }: { record: any }) => {
          const progress = record.percentDone || 0;
          const color =
            progress >= 100
              ? "#51cf66"
              : progress >= 50
              ? "#339af0"
              : "#ffa502";
          return `<div style="display: flex; align-items: center;">
                    <div style="width: 60px; height: 16px; background: #f1f3f4; border-radius: 8px; margin-right: 8px;">
                      <div style="width: ${progress}%; height: 100%; background: ${color}; border-radius: 8px;"></div>
                    </div>
                    <span style="font-weight: bold;">${progress}%</span>
                  </div>`;
        },
      },
      {
        text: "PO Status",
        field: "poStatus",
        width: 130,
        renderer: ({ record }: { record: any }) => {
          if (!record.poRequired)
            return '<span style="color: #6c757d;">No PO Required</span>';

          const statusColors: Record<string, string> = {
            New: "#6c757d",
            "In Progress": "#fd7e14",
            Scheduled: "#6f42c1",
            Finished: "#198754",
            "Invoice Submitted": "#0dcaf0",
            Paid: "#20c997",
          };

          const color = statusColors[record.poStatus || ""] || "#6c757d";
          const blocked = record.poBlocked ? " 🚫" : "";

          return `<span style="color: ${color}; font-weight: bold; display: flex; align-items: center;">
                    ${record.poStatus || "Unknown"}${blocked}
                  </span>`;
        },
      },
      {
        text: "Supplier",
        field: "supplierName",
        width: 150,
      },
      {
        text: "Cost Code",
        field: "jcCostCode",
        width: 100,
      },
    ],

    // Features
    features: {
      // Critical path highlighting
      criticalPaths: true,

      // Baseline comparison
      baselines: {
        disabled: false,
      },

      // Task labels on bars
      labels: {
        left: {
          field: "name",
        },
        right: {
          field: "percentDone",
          renderer: ({ taskRecord }: { taskRecord: any }) =>
            `${taskRecord.percentDone || 0}%`,
        },
      },

      // Enhanced task editor with PO information
      taskEdit: {
        items: {
          // Add custom tab for PO information
          poTab: {
            title: "PO Information",
            items: {
              poIndex: {
                type: "text",
                label: "PO Index",
                name: "poIndex",
                readOnly: true,
              },
              poStatus: {
                type: "text",
                label: "PO Status",
                name: "poStatus",
                readOnly: true,
              },
              supplierName: {
                type: "text",
                label: "Supplier",
                name: "supplierName",
                readOnly: true,
              },
              jcCostCode: {
                type: "text",
                label: "Cost Code",
                name: "jcCostCode",
              },
            },
          },
        },
      },

      // Right-click context menu
      taskMenu: {
        items: {
          markCompleted: {
            text: "Mark Completed",
            icon: "b-fa b-fa-check",
            onItem: ({ taskRecord }: { taskRecord: any }) => {
              taskRecord.percentDone = 100;
              handleProgressUpdate({ taskRecord, value: 100 });
            },
          },
          viewPO: {
            text: "View PO Details",
            icon: "b-fa b-fa-file-invoice",
            disabled: ({ taskRecord }: { taskRecord: any }) =>
              !taskRecord.poRequired,
            onItem: ({ taskRecord }: { taskRecord: any }) => {
              alert(
                `PO Details:\nIndex: ${taskRecord.poIndex}\nStatus: ${
                  taskRecord.poStatus
                }\nSupplier: ${taskRecord.supplierName}\nDelivery: ${
                  taskRecord.poDeliveryDate || "TBD"
                }`
              );
            },
          },
          createVariance: {
            text: "Create Variance Request",
            icon: "b-fa b-fa-exclamation-triangle",
            onItem: ({ taskRecord }: { taskRecord: any }) => {
              console.log("Creating variance request for task:", taskRecord.id);
              // TODO: Open variance request modal
            },
          },
        },
      },
    },

    // Timeline configuration
    startDate: new Date(2023, 11, 1), // December 1, 2023
    endDate: new Date(2024, 5, 1), // June 1, 2024
    viewPreset: "weekAndDayLetter",

    // Styling
    rowHeight: 50,
    barMargin: 10,

    // Toolbar
    tbar: [
      {
        type: "button",
        text: "Recalculate Critical Path",
        icon: "b-fa b-fa-route",
        onClick: () => {
          const gantt = ganttRef.current;
          if (gantt?.project) {
            gantt.project.calculateCriticalPaths();
            console.log("Critical path recalculated");
          }
        },
      },
      {
        type: "button",
        text: "Filter PO Blocked",
        icon: "b-fa b-fa-filter",
        toggleable: true,
        onClick: ({ pressed }: { pressed: boolean }) => {
          const gantt = ganttRef.current;
          if (gantt?.store) {
            if (pressed) {
              gantt.store.filter((record: any) => record.poBlocked);
            } else {
              gantt.store.clearFilters();
            }
          }
        },
      },
      {
        type: "button",
        text: "Show Completed Only",
        icon: "b-fa b-fa-check-circle",
        toggleable: true,
        onClick: ({ pressed }: { pressed: boolean }) => {
          const gantt = ganttRef.current;
          if (gantt?.store) {
            if (pressed) {
              gantt.store.filter((record: any) => record.percentDone >= 100);
            } else {
              gantt.store.clearFilters();
            }
          }
        },
      },
      "->",
      {
        type: "button",
        text: "Export PDF",
        icon: "b-fa b-fa-file-pdf",
        onClick: () => {
          const gantt = ganttRef.current;
          if (gantt?.features?.pdfExport) {
            gantt.features.pdfExport.export({
              fileFormat: "pdf",
              fileName: `Schedule-${scheduleId}-${
                new Date().toISOString().split("T")[0]
              }.pdf`,
            });
          }
        },
      },
      {
        type: "button",
        text: "Refresh Data",
        icon: "b-fa b-fa-refresh",
        onClick: loadScheduleData,
      },
    ],

    // Event listeners
    listeners: {
      taskEdit: handleTaskUpdate,
      dependencyEdit: handleDependencyUpdate,
      percentDoneEdit: handleProgressUpdate,
    },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">
            Loading construction schedule...
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Preparing Gantt chart for Schedule ID: {scheduleId}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-6 w-6 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-semibold text-red-800">
              Error Loading Schedule
            </h3>
            <p className="mt-2 text-red-700">{error}</p>
            <button
              onClick={loadScheduleData}
              className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`h-full ${className} flex items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300`}
    >
      <div className="text-center">
        <div className="text-4xl text-gray-400 mb-4">🏗️</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Gantt Chart Component
        </h3>
        <p className="text-gray-600">
          Bryntum Gantt component ready for integration
        </p>
      </div>
    </div>
  );
};

export default ConstructionGantt;
