// web/src/types/schedule.ts
// TypeScript interfaces for Bryntum Gantt integration

export interface Task {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    duration?: number;
    durationUnit?: string;
    percentDone?: number;
    parentId?: string;
    expanded?: boolean;

    // Construction-specific fields
    jobNumber?: string;
    unitNumber?: string;
    poIndex?: string;
    poRequired?: boolean;
    poStatus?: string;
    poBlocked?: boolean;
    poDeliveryDate?: Date;
    supplierName?: string;
    jcCostCode?: string;

    // Task properties
    isMilestone?: boolean;
    isCompleted?: boolean;
    isOnHold?: boolean;
    varianceCode?: string;

    // Visual styling
    cls?: string;
    color?: string;

    // Baseline tracking
    baselineStartDate?: Date;
    baselineEndDate?: Date;
    actualStartDate?: Date;
    actualEndDate?: Date;
}

export interface Dependency {
    id: string | number;
    fromTask: string;
    toTask: string;
    type: number; // 0=FS, 1=SS, 2=FF, 3=SF
    lag?: number;
    lagUnit?: string;
}

export interface Resource {
    id: string;
    name: string;
    type: string;
    phone?: string;
    email?: string;
    activeTasks?: number;
    completedTasks?: number;
    blockedTasks?: number;
}

export interface GanttData {
    tasks: Task[];
    dependencies: Dependency[];
    resources: Resource[];
    metadata?: {
        scheduleId: string;
        builderId: string;
        lastUpdated: Date;
    };
}

// Database entity types
export interface DBTask {
    schedule_task_id: string;
    builder_id: string;
    schedule_id: string;
    job_number: string;
    unit_number?: string;
    parent_task_id?: string;
    display_level: number;
    description: string;
    expected_duration: number;
    scheduled_start: string;
    scheduled_finish: string;
    percent_complete: number;
    is_milestone: boolean;
    is_completed: boolean;
    is_on_hold: boolean;
    po_index?: string;
    jc_cost_code?: string;
    variance_code?: string;
    baseline_start?: string;
    baseline_finish?: string;
    actual_start?: string;
    actual_finish?: string;

    // Joined fields from other tables
    po_status?: string;
    po_delivery_date?: string;
    po_blocked?: boolean;
    supplier_name?: string;
    supplier_id?: string;
}

export interface DBConstraint {
    constraint_id: number;
    constraint_type: string;
    schedule_task_id: string;
    predecessor_task_id: string;
    lag_days?: number;
}

export interface DBResource {
    supplier_id: string;
    supplier_name: string;
    supplier_phone?: string;
    supplier_email?: string;
    active_tasks?: number;
    completed_tasks?: number;
    blocked_tasks?: number;
}

// API request/response types
export interface TaskUpdateRequest {
    scheduled_start?: Date;
    scheduled_finish?: Date;
    expected_duration?: number;
    percent_complete?: number;
    is_completed?: boolean;
    modified_date?: Date;
}

export interface POStatusUpdateRequest {
    status: string;
    notes?: string;
}

export interface CriticalPathResponse {
    tasks: Task[];
    critical_path: string[];
    project_duration: number;
    blocked_tasks: number;
}

// Bryntum event types
export interface BryntumTaskEditEvent {
    taskRecord: any;
    changes: Record<string, any>;
}

export interface BryntumDependencyEditEvent {
    dependencyRecord: any;
    changes: Record<string, any>;
}

// Gantt configuration types
export interface GanttColumn {
    type?: string;
    field?: string;
    text: string;
    width?: number;
    editor?: any;
    renderer?: (params: { record: any }) => string;
}

export interface GanttFeatures {
    criticalPaths?: boolean;
    baselines?: boolean | { disabled: boolean };
    labels?: {
        left?: { field: string };
        right?: { field: string; renderer?: (params: any) => string };
    };
    taskEdit?: {
        items?: Record<string, any>;
    };
    taskMenu?: {
        items?: Record<string, any>;
    };
}

export interface GanttConfig {
    project?: {
        tasksData?: Task[];
        dependenciesData?: Dependency[];
        resourcesData?: Resource[];
        autoLoad?: boolean;
        syncDataOnLoad?: boolean;
    };
    columns?: GanttColumn[];
    features?: GanttFeatures;
    startDate?: Date;
    endDate?: Date;
    viewPreset?: string;
    rowHeight?: number;
    barMargin?: number;
    tbar?: any[];
    listeners?: Record<string, (...args: any[]) => void>;
}