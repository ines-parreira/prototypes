export enum ComponentStatus {
    Operational = 'operational',
    DegradedPerformance = 'degraded_performance',
    PartialOutage = 'partial_outage',
    MajorOutage = 'major_outage',
}

export enum IncidentImpact {
    None = 'none',
    Minor = 'minor',
    Major = 'major',
    Critical = 'critical',
    Maintenance = 'maintenance',
}

export enum IncidentStatus {
    Investigating = 'investigating',
    Identified = 'identified',
    Monitoring = 'monitoring',
    Resolved = 'resolved',
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

export type StatusPageIncident = {
    id: string
    name: string
    impact: IncidentImpact
    status: IncidentStatus
    components: StatusPageComponent[]
}

export type StatusPageIncidentsResponseData = {
    page: StatusPage
    incidents: StatusPageIncident[]
}

export type StatusPageScheduledMaintenance = Omit<
    StatusPageIncident,
    'status'
> & {
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

    public incidents(component: {
        filter: string
        success: (data: StatusPageIncidentsResponseData) => void
    }): void

    public scheduled_maintenances(component: {
        success: (data: StatusPageScheduledMaintenanceResponseData) => void
    }): void
}
