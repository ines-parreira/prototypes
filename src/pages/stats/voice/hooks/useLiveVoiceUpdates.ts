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
        }
    }

    return {
        channel,
        handleEvent,
    }
}
