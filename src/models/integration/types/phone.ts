// g/integrations/phone/schemas.py

import {createTypeGuard} from '../../../utils'

import {IntegrationType} from '../constants'

import {IntegrationBase} from './base'

import type {Integration} from './'

export type PhoneIntegration = IntegrationBase & {
    type: IntegrationType.Phone
    meta: PhoneIntegrationMeta
}

export type PhoneIntegrationMeta = {
    emoji: string
    function: string
    country: string
    type: string
    state?: string
    area_code: string
    twilio?: Maybe<{
        incoming_phone_number: {
            sid: string
            friendly_name: string
            phone_number: string
            deleted_datetime: string
        }
    }>
    preferences: {
        record_inbound_calls: boolean
        record_outbound_calls: boolean
        voicemail_outside_business_hours: boolean
    }
    voicemail: VoiceMessage & {
        allow_to_leave_voicemail: boolean
    }
}

export enum VoiceMessageType {
    VoiceRecording = 'voice_recording',
    TextToSpeech = 'text_to_speech',
}

export type VoiceMessage = {
    voicemail_type: VoiceMessageType
    text_to_speech_content: Maybe<string>
    voice_recording_file_path: Maybe<string>
    new_voice_recording_file?: Maybe<File>
}

export const isPhoneIntegration = createTypeGuard<
    Maybe<Integration>,
    PhoneIntegration
>((input: Maybe<Integration>) =>
    input?.type === IntegrationType.Phone ? input : undefined
)
