import React, { useState } from 'react'

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
}

export const TargetSelection = ({
    customer,
    onChange,
}: TargetSelectionProps) => {
    const [senderSelectedOption, setSenderSelectedOption] = useState<string>(
        SenderTypeValues.NEW_CUSTOMER,
    )

    return (
        <div className={css.targetSelection}>
            <span className={css.targetSelectionLabel}>Target</span>
            <PlaygroundCustomerSelection
                customer={customer}
                onCustomerChange={(customer) => onChange({ customer })}
                onTicketChange={(ticketData) => onChange(ticketData)}
                senderType={senderSelectedOption}
                onSenderTypeChange={setSenderSelectedOption}
            />
        </div>
    )
}
