import React, {useCallback} from 'react'
import {DropdownItem} from 'reactstrap'
import parsePhoneNumber from 'libphonenumber-js'

import {NewPhoneNumber} from 'models/phoneNumber/types'
import {SmsIntegration} from 'models/integration/types'
import {getNewPhoneNumbers} from 'state/entities/phoneNumbers/selectors'
import {TicketMessageSourceType} from 'business/types/ticket'
import useAppSelector from 'hooks/useAppSelector'
import history from 'pages/history'

type Props = {
    address: string
    customerName: string
    customerId: string
    integrations: SmsIntegration[]
}

const SmsIntegrationsDropdownList = ({
    address,
    customerName,
    customerId,
    integrations,
}: Props) => {
    const phoneNumbers = useAppSelector(getNewPhoneNumbers)
    const toAddress = parsePhoneNumber(address)?.format('E.164') || ''
    const onClick = useCallback(
        (integration: SmsIntegration, phoneNumber: NewPhoneNumber) => {
            history.push(`/app/ticket/new?customer=${customerId}`, {
                source: TicketMessageSourceType.Sms,
                sender: phoneNumber.phone_number,
                receiver: {
                    name: customerName,
                    address: toAddress,
                },
            })
        },
        [customerId, customerName, toAddress]
    )

    return (
        <>
            <DropdownItem header className="text-uppercase">
                SMS with
            </DropdownItem>
            {integrations.map((integration) => {
                const emoji = integration.meta.emoji
                const phoneNumber =
                    phoneNumbers[integration.meta.phone_number_id]
                if (!phoneNumber) {
                    return null
                }

                return (
                    <DropdownItem
                        key={integration.id}
                        onClick={() => onClick(integration, phoneNumber)}
                    >
                        {emoji} {emoji && ' '}
                        {integration.name} ({phoneNumber.phone_number_friendly})
                    </DropdownItem>
                )
            })}
        </>
    )
}

export default SmsIntegrationsDropdownList
