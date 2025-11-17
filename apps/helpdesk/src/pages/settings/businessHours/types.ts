import type {
    BusinessHoursCreate,
    BusinessHoursUpdate,
} from '@gorgias/helpdesk-types'

type CommonTemporaryBusinessHoursFormValues = {
    overrideConfirmation?: boolean
}

export type BusinessHoursCreateFormValues = BusinessHoursCreate &
    CommonTemporaryBusinessHoursFormValues & {
        assigned_integrations: {
            assign_integrations: number[]
        }
    }

export type EditCustomBusinessHoursFormValues = BusinessHoursUpdate &
    CommonTemporaryBusinessHoursFormValues & {
        assigned_integrations: {
            assign_integrations: number[]
            unassign_integrations: number[]
        }
        previous_assigned_integrations: number[]
        temporary_assigned_integrations: number[]
    }

export type CustomBusinessHoursFormValues =
    | BusinessHoursCreateFormValues
    | EditCustomBusinessHoursFormValues
