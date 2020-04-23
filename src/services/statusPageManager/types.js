// @flow

import {MAINTENANCE_STATUSES, COMPONENT_STATUSES} from './constants'

export type StatusPage = {
    id: string,
    name: string,
    url: string,
}

export type StatusPageComponent = {
    id: string,
    group_id: string,
    name: string,
    status: $Values<typeof COMPONENT_STATUSES>,
}

export type StatusPageComponentsResponseData = {
    page: StatusPage,
    components: StatusPageComponent[],
}

export type StatusPageScheduledMaintenance = {
    status: $Values<typeof MAINTENANCE_STATUSES>,
    scheduled_for: string,
    components: StatusPageComponent[]
}

export type StatusPageScheduledMaintenanceResponseData = {
    page: StatusPage,
    scheduled_maintenances: StatusPageScheduledMaintenance[],
}
