import { useState } from 'react'

import { CountryCode, isValidPhoneNumber } from 'libphonenumber-js'

import useAppSelector from 'hooks/useAppSelector'
import { PhoneIntegration } from 'models/integration/types/phone'
import { UserSearchResult } from 'models/search/types'
import { getCountryFromPhoneNumber } from 'pages/phoneNumbers/utils'
import { getPhoneIntegrations } from 'state/integrations/selectors'

import useDialerOutboundCall from './useDialerOutboundCall'
import usePhoneNumbers from './usePhoneNumbers'

type UsePhoneDeviceDialerArgs = {
    onCallInitiated: () => void
}

export default function usePhoneDeviceDialer({
    onCallInitiated,
}: UsePhoneDeviceDialerArgs) {
    const [selectedNumber, setSelectedNumber] = useState('')
    const [selectedCustomer, setSelectedCustomer] =
        useState<UserSearchResult | null>(null)
    const [phoneNumberInputError, setPhoneNumberInputError] = useState<
        string | undefined
    >()
    const [country, setCountry] = useState<CountryCode | undefined>()

    const setSelectedNumberAndCustomer = (
        number: string,
        customer?: UserSearchResult,
    ) => {
        setSelectedNumber(number)
        setSelectedCustomer(customer || null)
    }
    const resetError = () => setPhoneNumberInputError(undefined)

    const phoneIntegrations = useAppSelector(getPhoneIntegrations)
    const [selectedIntegration, setSelectedIntegration] = useState(
        phoneIntegrations[0],
    )
    const { getPhoneNumberById } = usePhoneNumbers()

    const handleChangeSelectedIntegration = (integration: PhoneIntegration) => {
        setSelectedIntegration(integration)

        if (selectedNumber === '') {
            const selectedIntegrationPhoneNumber = getPhoneNumberById(
                integration.meta.phone_number_id,
            )
            const selectedIntegrationCountryCode = getCountryFromPhoneNumber(
                selectedIntegrationPhoneNumber.phone_number,
            )
            if (selectedIntegrationCountryCode) {
                setCountry(selectedIntegrationCountryCode)
            }
        }
    }

    const makeCall = useDialerOutboundCall({
        inputValue: selectedNumber,
        selectedCustomer,
        selectedIntegration,
    })

    const isSelectedNumberValid = selectedNumber !== ''

    const handleCall = () => {
        if (!isSelectedNumberValid) {
            return
        }

        if (!isValidPhoneNumber(selectedNumber)) {
            setPhoneNumberInputError('Enter a valid number')
            return
        }

        makeCall()
        onCallInitiated()
    }

    return {
        setSelectedNumberAndCustomer,
        phoneNumberInputError,
        resetError,
        country,
        setCountry,
        phoneIntegrations,
        selectedIntegration,
        setSelectedIntegration: handleChangeSelectedIntegration,
        handleCall,
        isSelectedNumberValid,
    }
}
