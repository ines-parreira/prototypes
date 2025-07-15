import { useMemo } from 'react'

import { useSmsIntegrations } from 'AIJourney/queries'
import useAppSelector from 'hooks/useAppSelector'
import { NewPhoneNumber } from 'models/phoneNumber/types'
import { getNewPhoneNumbers } from 'state/entities/phoneNumbers/selectors'

export const useAiJourneyPhoneList = (storeIntegrationId?: number) => {
    const phoneNumbers = useAppSelector(getNewPhoneNumbers)
    const {
        // The list of phone numbers already associated with an AI Journey
        data: smsIntegrationsInUse,
        isError: fetchSmsIntegrationError,
        isLoading: fetchSmsIntegrationLoading,
    } = useSmsIntegrations()

    // Phone numbers with name starting with '[MKT]' are considered allowed to marketing capability
    const marketingCapabilityPhoneNumbers = useMemo(() => {
        return Object.values(phoneNumbers).filter(
            (phoneNumber: NewPhoneNumber) =>
                // has marketing capability
                phoneNumber.capabilities.sms === true &&
                // has sms integration
                phoneNumber.integrations.some(
                    (integration) => integration.type === 'sms',
                ) &&
                // has name starting with '[MKT]'
                phoneNumber.name.startsWith('[MKT]'),
        )
    }, [phoneNumbers])

    const eligiblePhoneNumbers = useMemo(() => {
        return marketingCapabilityPhoneNumbers.filter((phoneNumber) => {
            const phoneNumberSmsIntegrationId = phoneNumber.integrations.find(
                (integration) => integration.type === 'sms',
            )?.id

            // Exclude phone numbers that are already associated with an AI Journey
            const isAlreadyAssociated = smsIntegrationsInUse?.some(
                (integration) => {
                    return (
                        // integration ID is included in the list of already associated phone numbers
                        integration.sms_integration_id ===
                            phoneNumberSmsIntegrationId &&
                        // we can allow users to see the phone they currently have configured
                        integration.store_integration_id !== storeIntegrationId
                    )
                },
            )

            return !isAlreadyAssociated
        })
    }, [
        marketingCapabilityPhoneNumbers,
        smsIntegrationsInUse,
        storeIntegrationId,
    ])

    return {
        eligiblePhoneNumbers,
        marketingCapabilityPhoneNumbers,
        isLoading: fetchSmsIntegrationLoading,
        error: fetchSmsIntegrationError,
    }
}
