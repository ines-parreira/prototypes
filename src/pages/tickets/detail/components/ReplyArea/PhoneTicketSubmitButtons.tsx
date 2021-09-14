import React, {useCallback, useEffect, useState} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import classnames from 'classnames'
import {Button} from 'reactstrap'
import {Map} from 'immutable'
import parsePhoneNumber from 'libphonenumber-js'
import {Connection, Device} from 'twilio-client'

import {getNewMessageSource} from '../../../../../state/newMessage/selectors'
import {RootState} from '../../../../../state/types'
import {setConnection, setIsDialing} from '../../../../../state/twilio/actions'
import {getTicket} from '../../../../../state/ticket/selectors'
import {getCurrentUser} from '../../../../../state/currentUser/selectors'
import {useOutboundCall} from '../../../../../hooks/integrations/phone/useOutboundCall'

import css from './PhoneTicketSubmitButtons.less'

type Props = ConnectedProps<typeof connector>

function PhoneTicketSubmitButtons({
    device,
    connection,
    source,
    ticketId,
    agentId,
    setIsDialing,
    setConnection,
}: Props) {
    const {isValid, onSubmit} = useSubmit(
        device,
        source,
        ticketId,
        agentId,
        setIsDialing,
        setConnection
    )
    const isDisabled = !device || !!connection || !isValid

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
                color="success"
                disabled={isDisabled}
                onClick={onSubmit}
            >
                Call
            </Button>
        </div>
    )
}

const mapStateToProps = (state: RootState) => ({
    device: state.twilio.device,
    connection: state.twilio.connection,
    source: getNewMessageSource(state),
    ticketId: getTicket(state).get('id'),
    agentId: getCurrentUser(state).get('id'),
})

const mapDispatchToProps = {
    setIsDialing,
    setConnection,
}

const connector = connect(mapStateToProps, mapDispatchToProps)
export default connector(PhoneTicketSubmitButtons)

function useSubmit(
    device: Device | null,
    source: Map<any, any>,
    ticketId: number,
    agentId: number,
    setIsDialing: (isDialing: boolean) => void,
    setConnection: (connection: Connection | null) => void
) {
    const [fromAddress, setFromAddress] = useState<string>('')
    const [toAddress, setToAddress] = useState<string>('')
    const [customerName, setCustomerName] = useState<string>('')
    const [integrationId, setIntegrationId] = useState<number>(0)
    const [isValid, setIsValid] = useState(false)

    const onCall = useOutboundCall(device, setIsDialing, setConnection)
    const options = {
        fromAddress,
        toAddress,
        integrationId,
        customerName,
        ticketId,
        agentId,
    }
    const onSubmit = useCallback(() => {
        onCall(options)
    }, [onCall, options])

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
