// g/integrations/phone/schemas.py
import {
    Integration as ApiIntegration,
    VoiceQueueWaitMusicLibrary,
} from '@gorgias/helpdesk-queries'
import { CallRoutingFlow } from '@gorgias/helpdesk-types'

import { PhoneFunction } from 'business/twilio'

import {
    IntegrationType,
    IvrMenuActionType,
    VoiceMessageType,
} from '../constants'
import type { Integration } from './'
import type { IntegrationBase } from './base'

export type PhoneIntegration = IntegrationBase & {
    type: IntegrationType.Phone
    meta: PhoneIntegrationMeta
}

export type PhoneIntegrationMeta = {
    emoji: string | null
    function: PhoneFunction
    country: string
    type: string
    state?: string
    area_code: string
    phone_number_id: number
    preferences: PhoneIntegrationPreferences
    greeting_message: VoiceMessage
    voicemail: PhoneIntegrationVoicemailSettings
    ivr?: PhoneIntegrationIvrSettings
    phone_team_id?: Maybe<number>
    wait_music?: LocalWaitMusicPreferences
    recording_notification?: VoiceMessage
    send_calls_to_voicemail?: boolean
    flow?: CallRoutingFlow
}

export enum PhoneRingingBehaviour {
    RoundRobin = 'round_robin',
    Broadcast = 'broadcast',
}

export type PhoneIntegrationPreferences = {
    record_inbound_calls: boolean
    record_outbound_calls: boolean
    voicemail_outside_business_hours: boolean
    ringing_behaviour: PhoneRingingBehaviour
    transcribe?: {
        recordings: boolean
        voicemails: boolean
    }
    ring_time?: number
    wait_time?: {
        enabled: boolean
        value: number
    }
}

type VoicemailOutsideBusinessHoursBasicSettings = {
    use_during_business_hours_settings: boolean
}

export type PhoneIntegrationVoicemailOutsideBusinessHoursSettings =
    | (VoiceMessage & VoicemailOutsideBusinessHoursBasicSettings)
    | VoicemailOutsideBusinessHoursBasicSettings

export type PhoneIntegrationVoicemailSettings = VoiceMessage & {
    allow_to_leave_voicemail: boolean
    outside_business_hours?: PhoneIntegrationVoicemailOutsideBusinessHoursSettings
}

export type PhoneIntegrationIvrSettings = {
    greeting_message: VoiceMessage
    menu_options: IvrMenuAction[]
}

export type VoiceMessageTextToSpeech = {
    voice_message_type: VoiceMessageType.TextToSpeech | 'text_to_speech'
    text_to_speech_content: Maybe<string>
}

export type VoiceMessageRecording = {
    voice_message_type: VoiceMessageType.VoiceRecording | 'voice_recording'
    voice_recording_file_path?: string | null
    new_voice_recording_file?: Maybe<string>
    new_voice_recording_file_name?: string
    new_voice_recording_file_type?: string
}

export type VoiceMessageNone = {
    voice_message_type: VoiceMessageType.None | 'none'
}

export type VoiceMessage = {
    voice_message_type:
        | VoiceMessageType
        | 'voice_recording'
        | 'text_to_speech'
        | 'none'
    text_to_speech_content?: Maybe<string>
    voice_recording_file_path?: string | null
} & (VoiceMessageTextToSpeech | VoiceMessageRecording | VoiceMessageNone)

export type IvrMenuAction =
    | IvrPlayVoiceMessageAction
    | IvrForwardCallMenuAction
    | IvrSendToSmsMenuAction

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

export type IvrSendToSmsMenuAction = {
    action: IvrMenuActionType.SendToSms
    digit: string
    sms_deflection: IvrSmsDeflection
}

export type IvrSmsDeflection = {
    sms_integration_id?: number
    sms_content?: string
    confirmation_message: VoiceMessage
}

export const isPhoneIntegration = (
    integration: Maybe<Integration | ApiIntegration>,
): integration is PhoneIntegration =>
    integration?.type === IntegrationType.Phone

export const isStandardPhoneIntegration = (
    integration: Maybe<Integration>,
): integration is PhoneIntegration =>
    integration?.type === IntegrationType.Phone &&
    integration?.meta.function === 'standard'

export type LocalWaitMusicCustomRecording = {
    audio_file?: Maybe<string>
    audio_file_path?: Maybe<string>
    audio_file_name: string
    audio_file_type: string
}

export type LocalWaitMusicPreferences = {
    type: 'library' | 'custom_recording'
    custom_recording?: LocalWaitMusicCustomRecording
    library?: VoiceQueueWaitMusicLibrary
}
