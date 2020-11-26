// @flow

import {
    MAINTENANCE_STATUSES,
    COMPONENT_STATUSES,
    INCIDENT_IMPACTS,
    INCIDENT_STATUSES,
} from './constants.ts'

export type ComponentStatus = $Values<typeof COMPONENT_STATUSES>

export type MaintenanceStatus = $Values<typeof MAINTENANCE_STATUSES>

export type IncidentImpact = $Values<typeof INCIDENT_IMPACTS>

export type IncidentStatus = $Values<typeof INCIDENT_STATUSES>

export type StatusPage = {
    id: string,
    name: string,
    url: string,
}

export type StatusPageComponent = {
    id: string,
    group_id: string,
    name: string,
    status: ComponentStatus,
}

export type StatusPageIncident = {
    id: string,
    name: string,
    impact: IncidentImpact,
    status: IncidentStatus,
    components: StatusPageComponent[],
}

export type StatusPageIncidentsResponseData = {
    page: StatusPage,
    components: StatusPageIncident[],
}

export type StatusPageScheduledMaintenance = {
    status: MaintenanceStatus,
    scheduled_for: string,
    components: StatusPageComponent[],
}

export type StatusPageScheduledMaintenanceResponseData = {
    page: StatusPage,
    scheduled_maintenances: StatusPageScheduledMaintenance[],
}
