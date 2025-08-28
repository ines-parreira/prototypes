import { useRef, useState } from 'react'

import { UserSearchResult } from 'models/search/types'
import { PhoneNumberInputHandle } from 'pages/common/forms/PhoneNumberInput/PhoneNumberInput'

import usePhoneDeviceDialerCustomerSuggestions from './usePhoneDeviceDialerCustomerSuggestions'

type UsePhoneDeviceDialerInputArgs = {
    onValueChange: (phoneNumber: string, customer?: UserSearchResult) => void
    resetError: () => void
    onCustomerEnter: () => void
}

export default function usePhoneDeviceDialerInput({
    onValueChange,
    resetError,
    onCustomerEnter,
}: UsePhoneDeviceDialerInputArgs) {
    const [inputValue, setInputValue] = useState('')
    const [selectedCustomer, setSelectedCustomer] =
        useState<UserSearchResult | null>(null)
    const phoneNumberInputRef = useRef<PhoneNumberInputHandle>(null)
    const textInputRef = useRef<HTMLInputElement>(null)

    const [isSearchTypeCustomer, setIsSearchTypeCustomer] = useState(false)

    const handleChange = (value: string) => {
        setInputValue(value)
        if (!/[a-zA-Z]/.test(value)) {
            onValueChange(value)
            resetError()
            setIsSearchTypeCustomer(false)
        } else {
            onValueChange('')
            resetError()
            setIsSearchTypeCustomer(true)
        }
        setSelectedCustomer(null)

        debouncedSearchCustomers(value)
    }

    const handleSelectCustomer = (customer: UserSearchResult) => {
        setInputValue(customer.customer.name)
        onValueChange(customer.address, customer)
        resetError()
        setSelectedCustomer(customer)
    }

    const {
        isFetching: isSearchingCustomers,
        handleInputKeyDown,
        customers,
        highlightedResultIndex,
        debouncedSearchCustomers,
    } = usePhoneDeviceDialerCustomerSuggestions({
        onEnter: onCustomerEnter,
        onCustomerSelect: handleSelectCustomer,
        minSearchInputLength: isSearchTypeCustomer ? 3 : 5,
    })

    return {
        inputValue,
        selectedCustomer,
        highlightedResultIndex,
        isSearchTypeCustomer,
        isSearchingCustomers,
        phoneNumberInputRef,
        textInputRef,
        customers,
        handleChange,
        handleSelectCustomer,
        handleInputKeyDown,
    }
}
