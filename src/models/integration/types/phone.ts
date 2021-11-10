// g/integrations/phone/schemas.py

import {createTypeGuard} from '../../../utils'
import {
    IntegrationType,
    IvrMenuActionType,
    VoiceMessageType,
} from '../constants'
import {PhoneFunction} from '../../../business/twilio'

import {IntegrationBase} from './base'

import type {Integration} from './'

export type PhoneIntegration = IntegrationBase & {
    type: IntegrationType.Phone
    meta: PhoneIntegrationMeta
}

export type PhoneIntegrationMeta = {
    emoji: string
    function: PhoneFunction
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
    ivr?: PhoneIntegrationIvrSettings
}

export type PhoneIntegrationIvrSettings = {
    greeting_message: VoiceMessage
    menu_options: IvrMenuAction[]
}

export type VoiceMessageTextToSpeech = {
    voice_message_type: VoiceMessageType.TextToSpeech
    text_to_speech_content: string
}

export type VoiceMessageRecording = {
    voice_message_type: VoiceMessageType.VoiceRecording
    voice_recording_file_path?: string
    new_voice_recording_file?: Maybe<string>
    new_voice_recording_file_name?: string
    new_voice_recording_file_type?: string
}

export type VoiceMessageNone = {
    voice_message_type: VoiceMessageType.None
}

export type VoiceMessage =
    | VoiceMessageTextToSpeech
    | VoiceMessageRecording
    | VoiceMessageNone

export type IvrMenuAction = IvrPlayVoiceMessageAction | IvrForwardCallMenuAction

export type IvrPlayVoiceMessageAction = {
    action: IvrMenuActionType.PlayMessage
    digit: string
    voice_message: VoiceMessage
}

export type IvrForwardCallMenuAction = {
    action:
        | IvrMenuActionType.ForwardToExternalNumber
        | IvrMenuActionType.ForwardToGorgiasNumber
    digit: string
    forward_call: IvrForwardCall
}

export type IvrForwardCall = {
    phone_number: string
    integration_id?: number
}

export const isPhoneIntegration = createTypeGuard<
    Maybe<Integration>,
    PhoneIntegration
>((input: Maybe<Integration>) =>
    input?.type === IntegrationType.Phone ? input : undefined
)
