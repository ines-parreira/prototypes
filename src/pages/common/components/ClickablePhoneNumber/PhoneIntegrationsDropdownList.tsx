import React, {useCallback} from 'react'
import {DropdownItem} from 'reactstrap'
import classnames from 'classnames'
import parsePhoneNumber from 'libphonenumber-js'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {PhoneNumber} from 'models/phoneNumber/types'
import {PhoneIntegration} from 'models/integration/types'
import {getPhoneNumbers} from 'state/entities/phoneNumbers/selectors'
import {getCurrentUser} from 'state/currentUser/selectors'
import {DEPRECATED_getTicket} from 'state/ticket/selectors'
import {useOutboundCall} from 'hooks/integrations/phone/useOutboundCall'
import {useOutboundCall_DEPRECATED} from 'hooks/integrations/phone/useOutboundCall_DEPRECATED'
import useAppSelector from 'hooks/useAppSelector'
import {FeatureFlagKey} from 'config/featureFlags'

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
    const call = useAppSelector((state) => state.twilio.call)
    const device = useAppSelector((state) => state.twilio.device)
    const phoneNumbers = useAppSelector(getPhoneNumbers)
    const ticketId = useAppSelector(DEPRECATED_getTicket).get('id')
    const agentId = useAppSelector(getCurrentUser).get('id')

    const outboundCall = useOutboundCall()
    const outboundCall_DEPRECATED = useOutboundCall_DEPRECATED()

    const useNewErrorHandling = useFlags()[FeatureFlagKey.NewPhoneErrorHandling]
    const makeOutboundCall = useNewErrorHandling
        ? outboundCall
        : outboundCall_DEPRECATED

    const toAddress = parsePhoneNumber(address)?.format('E.164') || ''
    const isDisabled = !device || !!call || !toAddress
    const onClick = useCallback(
        (integration: PhoneIntegration, phoneNumber: PhoneNumber) => {
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
        [makeOutboundCall, toAddress, customerName, ticketId, agentId]
    )

    return (
        <>
            <DropdownItem header className="text-uppercase">
                Call via
            </DropdownItem>
            {integrations.map((integration) => {
                const emoji = integration.meta.emoji
                const phoneNumber =
                    phoneNumbers[integration.meta.twilio_phone_number_id]
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
                        {integration.name} ({phoneNumber.meta.friendly_name})
                    </DropdownItem>
                )
            })}
        </>
    )
}

export default PhoneIntegrationsDropdownList
