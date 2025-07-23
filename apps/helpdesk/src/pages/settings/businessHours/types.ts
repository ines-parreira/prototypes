import {
    BusinessHoursCreate,
    BusinessHoursUpdate,
} from '@gorgias/helpdesk-types'

export type BusinessHoursCreateFormValues = BusinessHoursCreate & {
    assigned_integrations: {
        assign_integrations: number[]
    }
}

export type EditCustomBusinessHoursFormValues = BusinessHoursUpdate & {
    assigned_integrations: {
        assign_integrations: number[]
        unassign_integrations: number[]
    }
    previous_assigned_integrations: number[]
    temporary_assigned_integrations: number[]
}
