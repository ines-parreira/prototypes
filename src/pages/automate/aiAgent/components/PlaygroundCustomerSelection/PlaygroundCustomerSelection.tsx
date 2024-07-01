import React, {useState} from 'react'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import {Value} from 'pages/common/forms/SelectField/types'
import {CustomerHttpIntegrationDataMock} from '../../constants'
import {CustomerSearchDropdownSelectView} from '../CustomerSearchDropdownSelect/CustomerSearchDropdownSelectView'

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
    onCustomerEmailChange: (email: string, name?: string) => void
    customerEmail: string
    isDisabled?: boolean
}

type Control = {
    clear: () => void
}

export const PlaygroundCustomerSelection = ({
    onCustomerEmailChange,
    customerEmail,
    isDisabled,
}: Props) => {
    const childControlRef = React.createRef<Control>()
    const [senderSelectedOption, setSenderSelectedOption] = useState<string>(
        SenderTypeValues.NEW_CUSTOMER
    )

    const handleSenderSelectChange = (value: Value) => {
        if (typeof value !== 'string') {
            return
        }
        setSenderSelectedOption(value)
        if (value === SenderTypeValues.NEW_CUSTOMER) {
            onCustomerEmailChange(
                CustomerHttpIntegrationDataMock.address,
                CustomerHttpIntegrationDataMock.name
            )
        } else {
            onCustomerEmailChange('', '')
        }
    }

    return (
        <>
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
                    ref={childControlRef}
                />
            )}
        </>
    )
}
