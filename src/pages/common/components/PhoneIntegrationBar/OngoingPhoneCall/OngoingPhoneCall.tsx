import React, {useCallback, useState, useEffect, useRef} from 'react'
import {Call} from '@twilio/voice-sdk'
import {connect, ConnectedProps} from 'react-redux'
import {AxiosError} from 'axios'
import classNames from 'classnames'

import {useFlags} from 'launchdarkly-react-client-sdk'
import {usePutCallParticipantOnHold} from '@gorgias/api-queries'
import {TwilioSocketEventType} from 'business/twilio'
import {
    sendTwilioSocketEvent,
    gatherCallContext,
    getCallSid,
} from 'hooks/integrations/phone/utils'
import socketManager from 'services/socketManager'
import {
    SocketEventType,
    VoiceCallTransferFailedEvent,
    ServerMessage,
} from 'services/socketManager/types'
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
import * as integrationsSelectors from 'state/integrations/selectors'
import {notify as notifyAction} from 'state/notifications/actions'
import {Notification, NotificationStatus} from 'state/notifications/types'

import {FeatureFlagKey} from 'config/featureFlags'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import VoiceCallAgentLabel from '../../VoiceCallAgentLabel/VoiceCallAgentLabel'
import InCallDialPad from './InCallDialPad/InCallDialPad'
import IconButtonTooltip from './IconButtonTooltip'
import CallTransferDropdown from './CallTransferDropdown'
import css from './OngoingPhoneCall.less'

type OwnProps = {
    call: Call
}

type Props = OwnProps & ConnectedProps<typeof connector>

