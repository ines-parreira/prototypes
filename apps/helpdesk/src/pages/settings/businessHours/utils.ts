import { omit } from 'lodash'

import type {
    BusinessHoursConfig,
    BusinessHoursCreate,
    BusinessHoursDetails,
    BusinessHoursUpdate,
    Timezone,
} from '@gorgias/helpdesk-types'

import {
    DEFAULT_BUSINESS_HOURS_SCHEDULE,
    EVERYDAY_OPTION_VALUE,
} from './constants'
import type {
    BusinessHoursCreateFormValues,
    CustomBusinessHoursFormValues,
    EditCustomBusinessHoursFormValues,
} from './types'

export function convertToAmPm(time24: string): string {
    const [hours, minutes] = time24.split(':').map(Number)
    const date = new Date()
    date.setHours(hours, minutes)

    return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    }).format(date)
}

export const getCreateBusinessHoursFormDefaultValues = (
    timezone: string = 'UTC',
): BusinessHoursCreateFormValues => {
    return {
        name: '',
        business_hours_config: {
            business_hours: [DEFAULT_BUSINESS_HOURS_SCHEDULE],
            timezone: timezone as Timezone,
        },
        assigned_integrations: {
            assign_integrations: [],
        },
    }
}

export const getEditCustomBusinessHoursDefaultValues = (
    businessHours: BusinessHoursDetails,
): EditCustomBusinessHoursFormValues => {
    return {
        name: businessHours.name,
        business_hours_config: businessHours.business_hours_config,
        previous_assigned_integrations:
            businessHours.assigned_integrations ?? [],
        assigned_integrations: {
            assign_integrations: businessHours.assigned_integrations ?? [],
            unassign_integrations: [],
        },
        temporary_assigned_integrations: [],
    }
}

export const getIntegrationsChangeSummary = (
    previouslyAssignedIntegrations: number[],
    currentlyAssignedIntegrations: number[],
): {
    newIntegrations: number[]
    removedIntegrations: number[]
} => {
    const newIntegrations = currentlyAssignedIntegrations.filter(
        (integration) => !previouslyAssignedIntegrations.includes(integration),
    )
    const removedIntegrations = previouslyAssignedIntegrations.filter(
        (integration) => !currentlyAssignedIntegrations.includes(integration),
    )

    return {
        newIntegrations,
        removedIntegrations,
    }
}

export const getUpdateBusinessHoursPayloadFromValues = (
    values: EditCustomBusinessHoursFormValues,
): BusinessHoursUpdate => {
    const changes = getIntegrationsChangeSummary(
        values.previous_assigned_integrations,
        values.assigned_integrations.assign_integrations,
    )

    const newValues = omit(values, [
        'temporary_assigned_integrations',
        'previous_assigned_integrations',
        'overrideConfirmation',
    ])

    return {
        ...newValues,
        assigned_integrations: {
            assign_integrations: changes.newIntegrations,
            unassign_integrations: changes.removedIntegrations,
        },
    }
}

export const getCreateCustomBusinessHoursPayloadFromValues = (
    values: CustomBusinessHoursFormValues,
): BusinessHoursCreate => {
    const newValues = omit(values, ['overrideConfirmation'])

    return newValues
}

export const is24_7Schedule = (
    businessHoursConfig: BusinessHoursConfig,
): boolean => {
    return businessHoursConfig.business_hours.some(
        (businessHours) =>
            businessHours.days === EVERYDAY_OPTION_VALUE &&
            businessHours.from_time === '00:00' &&
            businessHours.to_time === '00:00',
    )
}
