import type { MutableRefObject } from 'react'
import { useCallback, useEffect, useMemo, useRef } from 'react'

import { omit } from 'lodash'

import type { DomainEvent } from '@gorgias/events'
import type { ListLiveCallQueueVoiceCallsParams } from '@gorgias/helpdesk-queries'
import {
    useListLiveCallQueueAgents,
    useListLiveCallQueueVoiceCalls,
    VoiceCallDirection,
    VoiceCallStatus,
} from '@gorgias/helpdesk-queries'
import { AgentStatus } from '@gorgias/helpdesk-types'
import type { ChannelNameOptions } from '@gorgias/realtime'
import { useAccountId } from '@gorgias/realtime'

import {
    addVoiceCallToLiveCallsQueryCache,
    getWrapUpStatusesThatShouldExpire,
    removeAgentStatusInLiveAgentsQueryCache,
    removeVoiceCallInLiveAgentsQueryCache,
    setWrapUpExpirationTimer,
    transformDateToUTCString,
    updateAgentAvailabilityInLiveAgentsQueryCache,
    updateAgentStatusInLiveAgentsQueryCache,
    updateVoiceCallInLiveCallsQueryCache,
    updateVoiceCallInLiveCallsQueryCacheWithDebounce,
} from 'domains/reporting/pages/voice/hooks/utils'

const CHANNEL_NAME = 'stats.liveVoice'

