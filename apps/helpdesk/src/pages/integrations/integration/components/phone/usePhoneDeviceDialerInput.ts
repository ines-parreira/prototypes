import { useCallback, useMemo, useRef, useState } from 'react'

import { isValidNumber } from 'libphonenumber-js'
import { debounce } from 'lodash'

import { UserSearchResult } from 'models/search/types'
import { PhoneNumberInputHandle } from 'pages/common/forms/PhoneNumberInput/PhoneNumberInput'

import usePhoneDeviceDialerCustomerSuggestions from './usePhoneDeviceDialerCustomerSuggestions'

const VALIDATE_DEBOUNCE_VALUE = 500

type UsePhoneDeviceDialerInputArgs = {
    value?: { phoneNumber: string; customer?: UserSearchResult }
    onValueChange: (phoneNumber: string, customer?: UserSearchResult) => void
    onCustomerEnter: () => void
    onValidationChange?: (isValid: boolean) => void
}

export default function usePhoneDeviceDialerInput({
    value,
    onValueChange,
    onCustomerEnter,
    onValidationChange,
}: UsePhoneDeviceDialerInputArgs) {
    const [internalInputValue, setInternalInputValue] = useState('')
    const [internalSelectedCustomer, setInternalSelectedCustomer] =
        useState<UserSearchResult | null>(null)
    const phoneNumberInputRef = useRef<PhoneNumberInputHandle>(null)
    const textInputRef = useRef<HTMLInputElement>(null)

    const [isSearchTypeCustomer, setIsSearchTypeCustomer] = useState(false)

    const [phoneNumberError, setPhoneNumberError] = useState<
        string | undefined
    >(undefined)

    const getInputValue = () => {
        if (value === undefined) {
            // not controlled
            return internalInputValue
        }

        if (!isSearchTypeCustomer) {
            // we're not searching for a customer
            return value.phoneNumber
        }

        if (value.customer === undefined) {
            // we're searching for a customer but we don't have one selected
            return internalInputValue
        }

        // we're searching for a customer and we have one selected
        return value.customer.customer.name
    }
    const inputValue = getInputValue()
    const selectedCustomer = value
        ? value.customer || null
        : internalSelectedCustomer

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
        setInternalInputValue(value)
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
        setInternalSelectedCustomer(null)

        debouncedSearchCustomers(value)
    }

    const handleSelectCustomer = (customer: UserSearchResult) => {
        setInternalInputValue(customer.customer.name)
        onValueChange(customer.address, customer)
        setInternalSelectedCustomer(customer)
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
