import { useMemo } from 'react'

import useAppSelector from 'hooks/useAppSelector'
import { NewPhoneNumber } from 'models/phoneNumber/types'
import { getNewPhoneNumbers } from 'state/entities/phoneNumbers/selectors'

export const useAiJourneyPhoneList = () => {
    const phoneNumbers = useAppSelector(getNewPhoneNumbers)

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

    return {
        marketingCapabilityPhoneNumbers,
    }
}
