import { VoiceCallStatus } from '@gorgias/helpdesk-types'

import { VoiceCall } from 'models/voiceCall/types'

export const voiceCall: VoiceCall = {
    id: 123,
    integration_id: 234,
    ticket_id: 345,
    phone_number_id: 456,
    external_id: 'CA777a8b2bfef8cdf709896080fe94cd10',
    provider: 'twilio',
    status: VoiceCallStatus.Completed,
    direction: 'inbound',
    phone_number_source: '+14791234567',
    country_source: 'US',
    phone_number_destination: '+17201234567',
    country_destination: 'US',
    duration: 60,
    started_datetime: '2023-08-31T00:00:00.000000+00:00',
    created_datetime: '2023-08-31T00:00:00.000000+00:00',
    updated_datetime: '2023-08-31T00:00:00.000000+00:00',
    initiated_by_agent_id: 567,
    last_answered_by_agent_id: 678,
    customer_id: 789,
    has_call_recording: false,
    has_voicemail: false,
}
