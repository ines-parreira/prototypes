import {createRef, useState} from 'react'
import {isValidPhoneNumber} from 'libphonenumber-js'
import {PhoneNumberInputHandle} from 'pages/common/forms/PhoneNumberInput/PhoneNumberInput'
import {UserSearchResult} from 'models/search/types'
import {getPhoneIntegrations} from 'state/integrations/selectors'
import useAppSelector from 'hooks/useAppSelector'

import useDialerOutboundCall from './useDialerOutboundCall'
import usePhoneDeviceDialerCustomerSuggestions from './usePhoneDeviceDialerCustomerSuggestions'

type UsePhoneDeviceDialerArgs = {
    onCallInitiated: () => void
}

export default function usePhoneDeviceDialer({
    onCallInitiated,
}: UsePhoneDeviceDialerArgs) {
    const [inputValue, setInputValue] = useState('')
    const [selectedCustomer, setSelectedCustomer] =
        useState<UserSearchResult | null>(null)
    const [phoneNumberInputError, setPhoneNumberInputError] = useState<string>()
    const phoneNumberInputRef = createRef<PhoneNumberInputHandle>()
    const textInputRef = createRef<HTMLInputElement>()
    const phoneIntegrations = useAppSelector(getPhoneIntegrations)
    const [selectedIntegration, setSelectedIntegration] = useState(
        phoneIntegrations[0]
    )

    const isSearchTypeCustomer = /[a-zA-Z]/.test(inputValue)
    const isCallButtonDisabled = isSearchTypeCustomer && !selectedCustomer

    const handleChange = (value: string) => {
        setInputValue(value)
        setSelectedCustomer(null)
        setPhoneNumberInputError(undefined)

        debouncedSearchCustomers(value)
    }

    const makeCall = useDialerOutboundCall({
        inputValue,
        selectedCustomer,
        selectedIntegration,
    })

    const handleCallClick = () => {
        if (isCallButtonDisabled) {
            return
        }

        if (!isSearchTypeCustomer && !isValidPhoneNumber(inputValue)) {
            setPhoneNumberInputError('Enter a valid number')
            return
        }

        makeCall()
        onCallInitiated()
    }

    const handleSelectCustomer = (customer: UserSearchResult) => {
        setInputValue(customer.customer.name)
        setSelectedCustomer(customer)
    }

    const {
        isFetching: isSearchingCustomers,
        handleInputKeyDown,
        customers,
        highlightedResultIndex,
        debouncedSearchCustomers,
    } = usePhoneDeviceDialerCustomerSuggestions({
        onEnter: handleCallClick,
        onCustomerSelect: handleSelectCustomer,
        minSearchInputLength: isSearchTypeCustomer ? 3 : 5,
    })

    return {
        inputValue,
        selectedCustomer,
        phoneNumberInputError,
        phoneIntegrations,
        selectedIntegration,
        highlightedResultIndex,
        isSearchTypeCustomer,
        isSearchingCustomers,
        isCallButtonDisabled,
        phoneNumberInputRef,
        textInputRef,
        customers,
        handleChange,
        handleSelectCustomer,
        handleCallClick,
        handleInputKeyDown,
        setSelectedIntegration,
    }
}
