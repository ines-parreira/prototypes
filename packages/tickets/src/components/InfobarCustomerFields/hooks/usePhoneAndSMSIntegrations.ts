import { useMemo } from 'react'

import type { PhoneIntegration, SmsIntegration } from '@gorgias/helpdesk-types'

import { useAllIntegrations } from './useAllIntegrations'
import { useAllPhoneNumbers } from './useAllPhoneNumbers'

export function usePhoneAndSMSIntegrations() {
    const {
        integrations: phoneIntegrations,
        isLoading: arePhoneIntegrationsLoading,
    } = useAllIntegrations('phone')

    const {
        integrations: smsIntegrations,
        isLoading: areSmsIntegrationsLoading,
    } = useAllIntegrations('sms')

    const {
        phoneNumbers: phoneNumbersList,
        isLoading: arePhoneNumbersLoading,
    } = useAllPhoneNumbers()

    const phoneNumbers = useMemo(() => {
        return phoneNumbersList.reduce(
            (acc, phoneNumber) => {
                if (phoneNumber.id) {
                    acc[phoneNumber.id] = {
                        phone_number: phoneNumber.phone_number || '',
                        phone_number_friendly:
                            phoneNumber.phone_number_friendly || '',
                    }
                }
                return acc
            },
            {} as Record<
                number,
                { phone_number: string; phone_number_friendly: string }
            >,
        )
    }, [phoneNumbersList])

    return useMemo(
        () => ({
            phoneIntegrations: phoneIntegrations as PhoneIntegration[],
            smsIntegrations: smsIntegrations as SmsIntegration[],
            phoneNumbers,
            isLoading:
                arePhoneIntegrationsLoading ||
                areSmsIntegrationsLoading ||
                arePhoneNumbersLoading,
        }),
        [
            phoneIntegrations,
            smsIntegrations,
            phoneNumbers,
            arePhoneIntegrationsLoading,
            areSmsIntegrationsLoading,
            arePhoneNumbersLoading,
        ],
    )
}
