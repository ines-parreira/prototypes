import React, {useCallback} from 'react'
import {
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    UncontrolledDropdown,
} from 'reactstrap'
import {connect, ConnectedProps} from 'react-redux'
import {Map} from 'immutable'
import classnames from 'classnames'
import parsePhoneNumber from 'libphonenumber-js'

import {RootState} from '../../../../state/types'
import {getPhoneIntegrations} from '../../../../state/integrations/selectors'
import {useOutboundCall} from '../../../../hooks/integrations/phone/useOutboundCall'
import {DEPRECATED_getTicket} from '../../../../state/ticket/selectors'
import {getCurrentUser} from '../../../../state/currentUser/selectors'

import css from './ClickablePhoneNumber.less'

type OwnProps = {
    id: string
    address: string
    customerName: string
}

type Props = OwnProps & ConnectedProps<typeof connector>

const ClickablePhoneNumberContainer = ({
    integrations,
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
        (integration: Map<any, any>) => {
            const integrationId: number = integration.get('id')
            const fromAddress: string = integration.getIn([
                'meta',
                'twilio',
                'incoming_phone_number',
                'phone_number',
            ])

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

    if (!integrations.size) {
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
                {integrations.map((integration: Map<any, any>) => {
                    const emoji = integration.getIn(['meta', 'emoji'])
                    const phoneNumber = integration.getIn([
                        'meta',
                        'twilio',
                        'incoming_phone_number',
                        'phone_number',
                    ])

                    return (
                        <DropdownItem
                            key={integration.get('id')}
                            className={classnames({
                                'btn-link disabled': isDisabled,
                            })}
                            onClick={() =>
                                isDisabled ? null : onClick(integration)
                            }
                        >
                            {emoji} {emoji && ' '}
                            {integration.get('name')} ({phoneNumber})
                        </DropdownItem>
                    )
                })}
            </DropdownMenu>
        </UncontrolledDropdown>
    )
}

const mapStateToProps = (state: RootState) => ({
    integrations: getPhoneIntegrations(state),
    device: state.twilio.device,
    call: state.twilio.call,
    ticketId: DEPRECATED_getTicket(state).get('id'),
    agentId: getCurrentUser(state).get('id'),
})

const connector = connect(mapStateToProps)

export const ClickablePhoneNumber = connector(ClickablePhoneNumberContainer)
