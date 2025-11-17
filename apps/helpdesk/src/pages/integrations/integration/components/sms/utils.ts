import type { Integration } from '@gorgias/helpdesk-queries'

import type { NewPhoneNumber } from 'models/phoneNumber/types'

export const getIntegrationName = (
    integration: Integration | undefined,
    phoneNumbers: Record<number, NewPhoneNumber>,
) => {
    if (!integration) {
        return ''
    }

    // we don't have good typing in helpdesk-queries for SmsIntegration
    if (typeof integration.meta?.phone_number_id !== 'number') {
        return integration.name
    }

    const phoneNumber = phoneNumbers[integration.meta.phone_number_id]
    if (!phoneNumber) {
        return integration.name
    }

    return `${integration.name} (${phoneNumber.phone_number_friendly})`
}
