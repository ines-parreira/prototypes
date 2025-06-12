import { useMemo } from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'

import { DomainEvent } from '@gorgias/events'
import {
    ListLiveCallQueueVoiceCallsParams,
    VoiceCallDirection,
    VoiceCallStatus,
} from '@gorgias/helpdesk-queries'
import { ChannelNameOptions, useAccountId } from '@gorgias/realtime'

import { FeatureFlagKey } from 'config/featureFlags'

import {
    addVoiceCallToLiveCallsQueryCache,
    transformDateToUTCString,
} from './utils'

const CHANNEL_NAME = 'stats.liveVoice'

export const useLiveVoiceUpdates = () => {
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

    const handleEvent = (
        event: DomainEvent,
        params: ListLiveCallQueueVoiceCallsParams | undefined,
    ) => {
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
        }
    }

    return {
        channel,
        handleEvent,
    }
}
