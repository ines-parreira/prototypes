import React, {useCallback, useState} from 'react'
import {debounce} from 'lodash'
import {SearchBodyType, useSearch} from '@gorgias/api-queries'
import PhoneNumberInput from 'pages/common/forms/PhoneNumberInput/PhoneNumberInput'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import IconButton from 'pages/common/components/button/IconButton'
import IconInput from 'pages/common/forms/input/IconInput'
import TextInput from 'pages/common/forms/input/TextInput'
import {UserSearchResult} from 'models/search/types'

import css from './PhoneDevice.less'
import PhoneDeviceDialerBody from './PhoneDeviceDialerBody'

const SEARCH_DEBOUNCE_VALUE = 500

export default function PhoneDeviceDialer() {
    const [inputValue, setInputValue] = useState('')
    const [selectedCustomer, setSelectedCustomer] =
        useState<UserSearchResult | null>(null)

    const {
        mutate: searchCustomers,
        isLoading: isSearchingCustomers,
        data: data,
    } = useSearch()

    const customers = data?.data.data ?? []
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

        if (!value) {
            searchCustomers({
                data: {
                    type: SearchBodyType.CustomerChannelPhone,
                    query: '',
                },
            })
        }

        if (value.length >= 3) {
            debouncedSearchCustomers(value)
        }
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
                    value={inputValue}
                    onChange={handleChange}
                    autoFocus
                    className={css.dialpadInput}
                />
            ) : (
                <PhoneNumberInput
                    onChange={handleChange}
                    onLetterEntered={handleChange}
                    value={inputValue}
                    autoFocus
                    className={css.dialpadInput}
                    isClearable
                />
            )}

            <PhoneDeviceDialerBody
                value={inputValue}
                onChange={handleChange}
                results={customers}
                isLoading={isSearchingCustomers}
                isSearchTypeCustomer={isSearchTypeCustomer}
                selectedCustomer={selectedCustomer}
                onCustomerSelect={setSelectedCustomer}
            />

            <div className={css.buttons}>
                <Button fillStyle="ghost" size="small" intent="secondary">
                    <ButtonIconLabel icon="phone" />
                    Select integration
                    <ButtonIconLabel icon="arrow_drop_down" />
                </Button>
                <Button>Call</Button>
            </div>
        </div>
    )
}
