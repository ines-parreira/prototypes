import { useEffect } from 'react'

import { CountryCode } from 'libphonenumber-js'

import { IconButton } from '@gorgias/axiom'

import { UserSearchResult } from 'models/search/types'
import IconInput from 'pages/common/forms/input/IconInput'
import TextInput from 'pages/common/forms/input/TextInput'
import PhoneNumberInput from 'pages/common/forms/PhoneNumberInput/PhoneNumberInput'
import usePhoneDeviceDialerInput from 'pages/integrations/integration/components/phone/usePhoneDeviceDialerInput'

import PhoneDeviceDialerBody from './PhoneDeviceDialerBody'

import css from './PhoneDevice.less'

type Props = {
    value?: { phoneNumber: string; customer?: UserSearchResult }
    onValueChange?: (phoneNumber: string, customer?: UserSearchResult) => void
    onConfirm?: () => void
    country?: CountryCode
    onCountryChange?: (country: CountryCode) => void
    onValidationChange?: (isValid: boolean) => void
}

export default function PhoneDeviceDialerInput({
    value,
    onValueChange = () => {},
    onConfirm = () => {},
    country,
    onCountryChange,
    onValidationChange,
}: Props) {
    const {
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
    } = usePhoneDeviceDialerInput({
        value,
        onValueChange,
        onCustomerEnter: onConfirm,
        onValidationChange,
    })

    useEffect(() => {
        if (country) {
            phoneNumberInputRef.current?.onCountryChange(country)
        }
    }, [country, phoneNumberInputRef])

    return (
        <div className={css.dialerInputWrapper}>
            {isSearchTypeCustomer || selectedCustomer ? (
                <TextInput
                    ref={textInputRef}
                    prefix={
                        <IconInput className={css.prefixIcon} icon="person" />
                    }
                    suffix={
                        <IconButton
                            onClick={() => handleChange('')}
                            fillStyle="ghost"
                            intent="secondary"
                            icon="close"
                        />
                    }
                    value={
                        selectedCustomer
                            ? selectedCustomer.customer.name ||
                              selectedCustomer.address
                            : inputValue
                    }
                    onChange={handleChange}
                    autoFocus
                    onKeyDown={handleInputKeyDown}
                />
            ) : (
                <PhoneNumberInput
                    onChange={handleChange}
                    onLetterEntered={handleChange}
                    onCountryChange={onCountryChange}
                    value={inputValue}
                    error={phoneNumberError}
                    autoFocus
                    isClearable
                    isLoading={isSearchingCustomers}
                    ref={phoneNumberInputRef}
                    onKeyDown={handleInputKeyDown}
                    suppressUIJumps
                    placeholder="Type a name or number"
                />
            )}

            <PhoneDeviceDialerBody
                value={inputValue}
                onChange={(value) => {
                    phoneNumberInputRef.current?.onChange(value)
                }}
                results={customers}
                isLoading={isSearchTypeCustomer && isSearchingCustomers}
                isSearchTypeCustomer={isSearchTypeCustomer}
                selectedCustomer={selectedCustomer}
                onCustomerSelect={handleSelectCustomer}
                highlightedResultIndex={highlightedResultIndex}
            />
        </div>
    )
}
