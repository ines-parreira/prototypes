import React, { useEffect, useState } from 'react'

import { Ticket } from '@gorgias/helpdesk-client'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import { Value } from 'pages/common/forms/SelectField/types'

import { CustomerSearchDropdownSelectView } from '../../../components/CustomerSearchDropdownSelect/CustomerSearchDropdownSelectView'
import { TicketSearchDropdownSelectView } from '../../../components/TicketSearchDropdownSelect/TicketSearchDropdownSelectView'
import {
    CustomerHttpIntegrationDataMock,
    DEFAULT_PLAYGROUND_CUSTOMER,
} from '../../../constants'
import { PlaygroundCustomer } from '../../types'
import { extractTicketData } from '../../utils/ticket-extraction.utils'

import css from './PlaygroundCustomerSelection.less'

export enum SenderTypeValues {
    NEW_CUSTOMER = 'new-customer',
    EXISTING_TICKET = 'existing-ticket',
    EXISTING_CUSTOMER = 'existing-customer',
}

const senderSelectOptions = [
    {
        value: SenderTypeValues.NEW_CUSTOMER,
        label: 'New customer',
    },
    {
        value: SenderTypeValues.EXISTING_TICKET,
        label: 'Existing ticket',
    },
    {
        value: SenderTypeValues.EXISTING_CUSTOMER,
        label: 'Existing customer',
    },
]

export type TicketData = {
    customer: PlaygroundCustomer
    subject: string
    message: string
}

type Props = {
    onCustomerChange: (customer: PlaygroundCustomer) => void
    onTicketChange: (ticketData: TicketData) => void
    customer: PlaygroundCustomer
    isDisabled?: boolean
}

export const PlaygroundCustomerSelection = ({
    onCustomerChange,
    onTicketChange,
    customer,
    isDisabled,
}: Props) => {
    const isExistingTicketEnabled = useFlag(
        FeatureFlagKey.AiAgentPlaygroundExistingTicket,
    )

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
            onCustomerChange(playgroundCustomer)
        } else {
            onCustomerChange(DEFAULT_PLAYGROUND_CUSTOMER)
        }
    }

    const handleTicketSelect = (ticket: Ticket) => {
        const ticketData = extractTicketData(ticket)

        onTicketChange(ticketData)
    }

    useEffect(() => {
        if (customer.id === DEFAULT_PLAYGROUND_CUSTOMER.id) {
            setSenderSelectedOption(SenderTypeValues.NEW_CUSTOMER)
        }
    }, [customer])

    // Reset to "New customer" if "Existing ticket" is selected but feature flag is disabled.
    // TODO: To remove this once the feature flag is fully enabled.
    useEffect(() => {
        if (
            !isExistingTicketEnabled &&
            senderSelectedOption === SenderTypeValues.EXISTING_TICKET
        ) {
            setSenderSelectedOption(SenderTypeValues.NEW_CUSTOMER)
        }
    }, [isExistingTicketEnabled, senderSelectedOption])

    const customerEmail =
        customer.id === DEFAULT_PLAYGROUND_CUSTOMER.id ? '' : customer.email

    // Filter options based on feature flag
    const availableOptions = senderSelectOptions.filter(
        (option) =>
            option.value !== SenderTypeValues.EXISTING_TICKET ||
            isExistingTicketEnabled,
    )

    return (
        <div className={css.container}>
            <SelectField
                fullWidth
                showSelectedOption
                value={senderSelectedOption}
                onChange={handleSenderSelectChange}
                options={availableOptions}
                className={css.senderSelect}
                disabled={isDisabled}
            />
            {senderSelectedOption === SenderTypeValues.EXISTING_TICKET && (
                <TicketSearchDropdownSelectView
                    className={css.ticketSearch}
                    onSelect={handleTicketSelect}
                    isDisabled={isDisabled}
                />
            )}
            {senderSelectedOption === SenderTypeValues.EXISTING_CUSTOMER && (
                <CustomerSearchDropdownSelectView
                    className={css.customerSearch}
                    baseSearchTerm={customerEmail}
                    onSelect={onCustomerChange}
                    isDisabled={isDisabled}
                />
            )}
        </div>
    )
}
