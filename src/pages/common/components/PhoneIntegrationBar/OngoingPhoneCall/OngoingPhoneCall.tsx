import React, {useCallback, useState, useEffect} from 'react'
import {Connection} from 'twilio-client'
import {Button} from 'reactstrap'
import {connect, ConnectedProps} from 'react-redux'
import {AxiosError} from 'axios'
import classNames from 'classnames'

import PhoneIntegrationName from '../PhoneIntegrationName/PhoneIntegrationName'
import PhoneInfobarWrapper from '../PhoneInfobarWrapper/PhoneInfobarWrapper'
import PhoneCustomerName from '../PhoneCustomerName/PhoneCustomerName'
import {useConnectionParameters} from '../hooks'

import client from '../../../../../models/api/resources'
import {CallRecordingStatus} from '../constants'
import {RootState} from '../../../../../state/types'
import {setIsRecording} from '../../../../../state/twilio/actions'
import * as integrationsSelectors from '../../../../../state/integrations/selectors'
import {notify as notifyAction} from '../../../../../state/notifications/actions'
import {
    Notification,
    NotificationStatus,
} from '../../../../../state/notifications/types'

import DialPad from './DialPad/DialPad'
import css from './OngoingPhoneCall.less'

type OwnProps = {
    connection: Connection
}

type Props = OwnProps & ConnectedProps<typeof connector>

export function OngoingPhoneCall({
    connection,
    isRecording,
    setIsRecording,
    integration,
    notify,
}: Props): JSX.Element {
    const {isMuted, onToggleMute} = useMute(connection)
    const {onDisconnect} = useDisconnect(connection)
    const {
        integrationId,
        customerName,
        customerPhoneNumber,
    } = useConnectionParameters(connection)

    const {startRecording, isRequestPending} = useRecording(
        connection,
        isRecording,
        setIsRecording,
        notify
    )

    useEffect(() => {
        const isInbound =
            connection.direction === Connection.CallDirection.Incoming
        const isOutbound =
            connection.direction === Connection.CallDirection.Outgoing

        const isInboundAndRecordingEnabled =
            isInbound &&
            integration.getIn(['meta', 'preferences', 'record_inbound_calls'])
        const isOutboundAndRecordingEnabled =
            isOutbound &&
            integration.getIn(['meta', 'preferences', 'record_outbound_calls'])

        if (isInboundAndRecordingEnabled || isOutboundAndRecordingEnabled) {
            setIsRecording(true)
        }
    }, [])

    return (
        <div data-testid="ongoing-phone-call" className={css.container}>
            <div className={css.inner}>
                <PhoneIntegrationName integrationId={integrationId} />
                <PhoneCustomerName
                    name={customerName}
                    phoneNumber={customerPhoneNumber}
                />
                <DialPad className={css.dialPad} connection={connection} />
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
                    data-testid="record-call-button"
                    className={css.recording}
                    color="secondary"
                    disabled={isRequestPending}
                    onClick={startRecording}
                >
                    <i
                        className={classNames('text-danger', {
                            'material-icons-outlined': isRecording,
                            'material-icons': !isRecording,
                        })}
                    >
                        {isRecording ? 'stop_circle' : 'fiber_manual_record'}
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
                <span>Connected</span>
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

function useRecording(
    connection: Connection,
    isRecording: boolean,
    setIsRecording: (isRecording: boolean) => void,
    notify: (message: Notification) => Promise<unknown>
) {
    const [isRequestPending, setIsRequestPending] = useState(false)

    const startRecording = useCallback(async () => {
        const customParams = connection.customParameters
        const integrationId = parseInt(
            customParams.get('integration_id') as string
        )

        const callSid = customParams.get('call_sid')
            ? (customParams.get('call_sid') as string)
            : connection.parameters.CallSid

        const status = isRecording
            ? CallRecordingStatus.Paused
            : CallRecordingStatus.InProgress

        setIsRequestPending(true)

        try {
            await client.put(
                `/api/integrations/${integrationId}/calls/${callSid}/recording`,
                {status}
            )
            setIsRecording(!isRecording)
        } catch (error) {
            const {response} = error as AxiosError<{error: {msg: string}}>

            if (response) {
                const notification: Notification = {
                    status: NotificationStatus.Error,
                    message: response.data.error.msg,
                }

                void (await notify(notification))
            }
        } finally {
            setIsRequestPending(false)
        }
    }, [isRequestPending, isRecording, connection])

    return {
        startRecording,
        isRequestPending,
        setIsRequestPending,
    }
}

const mapStateToProps = (state: RootState, ownProps: OwnProps) => {
    const integrationId = parseInt(
        ownProps.connection.customParameters.get('integration_id') as string
    )

    const integration = integrationsSelectors.getIntegrationById(integrationId)(
        state
    )

    return {
        isRecording: state.twilio.isRecording,
        integration,
    }
}
const mapDispatchToProps = {
    setIsRecording,
    notify: notifyAction,
}

const connector = connect(mapStateToProps, mapDispatchToProps)
export default connector(OngoingPhoneCall)
