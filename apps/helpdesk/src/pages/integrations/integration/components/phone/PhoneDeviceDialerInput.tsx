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
    onValueChange?: (phoneNumber: string, customer?: UserSearchResult) => void
    onConfirm?: () => void
    phoneNumberInputError?: string
    resetError?: () => void
    country?: CountryCode
    onCountryChange?: (country: CountryCode) => void
}

export default function PhoneDeviceDialerInput({
    onValueChange = () => {},
    onConfirm = () => {},
    phoneNumberInputError,
    resetError = () => {},
    country,
    onCountryChange,
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
    } = usePhoneDeviceDialerInput({
        onValueChange,
        resetError,
        onCustomerEnter: onConfirm,
    })

    useEffect(() => {
        if (country) {
            phoneNumberInputRef.current?.onCountryChange(country)
        }
    }, [country, phoneNumberInputRef])

    return (
        <>
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
                    className={css.dialpadInput}
                    onKeyDown={handleInputKeyDown}
                />
            ) : (
                <PhoneNumberInput
                    onChange={handleChange}
                    onLetterEntered={handleChange}
                    onCountryChange={onCountryChange}
                    value={inputValue}
                    error={phoneNumberInputError}
                    autoFocus
                    className={css.dialpadInput}
                    isClearable
                    isLoading={isSearchingCustomers}
                    ref={phoneNumberInputRef}
                    onKeyDown={handleInputKeyDown}
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
        </>
    )
}
