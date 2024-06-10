import React, {createRef, useCallback, useState} from 'react'
import {debounce} from 'lodash'
import {SearchBodyType, useSearch} from '@gorgias/api-queries'
import {isValidPhoneNumber} from 'libphonenumber-js'
import PhoneNumberInput, {
    PhoneNumberInputHandle,
} from 'pages/common/forms/PhoneNumberInput/PhoneNumberInput'
import Button from 'pages/common/components/button/Button'
import IconButton from 'pages/common/components/button/IconButton'
import IconInput from 'pages/common/forms/input/IconInput'
import TextInput from 'pages/common/forms/input/TextInput'
import {UserSearchResult} from 'models/search/types'
import {getPhoneIntegrations} from 'state/integrations/selectors'
import useAppSelector from 'hooks/useAppSelector'

import css from './PhoneDevice.less'
import PhoneDeviceDialerBody from './PhoneDeviceDialerBody'
import PhoneDeviceDialerIntegrationSelect from './PhoneDeviceDialerIntegrationSelect'
import useDialerOutboundCall from './useDialerOutboundCall'

const SEARCH_DEBOUNCE_VALUE = 500

type Props = {
    onCallInitiated: () => void
}

export default function PhoneDeviceDialer({onCallInitiated}: Props) {
    const [inputValue, setInputValue] = useState('')
    const [selectedCustomer, setSelectedCustomer] =
        useState<UserSearchResult | null>(null)
    const [phoneNumberInputError, setPhoneNumberInputError] = useState<string>()
    const phoneNumberInputRef = createRef<PhoneNumberInputHandle>()
    const phoneIntegrations = useAppSelector(getPhoneIntegrations)
    const [selectedIntegration, setSelectedIntegration] = useState(
        phoneIntegrations[0]
    )

    const {
        mutate: searchCustomers,
        isLoading: isSearchingCustomers,
        data: data,
        reset: resetMutation,
    } = useSearch()

    const makeCall = useDialerOutboundCall({
        inputValue,
        selectedCustomer,
        selectedIntegration,
    })

    const customers = data?.data.data
    const isSearchTypeCustomer = /[a-zA-Z]/.test(inputValue)

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSearchCustomers = useCallback(
        debounce((input: string) => {
            void searchCustomers({
                data: {
                    type: SearchBodyType.CustomerChannelPhone,
                    query: input,
                },
            })
        }, SEARCH_DEBOUNCE_VALUE),
        [searchCustomers]
    )

    const handleChange = (value: string) => {
        setInputValue(value)
        setSelectedCustomer(null)
        setPhoneNumberInputError(undefined)

        if (
            (isSearchTypeCustomer && value.length < 3) ||
            (!isSearchTypeCustomer && value.length < 5)
        ) {
            resetMutation()
            return
        }

        debouncedSearchCustomers(value)
    }

    const handleSelectCustomer = (customer: UserSearchResult) => {
        setInputValue(customer.customer.name)
        setSelectedCustomer(customer)
    }

    const handleCallClick = () => {
        if (!isSearchTypeCustomer && !isValidPhoneNumber(inputValue)) {
            setPhoneNumberInputError('Enter a valid number')
            return
        }

        makeCall()
        onCallInitiated()
    }

    return (
        <div className={css.dialerWrapper}>
            {isSearchTypeCustomer || selectedCustomer ? (
                <TextInput
                    prefix={
                        <IconInput className={css.prefixIcon} icon="person" />
                    }
                    suffix={
                        <IconButton
                            onClick={() => handleChange('')}
                            fillStyle="ghost"
                            intent="secondary"
                        >
                            close
                        </IconButton>
                    }
                    value={
                        selectedCustomer
                            ? selectedCustomer.customer.name ??
                              selectedCustomer.address
                            : inputValue
                    }
                    onChange={handleChange}
                    autoFocus
                    className={css.dialpadInput}
                />
            ) : (
                <PhoneNumberInput
                    onChange={handleChange}
                    onLetterEntered={handleChange}
                    value={inputValue}
                    error={phoneNumberInputError}
                    autoFocus
                    className={css.dialpadInput}
                    isClearable
                    ref={phoneNumberInputRef}
                />
            )}

            <PhoneDeviceDialerBody
                value={inputValue}
                onChange={(value) => {
                    phoneNumberInputRef.current?.onChange(value)
                }}
                results={customers}
                isLoading={isSearchingCustomers}
                isSearchTypeCustomer={isSearchTypeCustomer}
                selectedCustomer={selectedCustomer}
                onCustomerSelect={handleSelectCustomer}
            />

            <div className={css.buttons}>
                <PhoneDeviceDialerIntegrationSelect
                    value={selectedIntegration}
                    options={phoneIntegrations}
                    onChange={setSelectedIntegration}
                />
                <Button
                    onClick={handleCallClick}
                    isDisabled={isSearchTypeCustomer && !selectedCustomer}
                >
                    Call
                </Button>
            </div>
        </div>
    )
}
