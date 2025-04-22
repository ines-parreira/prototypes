import React, { useEffect, useState } from 'react'

import SelectField from 'pages/common/forms/SelectField/SelectField'
import { Value } from 'pages/common/forms/SelectField/types'

import { CustomerSearchDropdownSelectView } from '../../../components/CustomerSearchDropdownSelect/CustomerSearchDropdownSelectView'
import {
    CustomerHttpIntegrationDataMock,
    DEFAULT_PLAYGROUND_CUSTOMER,
} from '../../../constants'
import { PlaygroundCustomer } from '../../types'

import css from './PlaygroundCustomerSelection.less'

export enum SenderTypeValues {
    NEW_CUSTOMER = 'new-customer',
    EXISTING_CUSTOMER = 'existing-customer',
}

const senderSelectOptions = [
    {
        value: SenderTypeValues.NEW_CUSTOMER,
        label: 'New customer',
    },
    {
        value: SenderTypeValues.EXISTING_CUSTOMER,
        label: 'Existing customer',
    },
]

type Props = {
    onCustomerEmailChange: (customer: PlaygroundCustomer) => void
    customer: PlaygroundCustomer
    isDisabled?: boolean
}

export const PlaygroundCustomerSelection = ({
    onCustomerEmailChange,
    customer,
    isDisabled,
}: Props) => {
    const [senderSelectedOption, setSenderSelectedOption] = useState<string>(
        SenderTypeValues.NEW_CUSTOMER,
    )

    const handleSenderSelectChange = (value: Value) => {
        if (typeof value !== 'string') {
            return
        }
        setSenderSelectedOption(value)
        if (value === SenderTypeValues.NEW_CUSTOMER) {
            const playgroundCustomer: PlaygroundCustomer = {
                email: CustomerHttpIntegrationDataMock.address,
                id: CustomerHttpIntegrationDataMock.id,
                name: CustomerHttpIntegrationDataMock.name,
            }
            onCustomerEmailChange(playgroundCustomer)
        } else {
            onCustomerEmailChange(DEFAULT_PLAYGROUND_CUSTOMER)
        }
    }

    useEffect(() => {
        if (customer.id === DEFAULT_PLAYGROUND_CUSTOMER.id) {
            setSenderSelectedOption(SenderTypeValues.NEW_CUSTOMER)
        }
    }, [customer])

    const customerEmail =
        customer.id === DEFAULT_PLAYGROUND_CUSTOMER.id ? '' : customer.email

    return (
        <div className={css.container}>
            <SelectField
                fullWidth
                showSelectedOption
                value={senderSelectedOption}
                onChange={handleSenderSelectChange}
                options={senderSelectOptions}
                className={css.senderSelect}
                disabled={isDisabled}
            />
            {senderSelectedOption === SenderTypeValues.EXISTING_CUSTOMER && (
                <CustomerSearchDropdownSelectView
                    className={css.customerSearch}
                    baseSearchTerm={customerEmail}
                    onSelect={onCustomerEmailChange}
                    isDisabled={isDisabled}
                />
            )}
        </div>
    )
}
