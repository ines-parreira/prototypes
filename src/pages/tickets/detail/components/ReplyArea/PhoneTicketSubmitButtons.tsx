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
import {PhoneCallDirection} from '../../../../../business/twilio'
import client from '../../../../../models/api/resources'

import css from './PhoneTicketSubmitButtons.less'

type Props = ConnectedProps<typeof connector>

function PhoneTicketSubmitButtons({
    device,
    connection,
    source,
    setIsDialing,
    setConnection,
}: Props) {
    const {isValid, onCall} = useOutboundCall(
        device,
        source,
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
                onClick={onCall}
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
})

const mapDispatchToProps = {
    setIsDialing,
    setConnection,
}

const connector = connect(mapStateToProps, mapDispatchToProps)
export default connector(PhoneTicketSubmitButtons)

function useOutboundCall(
    device: Device | null,
    source: Map<any, any>,
    setIsDialing: (isDialing: boolean) => void,
    setConnection: (connection: Connection | null) => void
) {
    const [fromAddress, setFromAddress] = useState<string | undefined>()
    const [toAddress, setToAddress] = useState<string | undefined>()
    const [customerName, setCustomerName] = useState<string | undefined>()
    const [integrationId, setIntegrationId] = useState<number | undefined>()
    const [isValid, setIsValid] = useState(false)

    const onCall = useCallback(() => {
        const connection = device?.connect({
            Direction: PhoneCallDirection.OutboundDial,
            Caller: fromAddress as string,
            Called: toAddress as string,
            From: fromAddress as string,
            To: toAddress as string,

            // Custom parameters:
            integration_id: (integrationId as number).toString(),
            customer_name: customerName as string,
        })

        if (connection) {
            connection.on('cancel', () => {
                setIsDialing(false)
                setConnection(null)
                onDisconnect().catch(console.error)
            })

            connection.on('disconnect', () => {
                setIsDialing(false)
                setConnection(null)
                onDisconnect().catch(console.error)
            })

            connection.on('error', console.error)

            setIsDialing(true)
            setConnection(connection)
            onConnect().catch(console.error)
        }
    }, [
        device,
        fromAddress,
        toAddress,
        integrationId,
        customerName,
        setIsDialing,
        setConnection,
    ])

    useEffect(() => {
        const newIntegrationId = source.getIn(['from', 'id'])
        const newCustomerName = source.getIn(['to', 0, 'name'])
        const rawFrom = source.getIn(['from', 'address']) || ''
        const rawTo = source.getIn(['to', 0, 'address']) || ''

        const parsedFrom = parsePhoneNumber(rawFrom)
        const parsedTo = parsePhoneNumber(rawTo)

        const formattedFrom = parsedFrom?.format('E.164')
        const formattedTo = parsedTo?.format('E.164')

        setIntegrationId(newIntegrationId)
        setCustomerName(newCustomerName)
        setFromAddress(formattedFrom)
        setToAddress(formattedTo)

        setIsValid(!!newIntegrationId && !!formattedFrom && !!formattedTo)
    }, [source])

    return {isValid, onCall}
}

async function onConnect() {
    try {
        await client.post('/integrations/phone/call/connected')
    } catch (error) {
        console.error(error)
    }
}

async function onDisconnect() {
    try {
        await client.post('/integrations/phone/call/disconnected')
    } catch (error) {
        console.error(error)
    }
}
