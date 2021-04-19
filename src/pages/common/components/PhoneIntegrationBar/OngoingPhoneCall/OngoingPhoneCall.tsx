import React, {useCallback, useState} from 'react'
import {Connection} from 'twilio-client'
import {Button} from 'reactstrap'

import PhoneIntegrationName from '../PhoneIntegrationName/PhoneIntegrationName'
import PhoneInfobarWrapper from '../PhoneInfobarWrapper/PhoneInfobarWrapper'
import PhoneCustomerName from '../PhoneCustomerName/PhoneCustomerName'
import {useConnectionParameters} from '../hooks'

import css from './OngoingPhoneCall.less'

type Props = {
    connection: Connection
}

export default function OngoingPhoneCall({connection}: Props): JSX.Element {
    const {isMuted, onToggleMute} = useMute(connection)
    const {onDisconnect} = useDisconnect(connection)
    const {
        integrationId,
        customerName,
        customerPhoneNumber,
    } = useConnectionParameters(connection)

    return (
        <div data-testid="ongoing-phone-call" className={css.container}>
            <div className={css.inner}>
                <PhoneIntegrationName integrationId={integrationId} />
                <PhoneCustomerName
                    name={customerName}
                    phoneNumber={customerPhoneNumber}
                />
                <Button
                    data-testid="mute-call-button"
                    className={css.mute}
                    onClick={onToggleMute}
                >
                    <i className="material-icons">
                        {isMuted ? 'mic_off' : 'mic'}
                    </i>
                </Button>
                <Button
                    data-testid="end-call-button"
                    color="danger"
                    onClick={onDisconnect}
                >
                    <i className="material-icons">call_end</i>
                </Button>
            </div>
            <PhoneInfobarWrapper>
                <>
                    <span>Connected</span>
                    {/* TODO(@samy): render actual call duration*/}
                    <span>xx:xx</span>
                </>
            </PhoneInfobarWrapper>
        </div>
    )
}

function useMute(connection: Connection) {
    const [isMuted, setIsMuted] = useState(connection.isMuted())

    const onToggleMute = useCallback(() => {
        connection.mute(!isMuted)
        setIsMuted(!isMuted)
    }, [connection, isMuted])

    return {isMuted, onToggleMute}
}

function useDisconnect(connection: Connection) {
    const onDisconnect = useCallback(() => {
        connection.disconnect()
    }, [connection])

    return {onDisconnect}
}
