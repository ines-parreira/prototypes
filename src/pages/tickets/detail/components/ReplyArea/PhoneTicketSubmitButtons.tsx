import React, {useCallback, useEffect, useState} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import classnames from 'classnames'
import {Map} from 'immutable'
import parsePhoneNumber from 'libphonenumber-js'

import Button from 'pages/common/components/button/Button'
import {getNewMessageSource} from '../../../../../state/newMessage/selectors'
import {RootState} from '../../../../../state/types'
import {DEPRECATED_getTicket} from '../../../../../state/ticket/selectors'
import {getCurrentUser} from '../../../../../state/currentUser/selectors'
import {useOutboundCall} from '../../../../../hooks/integrations/phone/useOutboundCall'

import css from './PhoneTicketSubmitButtons.less'

type Props = ConnectedProps<typeof connector>

function PhoneTicketSubmitButtons({
    device,
    call,
    source,
    ticketId,
    agentId,
}: Props) {
    const {isValid, onSubmit} = useSubmit(source, ticketId, agentId)
    const isDisabled = !device || !!call || !isValid

    return (
        <div
            className={classnames(
                css.component,
                'd-flex align-items-center justify-content-between'
            )}
        >
            <Button
                data-testid="outbound-call-button"
                type="submit"
                intent="primary"
                isDisabled={isDisabled}
                onClick={onSubmit}
            >
                Call
            </Button>
        </div>
    )
}

const mapStateToProps = (state: RootState) => ({
    device: state.twilio.device,
    call: state.twilio.call,
    source: getNewMessageSource(state),
    ticketId: DEPRECATED_getTicket(state).get('id'),
    agentId: getCurrentUser(state).get('id'),
})

const connector = connect(mapStateToProps)
export default connector(PhoneTicketSubmitButtons)

function useSubmit(source: Map<any, any>, ticketId: number, agentId: number) {
    const [fromAddress, setFromAddress] = useState<string>('')
    const [toAddress, setToAddress] = useState<string>('')
    const [customerName, setCustomerName] = useState<string>('')
    const [integrationId, setIntegrationId] = useState<number>(0)
    const [isValid, setIsValid] = useState(false)

    const onCall = useOutboundCall()

    const onSubmit = useCallback(() => {
        onCall({
            fromAddress,
            toAddress,
            integrationId,
            customerName,
            ticketId,
            agentId,
        })
    }, [
        onCall,
        fromAddress,
        toAddress,
        integrationId,
        customerName,
        ticketId,
        agentId,
    ])

    useEffect(() => {
        const newIntegrationId = source.getIn(['from', 'id'])
        const newCustomerName = source.getIn(['to', 0, 'name'])
        const rawFrom = source.getIn(['from', 'address']) || ''
        const rawTo = source.getIn(['to', 0, 'address']) || ''

        const parsedFrom = parsePhoneNumber(rawFrom)
        const parsedTo = parsePhoneNumber(rawTo)

        const formattedFrom = parsedFrom?.format('E.164') || ''
        const formattedTo = parsedTo?.format('E.164') || ''

        setIntegrationId(newIntegrationId)
        setCustomerName(newCustomerName)
        setFromAddress(formattedFrom)
        setToAddress(formattedTo)

        setIsValid(!!newIntegrationId && !!formattedFrom && !!formattedTo)
    }, [source])

    return {isValid, onSubmit}
}
