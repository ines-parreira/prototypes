import React, {useCallback} from 'react'
import {
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    UncontrolledDropdown,
} from 'reactstrap'
import {connect, ConnectedProps} from 'react-redux'
import classnames from 'classnames'
import parsePhoneNumber from 'libphonenumber-js'

import {RootState} from 'state/types'
import {PhoneNumber} from 'models/phoneNumber/types'
import {PhoneIntegration} from 'models/integration/types'
import {getPhoneIntegrations} from 'state/integrations/selectors'
import {getPhoneNumbers} from 'state/entities/phoneNumbers/selectors'
import {getCurrentUser} from 'state/currentUser/selectors'
import {DEPRECATED_getTicket} from 'state/ticket/selectors'
import {useOutboundCall} from 'hooks/integrations/phone/useOutboundCall'

import css from './ClickablePhoneNumber.less'

type OwnProps = {
    id: string
    address: string
    customerName: string
}

type Props = OwnProps & ConnectedProps<typeof connector>

const ClickablePhoneNumberContainer = ({
    integrations,
    phoneNumbers,
    device,
    call,
    id,
    address,
    customerName,
    ticketId,
    agentId,
}: Props): JSX.Element => {
    const toAddress = parsePhoneNumber(address)?.format('E.164') || ''
    const isDisabled = !device || !!call || !toAddress
    const onCall = useOutboundCall()
    const onClick = useCallback(
        (integration: PhoneIntegration, phoneNumber: PhoneNumber) => {
            const integrationId: number = integration.id
            const fromAddress: string = phoneNumber.phone_number

            onCall({
                fromAddress,
                toAddress,
                integrationId,
                customerName,
                ticketId,
                agentId,
            })
        },
        [onCall, toAddress, customerName, ticketId, agentId]
    )

    if (!integrations.length) {
        const href = address.replace(/[. ]/g, '')
        return (
            <a id={id} href={`tel:${href}`}>
                {address}
            </a>
        )
    }

    return (
        <UncontrolledDropdown className={css.dropdown}>
            <DropdownToggle id={id} tag="a" href="#">
                {address}
            </DropdownToggle>
            <DropdownMenu container="body" className={css.dropdownMenu}>
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
                            {integration.name} ({phoneNumber.meta.friendly_name}
                            )
                        </DropdownItem>
                    )
                })}
            </DropdownMenu>
        </UncontrolledDropdown>
    )
}

const mapStateToProps = (state: RootState) => ({
    integrations: getPhoneIntegrations(state).toJS() as PhoneIntegration[],
    phoneNumbers: getPhoneNumbers(state),
    device: state.twilio.device,
    call: state.twilio.call,
    ticketId: DEPRECATED_getTicket(state).get('id'),
    agentId: getCurrentUser(state).get('id'),
})

const connector = connect(mapStateToProps)

export const ClickablePhoneNumber = connector(ClickablePhoneNumberContainer)
