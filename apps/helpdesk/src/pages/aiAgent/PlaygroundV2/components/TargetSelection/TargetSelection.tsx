import React, { useEffect, useState } from 'react'

import classNames from 'classnames'

import { DEFAULT_PLAYGROUND_CUSTOMER } from 'pages/aiAgent/constants'
import {
    PlaygroundCustomerSelection,
    SenderTypeValues,
} from 'pages/aiAgent/PlaygroundV2/components/PlaygroundCustomerSelection/PlaygroundCustomerSelection'
import type { PlaygroundCustomer } from 'pages/aiAgent/PlaygroundV2/types'

import css from './TargetSelection.less'

type TargetCallbackPayload = {
    customer: PlaygroundCustomer
    subject?: string
    message?: string
}

type TargetSelectionProps = {
    customer: PlaygroundCustomer
    onChange: (payload: TargetCallbackPayload) => void
    isDisabled?: boolean
}

const getSenderTypeForCustomer = (customer: PlaygroundCustomer) =>
    customer.id !== DEFAULT_PLAYGROUND_CUSTOMER.id
        ? SenderTypeValues.EXISTING_CUSTOMER
        : SenderTypeValues.NEW_CUSTOMER

export const TargetSelection = ({
    customer,
    onChange,
    isDisabled,
}: TargetSelectionProps) => {
    const [senderSelectedOption, setSenderSelectedOption] = useState<string>(
        () => getSenderTypeForCustomer(customer),
    )

    useEffect(() => {
        setSenderSelectedOption(getSenderTypeForCustomer(customer))
    }, [customer])

    return (
        <div className={css.targetSelection}>
            <span
                className={classNames(css.targetSelectionLabel, {
                    [css.targetSelectionLabelDisabled]: isDisabled,
                })}
            >
                Target
            </span>
            <PlaygroundCustomerSelection
                customer={customer}
                onCustomerChange={(customer) => onChange({ customer })}
                onTicketChange={(ticketData) => onChange(ticketData)}
                senderType={senderSelectedOption}
                onSenderTypeChange={setSenderSelectedOption}
                isDisabled={isDisabled}
            />
        </div>
    )
}