export const useLiveVoiceUpdates = (
    params?: ListLiveCallQueueVoiceCallsParams,
) => {
    // Use ref instead of state to avoid race conditions
    const voiceCallIdToSidRef = useRef<Record<number, string>>({})
    const processedEvents = useRef<Set<string>>(new Set())
    const timeouts: MutableRefObject<Record<string, NodeJS.Timeout>> = useRef(
        {},
    )
    const accountId = useAccountId()
    const channel: ChannelNameOptions | undefined = useMemo(() => {
        if (!accountId) {
            return
        }

        return {
            name: CHANNEL_NAME,
            accountId,
        }
    }, [accountId])

    const { data: agentsData } = useListLiveCallQueueAgents(params, {
        http: {
            paramsSerializer: {
                indexes: null,
            },
        },
        query: {
            refetchOnWindowFocus: false,
            enabled: false,
        },
    })

    // retrieve all voice calls without filters to map SIDs needed for agent statuses already in use when loading the page
    const { data: allVoiceCalls } = useListLiveCallQueueVoiceCalls(
        {},
        {
            http: {
                paramsSerializer: {
                    indexes: null,
                },
            },
            query: {
                refetchOnWindowFocus: false,
                select: (data) => data.data.data,
            },
        },
    )

    useEffect(() => {
        if (!allVoiceCalls) {
            return
        }

        // keep track of all voice calls SIDs to map them to agent statuses
        voiceCallIdToSidRef.current = {
            ...voiceCallIdToSidRef.current,
            ...allVoiceCalls.reduce(
                (acc, call) => ({ ...acc, [call.id]: call.external_id }),
                {},
            ),
        }
    }, [allVoiceCalls])

    useEffect(() => {
        // set up expiration timers for wrap-up statuses of the agents
        const wrapUpStatuses = getWrapUpStatusesThatShouldExpire(
            agentsData?.data?.data,
        )

        if (wrapUpStatuses.length > 0) {
            wrapUpStatuses.forEach((status) => {
                setWrapUpExpirationTimer(timeouts, status, params)
            })
        }

        // clear existing timeouts
        return () => {
            Object.values(timeouts.current).forEach((timeout) =>
                clearTimeout(timeout),
            )
            timeouts.current = {}
        }
    }, [agentsData, params])

    const handleEvent = useCallback(
        (event: DomainEvent) => {
            // avoid processing the same event multiple times
            if (processedEvents.current.has(event.id)) {
                return
            }
            processedEvents.current.add(event.id)

            switch (event.dataschema) {
                case '//helpdesk/user-preferences.updated/1.0.0': {
                    const data = event.data
                    updateAgentAvailabilityInLiveAgentsQueryCache(
                        data.user_id,
                        {
                            available: data.available,
                            forward_calls:
                                typeof data.forward_calls === 'boolean'
                                    ? data.forward_calls
                                    : undefined,
                            forward_when_offline:
                                typeof data.forward_when_offline === 'boolean'
                                    ? data.forward_when_offline
                                    : undefined,
                        },
                        params,
                    )
                    break
                }
                case '//helpdesk/phone.voice-call.inbound.received/1.0.0':
                case '//helpdesk/phone.voice-call.inbound.received/1.1.0': {
                    const data = event.data

                    const voiceCall = {
                        id: data.voice_call_id,
                        integration_id: data.integration_id,
                        direction: VoiceCallDirection.Inbound,
                        status: data.status as VoiceCallStatus,
                        external_id: data.call_sid,
                        phone_number_source: data.phone_number_source,
                        phone_number_destination: data.phone_number_destination,
                        started_datetime: transformDateToUTCString(
                            data.started_datetime,
                        ),
                        created_datetime: transformDateToUTCString(
                            data.created_datetime,
                        ),
                        provider: data.provider,
                        customer_id: data.customer_id,
                    }
                    addVoiceCallToLiveCallsQueryCache(voiceCall, params)
                    voiceCallIdToSidRef.current = {
                        ...voiceCallIdToSidRef.current,
                        [data.voice_call_id]: data.call_sid,
                    }
                    break
                }
                case '//helpdesk/phone.voice-call.inbound.rang-agent/1.0.0': {
                    updateVoiceCallInLiveCallsQueryCache(
                        {
                            id: event.data.voice_call_id,
                            last_rang_agent_id: event.data.user_id,
                            status_in_queue: 'distributing',
                        },
                        params,
                    )
                    const voiceCallSid =
                        voiceCallIdToSidRef.current[event.data.voice_call_id]
                    if (voiceCallSid) {
                        updateAgentStatusInLiveAgentsQueryCache(
                            event.data.user_id,
                            {
                                status: VoiceCallStatus.Ringing,
                                call_sid: voiceCallSid,
                                created_datetime: new Date().toISOString(),
                            },
                            params,
                        )
                    }
                    break
                }
                case '//helpdesk/phone.voice-call.inbound.canceled/1.0.0':
                case '//helpdesk/phone.voice-call.inbound.declined/1.0.0':
                case '//helpdesk/phone.voice-call.inbound.unanswered/1.0.0': {
                    const voiceCallSid =
                        voiceCallIdToSidRef.current[event.data.voice_call_id]
                    if (voiceCallSid) {
                        removeAgentStatusInLiveAgentsQueryCache(
                            event.data.user_id,
                            voiceCallSid,
                            params,
                        )
                    }
                    break
                }
                case '//helpdesk/phone.voice-call.inbound.answered/1.0.0': {
                    updateVoiceCallInLiveCallsQueryCache(
                        {
                            id: event.data.voice_call_id,
                            last_answered_by_agent_id: event.data.user_id,
                            status: VoiceCallStatus.Answered,
                        },
                        params,
                    )
                    const voiceCallSid =
                        voiceCallIdToSidRef.current[event.data.voice_call_id]
                    if (voiceCallSid) {
                        updateAgentStatusInLiveAgentsQueryCache(
                            event.data.user_id,
                            {
                                status: VoiceCallStatus.InProgress,
                                call_sid: voiceCallSid,
                                created_datetime: new Date().toISOString(),
                            },
                            params,
                        )
                    }
                    break
                }
                case '//helpdesk/phone.voice-call.inbound.transfer-accepted/1.3.0': {
                    const voiceCallSid =
                        voiceCallIdToSidRef.current[event.data.voice_call_id]
                    // user_id is the id of the agent who started the transfer
                    if (voiceCallSid && event.data.user_id) {
                        removeAgentStatusInLiveAgentsQueryCache(
                            event.data.user_id,
                            voiceCallSid,
                            params,
                        )
                    }
                    if (event.data.transfer_type === 'external') {
                        // for transfer to external number, the call is not tied anymore to an agent
                        // so we remove it from live calls
                        updateVoiceCallInLiveCallsQueryCache(
                            {
                                id: event.data.voice_call_id,
                                status: VoiceCallStatus.Completed,
                            },
                            params,
                        )
                    }
                    break
                }
                case '//helpdesk/phone.voice-call.outbound.ticket-associated/1.0.0':
                case '//helpdesk/phone.voice-call.inbound.ticket-associated/1.0.0': {
                    updateVoiceCallInLiveCallsQueryCacheWithDebounce(
                        {
                            id: event.data.voice_call_id,
                            ticket_id: event.data.ticket_id,
                        },
                        params,
                        !voiceCallIdToSidRef.current[event.data.voice_call_id], // only debounce if the voice call is not already in live calls cache
                    )
                    break
                }
                case '//helpdesk/phone.voice-call.inbound.enqueued/1.1.0':
                case '//helpdesk/phone.voice-call.inbound.enqueued/1.2.0': {
                    updateVoiceCallInLiveCallsQueryCacheWithDebounce(
                        {
                            id: event.data.voice_call_id,
                            status: VoiceCallStatus.Queued,
                            queue_id: event.data.queue_id,
                            status_in_queue: event.data.status_in_queue,
                        },
                        params,
                        !voiceCallIdToSidRef.current[event.data.voice_call_id],
                    )
                    break
                }
                case '//helpdesk/phone.voice-call.inbound.ended/1.1.0':
                case '//helpdesk/phone.voice-call.outbound.ended/1.1.0':
                case '//helpdesk/phone.voice-call.inbound.ending-triggered/1.1.0': {
                    const voiceCallSid =
                        voiceCallIdToSidRef.current[event.data.voice_call_id]
                    if (voiceCallSid) {
                        removeVoiceCallInLiveAgentsQueryCache(
                            voiceCallSid,
                            params,
                        )
                        voiceCallIdToSidRef.current = omit(
                            voiceCallIdToSidRef.current,
                            event.data.voice_call_id,
                        )
                    }
                    updateVoiceCallInLiveCallsQueryCache(
                        {
                            id: event.data.voice_call_id,
                            status: VoiceCallStatus.Ending,
                        },
                        params,
                    )
                    break
                }
                case '//helpdesk/phone.voice-call.inbound.wrap-up-ended/1.1.0': {
                    const callSid = event.data.call_sid
                    if (callSid) {
                        removeVoiceCallInLiveAgentsQueryCache(
                            callSid,
                            params,
                            false, // remove wrap up from live agents cache
                        )
                    }
                    break
                }
                case '//helpdesk/phone.voice-call.inbound.wrap-up-started/1.1.0': {
                    const callSid = event.data.call_sid
                    const userId = event.data.user_id
                    if (callSid) {
                        updateAgentStatusInLiveAgentsQueryCache(
                            userId,
                            {
                                agent_id: userId,
                                call_sid: callSid,
                                status: AgentStatus.WrappingUp,
                                expiration_datetime: transformDateToUTCString(
                                    event.data.expiration_datetime,
                                ),
                            },
                            params,
                        )
                    }
                    break
                }
                case '//helpdesk/phone.voice-call.outbound.started/1.0.0': {
                    const data = event.data

                    const voiceCall = {
                        id: data.voice_call_id,
                        integration_id: data.integration_id,
                        direction: VoiceCallDirection.Outbound,
                        status: data.status as VoiceCallStatus,
                        external_id: data.call_sid,
                        phone_number_source: data.phone_number_source,
                        phone_number_destination: data.phone_number_destination,
                        started_datetime: transformDateToUTCString(
                            data.started_datetime,
                        ),
                        created_datetime: transformDateToUTCString(
                            data.created_datetime,
                        ),
                        provider: data.provider,
                        customer_id: data.customer_id,
                        initiated_by_agent_id: data.user_id,
                    }
                    addVoiceCallToLiveCallsQueryCache(voiceCall, params)
                    updateAgentStatusInLiveAgentsQueryCache(
                        data.user_id,
                        {
                            status: VoiceCallStatus.Ringing,
                            call_sid: data.call_sid,
                            created_datetime: new Date().toISOString(),
                        },
                        params,
                    )
                    voiceCallIdToSidRef.current = {
                        ...voiceCallIdToSidRef.current,
                        [data.voice_call_id]: data.call_sid,
                    }

                    break
                }
                case '//helpdesk/phone.voice-call.outbound.connected/1.0.0': {
                    updateVoiceCallInLiveCallsQueryCache(
                        {
                            id: event.data.voice_call_id,
                            status: VoiceCallStatus.Connected,
                        },
                        params,
                    )
                    const voiceCallSid =
                        voiceCallIdToSidRef.current[event.data.voice_call_id]
                    if (voiceCallSid) {
                        updateAgentStatusInLiveAgentsQueryCache(
                            event.data.user_id,
                            {
                                status: VoiceCallStatus.InProgress,
                                call_sid: voiceCallSid,
                                created_datetime: new Date().toISOString(),
                            },
                            params,
                        )
                    }
                    break
                }
                case '//helpdesk/phone.voice-call.inbound.monitoring-started/1.0.0':
                case '//helpdesk/phone.voice-call.outbound.monitoring-started/1.0.0': {
                    const monitoringAgentId = event.data.user_id
                    updateVoiceCallInLiveCallsQueryCache(
                        {
                            id: event.data.voice_call_id,
                            monitoring_status: 'listening',
                            last_monitoring_agent_id: monitoringAgentId,
                        },
                        params,
                    )
                    const voiceCallSid =
                        voiceCallIdToSidRef.current[event.data.voice_call_id]
                    if (voiceCallSid) {
                        updateAgentStatusInLiveAgentsQueryCache(
                            monitoringAgentId,
                            {
                                agent_id: monitoringAgentId,
                                call_sid: voiceCallSid,
                                status: AgentStatus.Monitoring,
                            },
                            params,
                        )
                    }
                    break
                }
                case '//helpdesk/phone.voice-call.inbound.monitoring-ended/1.0.0':
                case '//helpdesk/phone.voice-call.outbound.monitoring-ended/1.0.0': {
                    updateVoiceCallInLiveCallsQueryCache(
                        {
                            id: event.data.voice_call_id,
                            monitoring_status: 'none',
                        },
                        params,
                    )
                    const voiceCallSid =
                        voiceCallIdToSidRef.current[event.data.voice_call_id]
                    if (voiceCallSid) {
                        removeAgentStatusInLiveAgentsQueryCache(
                            event.data.user_id,
                            voiceCallSid,
                            params,
                        )
                    }
                    break
                }
            }
        },
        [params],
    )

    return {
        channel,
        handleEvent,
    }
}
