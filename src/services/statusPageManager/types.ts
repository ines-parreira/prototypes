export enum ComponentStatus {
    Operational = 'operational',
    DegradedPerformance = 'degraded_performance',
    PartialOutage = 'partial_outage',
    MajorOutage = 'major_outage',
}

export enum MaintenanceStatus {
    Scheduled = 'scheduled',
    InProgress = 'in_progress',
    Verifying = 'verifying',
    Completed = 'completed',
}

export type StatusPage = {
    id: string
    name: string
    url: string
    page?: string
}

export type StatusPageComponent = {
    id: string
    group_id: string
    name: string
    status: ComponentStatus
}

export type StatusPageComponentsResponseData = {
    page: StatusPage
    components: StatusPageComponent[]
}

export type StatusPageScheduledMaintenance = {
    status: MaintenanceStatus
    scheduled_for: string
    components: StatusPageComponent[]
}

export type StatusPageScheduledMaintenanceResponseData = {
    page: StatusPage
    scheduled_maintenances: StatusPageScheduledMaintenance[]
}

export declare class Page {
    constructor(page: Partial<StatusPage>)

    public components(component: {
        success: (data: StatusPageComponentsResponseData) => void
    }): void

    public scheduled_maintenances(component: {
        success: (data: StatusPageScheduledMaintenanceResponseData) => void
    }): void
}
