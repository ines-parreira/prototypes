import { useCallback, useMemo, useRef, useState } from 'react'

import { isValidNumber } from 'libphonenumber-js'
import { debounce } from 'lodash'

import { UserSearchResult } from 'models/search/types'
import { PhoneNumberInputHandle } from 'pages/common/forms/PhoneNumberInput/PhoneNumberInput'

import usePhoneDeviceDialerCustomerSuggestions from './usePhoneDeviceDialerCustomerSuggestions'

const VALIDATE_DEBOUNCE_VALUE = 500

type UsePhoneDeviceDialerInputArgs = {
    onValueChange: (phoneNumber: string, customer?: UserSearchResult) => void
    onCustomerEnter: () => void
    onValidationChange?: (isValid: boolean) => void
}

export default function usePhoneDeviceDialerInput({
    onValueChange,
    onCustomerEnter,
    onValidationChange,
}: UsePhoneDeviceDialerInputArgs) {
    const [inputValue, setInputValue] = useState('')
    const [selectedCustomer, setSelectedCustomer] =
        useState<UserSearchResult | null>(null)
    const phoneNumberInputRef = useRef<PhoneNumberInputHandle>(null)
    const textInputRef = useRef<HTMLInputElement>(null)

    const [isSearchTypeCustomer, setIsSearchTypeCustomer] = useState(false)

    const [phoneNumberError, setPhoneNumberError] = useState<
        string | undefined
    >(undefined)

    const validate = useCallback(
        (value: string) => {
            if (isValidNumber(value)) {
                setPhoneNumberError(undefined)
                onValidationChange?.(true)
            } else {
                setPhoneNumberError('Invalid phone number')
                onValidationChange?.(false)
            }
        },
        [onValidationChange],
    )

    const debouncedValidate = useMemo(
        () => debounce(validate, VALIDATE_DEBOUNCE_VALUE),
        [validate],
    )

    const scheduleValidation = (value: string) => {
        setPhoneNumberError(undefined)
        debouncedValidate(value)
        onValidationChange?.(false)
    }

    const cancelValidation = (isValid = false) => {
        setPhoneNumberError(undefined)
        debouncedValidate.cancel()
        onValidationChange?.(isValid)
    }

    const handleChange = (value: string) => {
        setInputValue(value)
        if (!/[a-zA-Z]/.test(value)) {
            onValueChange(value)
            setIsSearchTypeCustomer(false)
            if (value !== '') {
                scheduleValidation(value)
            } else {
                cancelValidation()
            }
        } else {
            onValueChange('')
            setIsSearchTypeCustomer(true)
            cancelValidation()
        }
        setSelectedCustomer(null)

        debouncedSearchCustomers(value)
    }

    const handleSelectCustomer = (customer: UserSearchResult) => {
        setInputValue(customer.customer.name)
        onValueChange(customer.address, customer)
        setSelectedCustomer(customer)
        cancelValidation(true)
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
        phoneNumberError,
    }
}
