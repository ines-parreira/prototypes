import { useMemo } from 'react'

import useAppSelector from 'hooks/useAppSelector'
import { NewPhoneNumber } from 'models/phoneNumber/types'
import { getNewPhoneNumbers } from 'state/entities/phoneNumbers/selectors'

export const useAiJourneyPhoneList = (monitoredSmsIntegrations: number[]) => {
    const phoneNumbers = useAppSelector(getNewPhoneNumbers)

    // Phone numbers with name starting with '[MKT]' are considered allowed to marketing capability
    const marketingCapabilityPhoneNumbers = useMemo(() => {
        return Object.values(phoneNumbers).filter(
            (phoneNumber: NewPhoneNumber) => {
                const smsIntegration = phoneNumber.integrations.find(
                    (integration) => integration.type === 'sms',
                )

                return (
                    // has marketing capability
                    phoneNumber.capabilities.sms === true &&
                    // has sms integration and is in monitored list
                    smsIntegration?.id &&
                    monitoredSmsIntegrations.includes(smsIntegration.id) &&
                    // has name starting with '[MKT]'
                    phoneNumber.name.startsWith('[MKT]')
                )
            },
        )
    }, [phoneNumbers, monitoredSmsIntegrations])

    return {
        marketingCapabilityPhoneNumbers,
    }
}
