import React, { useCallback } from 'react'

import classnames from 'classnames'
import parsePhoneNumber from 'libphonenumber-js'
import { DropdownItem } from 'reactstrap'

import { useOutboundCall } from 'hooks/integrations/phone/useOutboundCall'
import useVoiceDevice from 'hooks/integrations/phone/useVoiceDevice'
import useAppSelector from 'hooks/useAppSelector'
import type { PhoneIntegration } from 'models/integration/types'
import type { NewPhoneNumber } from 'models/phoneNumber/types'
import { getCurrentUser } from 'state/currentUser/selectors'
import { getNewPhoneNumbers } from 'state/entities/phoneNumbers/selectors'
import { DEPRECATED_getTicket } from 'state/ticket/selectors'

type Props = {
    address: string
    customerName: string
    integrations: PhoneIntegration[]
}

const PhoneIntegrationsDropdownList = ({
    address,
    customerName,
    integrations,
}: Props) => {
    const phoneNumbers = useAppSelector(getNewPhoneNumbers)
    const ticketId = useAppSelector(DEPRECATED_getTicket).get('id')
    const agentId = useAppSelector(getCurrentUser).get('id')

    const { call, device } = useVoiceDevice()
    const makeOutboundCall = useOutboundCall()

    const toAddress = parsePhoneNumber(address)?.format('E.164') || ''
    const isDisabled = !device || !!call || !toAddress
    const onClick = useCallback(
        (integration: PhoneIntegration, phoneNumber: NewPhoneNumber) => {
            const integrationId: number = integration.id
            const fromAddress: string = phoneNumber.phone_number

            makeOutboundCall({
                fromAddress,
                toAddress,
                integrationId,
                customerName,
                ticketId,
                agentId,
            })
        },
        [makeOutboundCall, toAddress, customerName, ticketId, agentId],
    )

    return (
        <>
            <DropdownItem header className="text-uppercase">
                Call via
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
                        className={classnames({
                            'btn-link disabled': isDisabled,
                        })}
                        onClick={() =>
                            isDisabled
                                ? null
                                : onClick(integration, phoneNumber)
                        }
                    >
                        {emoji} {emoji && ' '}
                        {integration.name} ({phoneNumber.phone_number_friendly})
                    </DropdownItem>
                )
            })}
        </>
    )
}

export default PhoneIntegrationsDropdownList