export function OngoingPhoneCall({
    call,
    integration,
    notify,
}: Props): JSX.Element {
    const [isTransferDropdownOpen, setIsTransferDropdownOpen] = useState(false)
    const {isMuted, onToggleMute} = useMute(call)
    const {integrationId, customerName, customerPhoneNumber} =
        useConnectionParameters(call)
    const [isOnHold, setIsOnHold] = useState(false)
    const [isTransferring, setIsTransferring] = useState(false)
    const [transferringTo, setTransferringTo] = useState<number | null>(null)
    const [isRecording, setIsRecording] = useState(false)
    const isCallHoldEnabled = useFlags()[FeatureFlagKey.CallOnHold]
    const isCallTransferEnabled = useFlags()[FeatureFlagKey.CallTransfer]

    const {mutate: changeHoldState} = usePutCallParticipantOnHold({
        mutation: {
            onSuccess: (_, {data: {hold_state}}) => {
                setIsOnHold(hold_state)
            },
            onError: () => {
                void notify({
                    status: NotificationStatus.Error,
                    message:
                        'Call hold could not be completed. Please try again. ',
                })
            },
        },
    })

    const {startRecording, isRequestPending} = useRecording(
        call,
        isRecording,
        setIsRecording,
        notify
    )

    const transferButtonRef = useRef<HTMLButtonElement>(null)

    const handleReceiveTransferFailedEvent = useCallback(
        (json: ServerMessage) => {
            const eventData = json as VoiceCallTransferFailedEvent
            setIsTransferring(false)
            setTransferringTo(null)

            void notify({
                dismissAfter: 5000,
                status: NotificationStatus.Info,
                message: eventData.event.data.error.message,
            })
        },
        [notify, setIsTransferring]
    )

    useEffect(() => {
        socketManager.registerReceivedEvents([
            {
                name: SocketEventType.VoiceCallTransferFailed,
                onReceive: handleReceiveTransferFailedEvent,
            },
        ])

        return () => {
            socketManager.unregisterReceivedEvents([
                {
                    name: SocketEventType.VoiceCallTransferFailed,
                    onReceive: function () {},
                },
            ])
        }
    }, [handleReceiveTransferFailedEvent])

    const handleDisconnect = () => {
        setIsRecording(false)
        call.disconnect()
    }

    const getCallDirection = (call: Call) => {
        const direction = call.customParameters.get('call_direction')
            ? (call.customParameters.get('call_direction') as string)
            : call.direction
        if (direction === 'inbound') {
            return Call.CallDirection.Incoming
        }
        if (direction === 'outbound') {
            return Call.CallDirection.Outgoing
        }
        return direction
    }

    useEffect(() => {
        const direction = getCallDirection(call)
        const isInbound = direction === Call.CallDirection.Incoming
        const isOutbound = direction === Call.CallDirection.Outgoing

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
                {transferringTo ? (
                    <div className={css.callerDetails}>
                        Transferring call to
                        <VoiceCallAgentLabel agentId={transferringTo} />
                    </div>
                ) : (
                    <PhoneCustomerName
                        name={customerName}
                        phoneNumber={customerPhoneNumber}
                    />
                )}
                <InCallDialPad className={css.dialPad} call={call} />
                {isCallTransferEnabled && (
                    <>
                        <IconButtonTooltip
                            intent="secondary"
                            data-testid="transfer-call-button"
                            onClick={() =>
                                setIsTransferDropdownOpen((isOpen) => !isOpen)
                            }
                            icon="phone_forwarded"
                            ref={transferButtonRef}
                            isDisabled={isTransferring}
                        >
                            Transfer
                        </IconButtonTooltip>
                        <CallTransferDropdown
                            target={transferButtonRef}
                            isOpen={isTransferDropdownOpen}
                            setIsOpen={setIsTransferDropdownOpen}
                            onTransferInitiated={(transferTarget) => {
                                setIsTransferring(true)
                                setIsOnHold(true)
                                setTransferringTo(transferTarget)
                            }}
                            call={call}
                        />
                    </>
                )}
                <IconButtonTooltip
                    intent="secondary"
                    data-testid="mute-call-button"
                    onClick={onToggleMute}
                    icon={isMuted ? 'mic_off' : 'mic'}
                >
                    {isMuted ? 'Unmute' : 'Mute'}
                </IconButtonTooltip>
                {isCallHoldEnabled && (
                    <IconButtonTooltip
                        intent="secondary"
                        data-testid="hold-call-button"
                        onClick={() =>
                            changeHoldState({
                                data: {
                                    participant_call_sid: getCallSid(call),
                                    hold_state: !isOnHold,
                                },
                            })
                        }
                        icon={isOnHold ? 'pause_circle_outline' : 'pause'}
                        isDisabled={isTransferring}
                    >
                        {isOnHold ? 'Take off hold' : 'Hold'}
                    </IconButtonTooltip>
                )}
                <IconButtonTooltip
                    data-testid="record-call-button"
                    intent="secondary"
                    isDisabled={isRequestPending}
                    onClick={startRecording}
                    iconClassName={classNames('text-danger', {
                        'material-icons-outlined': isRecording,
                        'material-icons': !isRecording,
                    })}
                    icon={isRecording ? 'stop_circle' : 'fiber_manual_record'}
                >
                    {isRecording ? 'Stop recording' : 'Start recording'}
                </IconButtonTooltip>
                {isTransferring ? (
                    <ConfirmButton
                        data-testid="end-call-button-with-confirmation"
                        confirmationContent={
                            'Ending this call before the transfer is complete will end the call for the customer as well.'
                        }
                        onConfirm={handleDisconnect}
                        intent="destructive"
                        confirmationButtonIntent="destructive"
                        showCancelButton={true}
                        className={css.endCallConfirmationButton}
                    >
                        <i className="material-icons">call_end</i>
                    </ConfirmButton>
                ) : (
                    <IconButton
                        data-testid="end-call-button"
                        intent="destructive"
                        onClick={handleDisconnect}
                    >
                        call_end
                    </IconButton>
                )}
            </div>
            <PhoneInfobarWrapper>
                <span>{isTransferring ? 'Transferring...' : 'Connected'}</span>
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
        integration,
    }
}
const mapDispatchToProps = {
    notify: notifyAction,
}

const connector = connect(mapStateToProps, mapDispatchToProps)
export default connector(OngoingPhoneCall)
