import {
    Box,
    Disclosure,
    DisclosureHeader,
    DisclosurePanel,
    DropdownIcon,
    Icon,
    Skeleton,
    Text,
} from '@gorgias/axiom'
import {
    PhoneRingingBehaviour,
    useGetVoiceQueue,
} from '@gorgias/helpdesk-queries'
import type { VoiceCall } from '@gorgias/helpdesk-queries'

import {
    getInboundDisplayStatus,
    getPrettyVoiceCallDisplayStatusName,
} from '../../../models/statusMapping'
import { VoiceCallDisplayStatus } from '../../../models/types'
import { getAnsweringVoiceSubject, isCallTransfer } from '../../../models/utils'
import { VoiceCallAgentLabel } from './VoiceCallAgentLabel'
import { VoiceCallDuration } from './VoiceCallDuration'
import { VoiceCallEvents } from './VoiceCallEvents'
import { VoiceCallSubjectLabel } from './VoiceCallSubjectLabel'

import css from './VoiceCallInboundStatus.less'

type VoiceCallInboundStatusProps = {
    voiceCall: VoiceCall
}

export function VoiceCallInboundStatus({
    voiceCall,
}: VoiceCallInboundStatusProps) {
    const displayStatus = getInboundDisplayStatus(
        voiceCall.status,
        voiceCall.termination_status,
        voiceCall.last_answered_by_agent_id,
        voiceCall.status_in_queue,
    )
    const isTransfer = isCallTransfer({
        ...voiceCall,
        last_answered_by_agent_id: voiceCall.last_answered_by_agent_id ?? null,
    })

    switch (displayStatus) {
        case VoiceCallDisplayStatus.Routing:
            return (
                <Text color="content-neutral-secondary">
                    {getPrettyVoiceCallDisplayStatusName(
                        VoiceCallDisplayStatus.Routing,
                    )}
                </Text>
            )
        case VoiceCallDisplayStatus.InProgress:
        case VoiceCallDisplayStatus.Answered: {
            const answeredBySubject = getAnsweringVoiceSubject({
                ...voiceCall,
                last_answered_by_agent_id:
                    voiceCall.last_answered_by_agent_id ?? null,
            })

            return (
                <WithCallEvents
                    voiceCall={voiceCall}
                    statusElement={
                        <Box
                            flexDirection="row"
                            alignItems="center"
                            className={css.flexWrapPreWrap}
                        >
                            <Text as="span" color="content-neutral-secondary">
                                Answered by{' '}
                            </Text>
                            {answeredBySubject && (
                                <VoiceCallSubjectLabel
                                    subject={answeredBySubject}
                                />
                            )}
                            <Text as="span" color="content-neutral-secondary">
                                .{' '}
                            </Text>
                            <VoiceCallDuration voiceCall={voiceCall} />
                        </Box>
                    }
                />
            )
        }
        case VoiceCallDisplayStatus.Missed:
        case VoiceCallDisplayStatus.Abandoned:
        case VoiceCallDisplayStatus.Cancelled:
        case VoiceCallDisplayStatus.CallbackRequested:
            return (
                <WithCallEvents
                    voiceCall={voiceCall}
                    statusElement={
                        <Box flexDirection="row" alignItems="center" gap="xs">
                            {displayStatus ===
                            VoiceCallDisplayStatus.CallbackRequested ? (
                                <>
                                    <Icon
                                        name="phone"
                                        size="sm"
                                        color="content-error-default"
                                    />
                                    <Text color="content-error-default">
                                        Callback requested
                                    </Text>
                                </>
                            ) : (
                                <>
                                    <Icon
                                        name="phone-missed"
                                        size="sm"
                                        color={
                                            displayStatus ===
                                            VoiceCallDisplayStatus.Cancelled
                                                ? 'content-neutral-secondary'
                                                : 'content-error-default'
                                        }
                                    />
                                    <Text
                                        color={
                                            displayStatus ===
                                            VoiceCallDisplayStatus.Cancelled
                                                ? 'content-neutral-secondary'
                                                : 'content-error-default'
                                        }
                                    >
                                        {getPrettyVoiceCallDisplayStatusName(
                                            displayStatus,
                                        )}{' '}
                                        call
                                    </Text>
                                </>
                            )}
                        </Box>
                    }
                />
            )
        case VoiceCallDisplayStatus.Queued:
            if (isTransfer) {
                return (
                    <WithCallEvents
                        voiceCall={voiceCall}
                        statusElement={
                            <Text color="content-neutral-secondary">
                                Transferring to queue...
                            </Text>
                        }
                    />
                )
            }

            return (
                <Text color="content-neutral-secondary">
                    {getPrettyVoiceCallDisplayStatusName(
                        VoiceCallDisplayStatus.Queued,
                    )}
                </Text>
            )
        case VoiceCallDisplayStatus.Calling:
            if (isTransfer) {
                return (
                    <WithCallEvents
                        voiceCall={voiceCall}
                        statusElement={
                            <CallingStatus voiceCall={voiceCall} isTransfer />
                        }
                    />
                )
            }

            return <CallingStatus voiceCall={voiceCall} />
        default:
            return null
    }
}

type CallingStatusProps = {
    voiceCall: VoiceCall
    isTransfer?: boolean
}

function CallingStatus({ voiceCall, isTransfer = false }: CallingStatusProps) {
    const {
        data: queueData,
        isLoading: isQueueLoading,
        isError: isQueueError,
    } = useGetVoiceQueue(voiceCall.queue_id ?? 0, undefined, {
        query: {
            refetchOnWindowFocus: false,
        },
    })

    const verb = isTransfer ? 'Transferring to' : 'Calling'

    if (isQueueLoading || isQueueError) {
        return (
            <Box
                flexDirection="row"
                alignItems="center"
                className={css.flexWrapPreWrap}
            >
                <Text as="span" color="content-neutral-secondary">
                    {verb}{' '}
                </Text>
                <Skeleton width={70} />
            </Box>
        )
    }

    if (
        queueData?.data?.distribution_mode === PhoneRingingBehaviour.Broadcast
    ) {
        return <Text color="content-neutral-secondary">{verb} agents</Text>
    }

    return (
        <Box
            flexDirection="row"
            alignItems="center"
            className={css.flexWrapPreWrap}
        >
            <Text as="span" color="content-neutral-secondary">
                {verb}{' '}
            </Text>
            {voiceCall.last_rang_agent_id && (
                <VoiceCallAgentLabel
                    agentId={voiceCall.last_rang_agent_id}
                    phoneNumber={voiceCall.phone_number_destination}
                />
            )}
        </Box>
    )
}

type WithCallEventsProps = {
    voiceCall: VoiceCall
    statusElement: React.ReactNode
}

function WithCallEvents({ voiceCall, statusElement }: WithCallEventsProps) {
    return (
        <Disclosure width="100%">
            <DisclosureHeader
                title={({ isExpanded }) => (
                    <Box gap="xxs" alignItems="center">
                        {statusElement}
                        <DropdownIcon isOpen={isExpanded} size="sm" />
                    </Box>
                )}
                trailingSlot={null}
            />
            <DisclosurePanel pt="xs">
                <VoiceCallEvents
                    callId={voiceCall.id}
                    terminationStatus={voiceCall.termination_status}
                />
            </DisclosurePanel>
        </Disclosure>
    )
}
