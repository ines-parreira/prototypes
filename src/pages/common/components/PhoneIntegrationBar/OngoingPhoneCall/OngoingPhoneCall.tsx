import React, {useCallback, useState, useEffect} from 'react'
import {Call} from '@twilio/voice-sdk'
import {connect, ConnectedProps} from 'react-redux'
import {AxiosError} from 'axios'
import classNames from 'classnames'

import {TwilioSocketEventType} from 'business/twilio'
import {
    sendTwilioSocketEvent,
    gatherCallContext,
} from 'hooks/integrations/phone/utils'

import IconButton from 'pages/common/components/button/IconButton'
import PhoneIntegrationName from 'pages/common/components/PhoneIntegrationBar/PhoneIntegrationName/PhoneIntegrationName'
import PhoneInfobarWrapper from 'pages/common/components/PhoneIntegrationBar/PhoneInfobarWrapper/PhoneInfobarWrapper'
import PhoneCustomerName from 'pages/common/components/PhoneIntegrationBar/PhoneCustomerName/PhoneCustomerName'
import {useConnectionParameters} from 'pages/common/components/PhoneIntegrationBar/hooks'
import {
    CallRecordingStatus,
    TWILIO_CURRENT_ITEM,
} from 'pages/common/components/PhoneIntegrationBar/constants'

import client from 'models/api/resources'
import {RootState} from 'state/types'
import {setIsRecording} from 'state/twilio/actions'
import * as integrationsSelectors from 'state/integrations/selectors'
import {notify as notifyAction} from 'state/notifications/actions'
import {Notification, NotificationStatus} from 'state/notifications/types'

import DialPad from './DialPad/DialPad'
import css from './OngoingPhoneCall.less'

type OwnProps = {
    call: Call
}

type Props = OwnProps & ConnectedProps<typeof connector>

export function OngoingPhoneCall({
    call,
    isRecording,
    setIsRecording,
    integration,
    notify,
}: Props): JSX.Element {
    const {isMuted, onToggleMute} = useMute(call)
    const {onDisconnect} = useDisconnect(call)
    const {integrationId, customerName, customerPhoneNumber} =
        useConnectionParameters(call)

    const {startRecording, isRequestPending} = useRecording(
        call,
        isRecording,
        setIsRecording,
        notify
    )

    useEffect(() => {
        const isInbound = call.direction === Call.CallDirection.Incoming
        const isOutbound = call.direction === Call.CallDirection.Outgoing

        const isInboundAndRecordingEnabled =
            isInbound &&
            integration.getIn(['meta', 'preferences', 'record_inbound_calls'])
        const isOutboundAndRecordingEnabled =
            isOutbound &&
            integration.getIn(['meta', 'preferences', 'record_outbound_calls'])

        if (isInboundAndRecordingEnabled || isOutboundAndRecordingEnabled) {
            setIsRecording(true)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div data-testid="ongoing-phone-call" className={css.container}>
            <div className={css.inner}>
                <PhoneIntegrationName integrationId={integrationId} />
                <PhoneCustomerName
                    name={customerName}
                    phoneNumber={customerPhoneNumber}
                />
                <DialPad className={css.dialPad} call={call} />
                <IconButton
                    intent="secondary"
                    data-testid="mute-call-button"
                    className={css.mute}
                    onClick={onToggleMute}
                >
                    {isMuted ? 'mic_off' : 'mic'}
                </IconButton>
                <IconButton
                    data-testid="record-call-button"
                    className={css.recording}
                    intent="secondary"
                    isDisabled={isRequestPending}
                    onClick={startRecording}
                    iconClassName={classNames('text-danger', {
                        'material-icons-outlined': isRecording,
                        'material-icons': !isRecording,
                    })}
                >
                    {isRecording ? 'stop_circle' : 'fiber_manual_record'}
                </IconButton>
                <IconButton
                    data-testid="end-call-button"
                    intent="destructive"
                    onClick={onDisconnect}
                >
                    call_end
                </IconButton>
            </div>
            <PhoneInfobarWrapper>
                <span>Connected</span>
            </PhoneInfobarWrapper>
        </div>
    )
}

function useMute(call: Call) {
    const [isMuted, setIsMuted] = useState(call.isMuted())

    const onToggleMute = useCallback(() => {
        call.mute(!isMuted)
        setIsMuted(!isMuted)
        const muteEvent = isMuted
            ? TwilioSocketEventType.CallUnmuted
            : TwilioSocketEventType.CallMuted
        sendTwilioSocketEvent({
            type: muteEvent,
            data: gatherCallContext(call),
        })
    }, [call, isMuted])

    return {isMuted, onToggleMute}
}

function useDisconnect(call: Call) {
    const onDisconnect = useCallback(() => {
        call.disconnect()
    }, [call])

    return {onDisconnect}
}

function useRecording(
    call: Call,
    isRecording: boolean,
    setIsRecording: (isRecording: boolean) => void,
    notify: (message: Notification) => Promise<unknown>
) {
    const [isRequestPending, setIsRequestPending] = useState(false)

    const startRecording = useCallback(async () => {
        const customParams = call.customParameters
        const integrationId = parseInt(
            customParams.get('integration_id') as string
        )

        const callSid = customParams.get('call_sid')
            ? (customParams.get('call_sid') as string)
            : call.parameters.CallSid

        const status = isRecording
            ? CallRecordingStatus.Paused
            : CallRecordingStatus.InProgress

        setIsRequestPending(true)

        try {
            await client.put(
                `/api/integrations/${integrationId}/calls/${callSid}/recordings/${TWILIO_CURRENT_ITEM}`,
                {status}
            )
            setIsRecording(!isRecording)
            const recordingEvent =
                status === CallRecordingStatus.Paused
                    ? TwilioSocketEventType.CallRecordingPaused
                    : TwilioSocketEventType.CallRecordingStarted
            sendTwilioSocketEvent({
                type: recordingEvent,
                data: gatherCallContext(call),
            })
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isRequestPending, isRecording, call])

    return {
        startRecording,
        isRequestPending,
        setIsRequestPending,
    }
}

const mapStateToProps = (state: RootState, ownProps: OwnProps) => {
    const integrationId = parseInt(
        ownProps.call.customParameters.get('integration_id') as string
    )

    const integration =
        integrationsSelectors.getIntegrationById(integrationId)(state)

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
