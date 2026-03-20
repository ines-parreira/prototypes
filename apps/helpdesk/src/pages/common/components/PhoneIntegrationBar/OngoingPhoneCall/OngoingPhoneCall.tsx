import { useCallback, useEffect, useRef, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { Call } from '@twilio/voice-sdk'
import type { AxiosError } from 'axios'
import classNames from 'classnames'
import type { ConnectedProps } from 'react-redux'
import { connect } from 'react-redux'

import { Box, Dot, Icon, Text, Tooltip, TooltipContent } from '@gorgias/axiom'
import { usePutCallParticipantOnHold } from '@gorgias/helpdesk-queries'

import whisperingNotification from 'assets/audio/phone/whispering-notification.mp3'
import { TwilioSocketEventType } from 'business/twilio'
import {
    gatherCallContext,
    getCallSid,
    sendTwilioSocketEvent,
} from 'hooks/integrations/phone/twilioCall.utils'
import { useCallMessageListener } from 'hooks/integrations/phone/useCallMessageListener'
import client from 'models/api/resources'
import { TwilioMessageType } from 'models/voiceCall/twilioMessageTypes'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import {
    CallRecordingStatus,
    TWILIO_CURRENT_ITEM,
} from 'pages/common/components/PhoneIntegrationBar/constants'
import { DynamicSoundWaveIcon } from 'pages/common/components/PhoneIntegrationBar/DynamicSoundWaveIcon/DynamicSoundWaveIcon'
import {
    useAudioLevel,
    useConnectionParameters,
} from 'pages/common/components/PhoneIntegrationBar/hooks'
import IconButtonTooltip from 'pages/common/components/PhoneIntegrationBar/OngoingPhoneCall/IconButtonTooltip'
import type { TransferTarget } from 'pages/common/components/PhoneIntegrationBar/OngoingPhoneCall/types'
import PhoneBarCallerDetailsContainer from 'pages/common/components/PhoneIntegrationBar/PhoneBarCallerDetailsContainer/PhoneBarCallerDetailsContainer'
import PhoneCustomerName from 'pages/common/components/PhoneIntegrationBar/PhoneCustomerName/PhoneCustomerName'
import PhoneInfobarWrapper from 'pages/common/components/PhoneIntegrationBar/PhoneInfobarWrapper/PhoneInfobarWrapper'
import PhoneIntegrationName from 'pages/common/components/PhoneIntegrationBar/PhoneIntegrationName/PhoneIntegrationName'
import { useCustomSound } from 'pages/common/hooks/useCustomSound'
import socketManager from 'services/socketManager'
import type {
    ServerMessage,
    VoiceCallTransferFailedEvent,
} from 'services/socketManager/types'
import { SocketEventType } from 'services/socketManager/types'
import * as integrationsSelectors from 'state/integrations/selectors'
import { notify as notifyAction } from 'state/notifications/actions'
import type { Notification } from 'state/notifications/types'
import { NotificationStatus } from 'state/notifications/types'
import type { RootState } from 'state/types'

import PhoneBarContainer from '../PhoneBarContainer/PhoneBarContainer'
import PhoneBarInnerContent from '../PhoneBarInnerContent/PhoneBarInnerContent'
import QueueName from '../QueueName/QueueName'
import CallTransferDropdown from './CallTransferDropdown/CallTransferDropdown'
import InCallDialPad from './InCallDialPad/InCallDialPad'
import { TransferTargetLabel } from './TransferTargetLabel'

import css from './OngoingPhoneCall.less'

type OwnProps = {
    call: Call
}

type Props = OwnProps & ConnectedProps<typeof connector>

export function OngoingPhoneCall({
    call,
    integration,
    routingViaIntegration,
    notify,
}: Props): JSX.Element {
    const applyCallBarRestyling = useFlag(FeatureFlagKey.CallBarRestyling)

    const [isTransferDropdownOpen, setIsTransferDropdownOpen] = useState(false)
    const { isMuted, onToggleMute } = useMute(call)
    const { integrationId, customerName, customerPhoneNumber, ticketId } =
        useConnectionParameters(call)
    const [isOnHold, setIsOnHold] = useState(false)
    const [isTransferring, setIsTransferring] = useState(false)
    const [transferringTo, setTransferringTo] = useState<TransferTarget | null>(
        null,
    )
    const [isRecording, setIsRecording] = useState(false)
    const [isBeingWhispered, setIsBeingWhispered] = useState(false)

    const queueId = call.customParameters.get('queue_id')
        ? parseInt(call.customParameters.get('queue_id') as string)
        : null

    const { mutate: changeHoldState } = usePutCallParticipantOnHold({
        mutation: {
            onSuccess: (_, { data: { hold_state } }) => {
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

    const { startRecording, isRequestPending } = useRecording(
        call,
        isRecording,
        setIsRecording,
        notify,
    )

    const transferButtonRef = useRef<HTMLButtonElement>(null)

    const handleReceiveTransferFailedEvent = useCallback(
        (json: ServerMessage) => {
            const eventData = json as VoiceCallTransferFailedEvent
            setIsTransferring(false)
            setTransferringTo(null)
            setIsOnHold(false)

            void notify({
                dismissAfter: 5000,
                status: NotificationStatus.Info,
                message: eventData.event.data.error.message,
            })
        },
        [notify, setIsTransferring],
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
        const currentIntegration = routingViaIntegration || integration

        const isInboundAndRecordingEnabled =
            isInbound &&
            currentIntegration.getIn([
                'meta',
                'preferences',
                'record_inbound_calls',
            ])
        const isOutboundAndRecordingEnabled =
            isOutbound &&
            currentIntegration.getIn([
                'meta',
                'preferences',
                'record_outbound_calls',
            ])

        if (isInboundAndRecordingEnabled || isOutboundAndRecordingEnabled) {
            setIsRecording(true)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const { playSound: playWhisperingNotificationSound } = useCustomSound(
        whisperingNotification,
    )

    useCallMessageListener(call, (twilioMessage) => {
        if (twilioMessage.type === TwilioMessageType.MonitoringUpdate) {
            switch (twilioMessage.data.monitoring_status) {
                case 'whispering':
                    setIsBeingWhispered(true)
                    playWhisperingNotificationSound()
                    break
                default:
                    setIsBeingWhispered(false)
                    playWhisperingNotificationSound()
            }
        }
    })

    const audioLevel = useAudioLevel(call)

    return (
        <PhoneBarContainer>
            <PhoneBarInnerContent>
                <PhoneBarCallerDetailsContainer>
                    <Box
                        display="flex"
                        gap={applyCallBarRestyling ? 'xs' : undefined}
                        marginRight="lg"
                    >
                        <PhoneIntegrationName integrationId={integrationId} />
                        <QueueName queueId={queueId} />
                    </Box>
                    {transferringTo ? (
                        <TransferTargetLabel transferringTo={transferringTo} />
                    ) : (
                        <PhoneCustomerName
                            name={customerName}
                            phoneNumber={customerPhoneNumber}
                            ticketId={ticketId}
                        />
                    )}
                </PhoneBarCallerDetailsContainer>
                <Box display="flex" alignItems="center" gap="sm">
                    <InCallDialPad call={call} />
                    <IconButtonTooltip
                        aria-label="Transfer phone call"
                        onClick={() =>
                            setIsTransferDropdownOpen((isOpen) => !isOpen)
                        }
                        icon="comm-phone-outgoing"
                        legacyIcon="phone_forwarded"
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
                        integrationPhoneNumberId={
                            integration.getIn(['meta', 'phone_number_id']) as
                                | number
                                | undefined
                        }
                    />
                    <DynamicSoundWaveIcon
                        audioLevel={!isMuted ? audioLevel : 0}
                        hide={isMuted}
                    >
                        <IconButtonTooltip
                            aria-label={`${isMuted ? 'Unmute' : 'Mute'} phone call`}
                            onClick={onToggleMute}
                            icon={isMuted ? 'mic-mute' : 'mic'}
                            legacyIcon={isMuted ? 'mic_off' : 'mic'}
                        >
                            {isMuted ? 'Unmute' : 'Mute'}
                        </IconButtonTooltip>
                    </DynamicSoundWaveIcon>
                    <IconButtonTooltip
                        aria-label={`${
                            isOnHold ? 'Take off hold on' : 'Hold'
                        } phone call`}
                        onClick={() =>
                            changeHoldState({
                                data: {
                                    participant_call_sid: getCallSid(call),
                                    hold_state: !isOnHold,
                                },
                            })
                        }
                        icon={isOnHold ? 'media-play-circle' : 'media-pause'}
                        legacyIcon={isOnHold ? 'pause_circle_outline' : 'pause'}
                        isDisabled={isTransferring}
                    >
                        {isOnHold ? 'Take off hold' : 'Hold'}
                    </IconButtonTooltip>
                    <IconButtonTooltip
                        aria-label={`${
                            isRecording ? 'Stop' : 'Start'
                        } recording phone call`}
                        onClick={startRecording}
                        icon={
                            isRecording ? (
                                <Icon
                                    name="media-stop-circle"
                                    color="red"
                                    size="lg"
                                />
                            ) : (
                                <Dot color="red" size="xxl" />
                            )
                        }
                        legacyIcon={
                            isRecording ? 'stop_circle' : 'fiber_manual_record'
                        }
                        legacyIconClassName={classNames('text-danger', {
                            'material-icons-outlined': isRecording,
                            'material-icons': !isRecording,
                        })}
                        isDisabled={isRequestPending}
                    >
                        {isRecording ? 'Stop recording' : 'Start recording'}
                    </IconButtonTooltip>
                    {isTransferring ? (
                        <ConfirmButton
                            aria-label="End phone call"
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
                        <IconButtonTooltip
                            aria-label="End phone call"
                            variant="primary"
                            intent="destructive"
                            onClick={handleDisconnect}
                            icon="comm-phone-end"
                            legacyIcon="call_end"
                        >
                            End call
                        </IconButtonTooltip>
                    )}
                </Box>
            </PhoneBarInnerContent>
            <PhoneInfobarWrapper>
                <Text variant={applyCallBarRestyling ? 'bold' : 'regular'}>
                    {isTransferring
                        ? 'Transferring...'
                        : isOnHold
                          ? 'On hold'
                          : 'Connected'}
                </Text>
                {isBeingWhispered && (
                    <Tooltip trigger={<Icon name="headset" size="md" />}>
                        <TooltipContent title="This call is currently being monitored." />
                    </Tooltip>
                )}
            </PhoneInfobarWrapper>
        </PhoneBarContainer>
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

    return { isMuted, onToggleMute }
}

function useRecording(
    call: Call,
    isRecording: boolean,
    setIsRecording: (isRecording: boolean) => void,
    notify: (message: Notification) => Promise<unknown>,
) {
    const [isRequestPending, setIsRequestPending] = useState(false)

    const startRecording = useCallback(async () => {
        const customParams = call.customParameters
        const integrationId = parseInt(
            customParams.get('integration_id') as string,
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
                { status },
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
            const { response } = error as AxiosError<{ error: { msg: string } }>

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
        ownProps.call.customParameters.get('integration_id') as string,
    )

    const routingViaIntegrationId = parseInt(
        ownProps.call.customParameters.get(
            'routing_via_integration_id',
        ) as string,
    )

    const integration =
        integrationsSelectors.getIntegrationById(integrationId)(state)
    const routingViaIntegration = routingViaIntegrationId
        ? integrationsSelectors.getIntegrationById(routingViaIntegrationId)(
              state,
          )
        : null

    return {
        integration,
        routingViaIntegration,
    }
}
const mapDispatchToProps = {
    notify: notifyAction,
}

const connector = connect(mapStateToProps, mapDispatchToProps)
export default connector(OngoingPhoneCall)
