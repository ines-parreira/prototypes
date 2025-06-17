import { useMemo } from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'

import { DomainEvent } from '@gorgias/events'
import {
    ListLiveCallQueueVoiceCallsParams,
    LiveCallQueueVoiceCall,
    VoiceCallDirection,
    VoiceCallStatus,
} from '@gorgias/helpdesk-queries'
import { ChannelNameOptions, useAccountId } from '@gorgias/realtime'

import { FeatureFlagKey } from 'config/featureFlags'

import {
    addVoiceCallToLiveCallsQueryCache,
    removeAgentStatusInLiveAgentsQueryCache,
    removeVoiceCallInLiveAgentsQueryCache,
    transformDateToUTCString,
    updateAgentStatusInLiveAgentsQueryCache,
    updateVoiceCallInLiveCallsQueryCache,
} from './utils'

const CHANNEL_NAME = 'stats.liveVoice'

export const useLiveVoiceUpdates = (
    params: ListLiveCallQueueVoiceCallsParams | undefined,
    voiceCalls: LiveCallQueueVoiceCall[] | undefined,
) => {
    const useLiveUpdates = useFlags()[FeatureFlagKey.UseLiveVoiceUpdates]
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

    const voiceCallIdToSid: Record<number, string> =
        voiceCalls?.reduce(
            (acc, call) => ({ ...acc, [call.id]: call.external_id }),
            {},
        ) ?? {}

    const handleEvent = (event: DomainEvent) => {
        if (!useLiveUpdates) {
            return
        }
        switch (event.dataschema) {
            case '//helpdesk/phone.voice-call.inbound.received/1.0.0': {
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
                const voiceCallSid = voiceCallIdToSid[event.data.voice_call_id]
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
            case '//helpdesk/phone.voice-call.inbound.declined/1.0.0':
            case '//helpdesk/phone.voice-call.inbound.unanswered/1.0.0': {
                const voiceCallSid = voiceCallIdToSid[event.data.voice_call_id]
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
                const voiceCallSid = voiceCallIdToSid[event.data.voice_call_id]
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
            case '//helpdesk/phone.voice-call.outbound.ticket-associated/1.0.0':
            case '//helpdesk/phone.voice-call.inbound.ticket-associated/1.0.0': {
                updateVoiceCallInLiveCallsQueryCache(
                    {
                        id: event.data.voice_call_id,
                        ticket_id: event.data.ticket_id,
                    },
                    params,
                )
                break
            }
            case '//helpdesk/phone.voice-call.inbound.enqueued/1.1.0': {
                updateVoiceCallInLiveCallsQueryCache(
                    {
                        id: event.data.voice_call_id,
                        status: VoiceCallStatus.Queued,
                        queue_id: event.data.queue_id,
                        status_in_queue: event.data.status_in_queue,
                    },
                    params,
                )
                break
            }
            case '//helpdesk/phone.voice-call.inbound.ended/1.1.0':
            case '//helpdesk/phone.voice-call.outbound.ended/1.1.0':
            case '//helpdesk/phone.voice-call.inbound.ending-triggered/1.1.0': {
                const voiceCallSid = voiceCallIdToSid[event.data.voice_call_id]
                if (voiceCallSid) {
                    removeVoiceCallInLiveAgentsQueryCache(voiceCallSid, params)
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
                const voiceCallSid = voiceCallIdToSid[event.data.voice_call_id]
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
        }
    }

    return {
        channel,
        handleEvent,
    }
}
