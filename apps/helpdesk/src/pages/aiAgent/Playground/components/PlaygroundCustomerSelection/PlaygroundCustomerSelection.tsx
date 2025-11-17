import { useEffect } from 'react'

import type { Ticket } from '@gorgias/helpdesk-client'

import SelectField from 'pages/common/forms/SelectField/SelectField'
import type { Value } from 'pages/common/forms/SelectField/types'

import { CustomerSearchDropdownSelectView } from '../../../components/CustomerSearchDropdownSelect/CustomerSearchDropdownSelectView'
import { TicketSearchDropdownSelectView } from '../../../components/TicketSearchDropdownSelect/TicketSearchDropdownSelectView'
import {
    CustomerHttpIntegrationDataMock,
    DEFAULT_PLAYGROUND_CUSTOMER,
} from '../../../constants'
import type { PlaygroundCustomer } from '../../types'
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
    senderType: string
    onSenderTypeChange: (value: string) => void
}

export const PlaygroundCustomerSelection = ({
    onCustomerChange,
    onTicketChange,
    customer,
    isDisabled,
    senderType,
    onSenderTypeChange,
}: Props) => {
    const handleSenderSelectChange = (value: Value) => {
        if (typeof value !== 'string') {
            return
        }
        onSenderTypeChange(value)
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
            onSenderTypeChange(SenderTypeValues.NEW_CUSTOMER)
        }
    }, [customer, onSenderTypeChange])

    const customerEmail =
        customer.id === DEFAULT_PLAYGROUND_CUSTOMER.id ? '' : customer.email

    return (
        <div className={css.container}>
            <SelectField
                fullWidth
                showSelectedOption
                value={senderType}
                onChange={handleSenderSelectChange}
                options={senderSelectOptions}
                className={css.senderSelect}
                disabled={isDisabled}
            />
            {senderType === SenderTypeValues.EXISTING_TICKET && (
                <TicketSearchDropdownSelectView
                    className={css.ticketSearch}
                    onSelect={handleTicketSelect}
                    isDisabled={isDisabled}
                />
            )}
            {senderType === SenderTypeValues.EXISTING_CUSTOMER && (
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
