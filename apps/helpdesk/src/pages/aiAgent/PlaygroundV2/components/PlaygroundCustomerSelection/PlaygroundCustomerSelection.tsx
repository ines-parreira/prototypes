import { useMemo } from 'react'

import { ListItem, SelectField } from '@gorgias/axiom'
import { Ticket } from '@gorgias/helpdesk-client'

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
        id: SenderTypeValues.NEW_CUSTOMER,
        label: 'New customer',
    },
    {
        id: SenderTypeValues.EXISTING_TICKET,
        label: 'Existing ticket',
    },
    {
        id: SenderTypeValues.EXISTING_CUSTOMER,
        label: 'Existing customer',
    },
]

type Option = (typeof senderSelectOptions)[number]

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
    const handleSenderSelectChange = (value: Option) => {
        onSenderTypeChange(value.id)
        if (value.id === SenderTypeValues.NEW_CUSTOMER) {
            const playgroundCustomer: PlaygroundCustomer = {
                email: CustomerHttpIntegrationDataMock.address,
                id: CustomerHttpIntegrationDataMock.id,
                name: CustomerHttpIntegrationDataMock.name,
            }
            onCustomerChange(playgroundCustomer)
        }
    }

    const handleTicketSelect = (ticket: Ticket) => {
        const ticketData = extractTicketData(ticket)

        onTicketChange(ticketData)
    }

    const customerEmail =
        customer.id === DEFAULT_PLAYGROUND_CUSTOMER.id ? '' : customer.email

    const displayConditionalContent =
        senderType === SenderTypeValues.EXISTING_TICKET ||
        senderType === SenderTypeValues.EXISTING_CUSTOMER

    const selectedOption = useMemo(
        () => senderSelectOptions.find((option) => option.id === senderType),
        [senderType],
    )

    return (
        <>
            <div className={css.senderSelect}>
                <SelectField
                    value={selectedOption}
                    onChange={handleSenderSelectChange}
                    items={senderSelectOptions}
                    disabled={false}
                >
                    {(option: (typeof senderSelectOptions)[number]) => (
                        <ListItem label={option.label} />
                    )}
                </SelectField>
            </div>
            {displayConditionalContent && (
                <>
                    <div
                        className={css.conditionalContent}
                        data-visible={
                            senderType === SenderTypeValues.EXISTING_TICKET ||
                            senderType === SenderTypeValues.EXISTING_CUSTOMER
                        }
                    >
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
                </>
            )}
        </>
    )
}
