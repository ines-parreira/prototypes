import type { SendToVoicemailStep } from '@gorgias/helpdesk-queries'
import {
    IntegrationType,
    PhoneFunction,
    VoiceMessageType,
} from '@gorgias/helpdesk-queries'

import {
    DEFAULT_VOICE_MESSAGE,
    VOICEMAIL_DEFAULT_VOICE_MESSAGE,
} from 'models/integration/constants'

import {
    DEFAULT_TTS_GENDER,
    DEFAULT_TTS_LANGUAGE,
} from '../VoiceMessageTTS/constants'

export enum VoiceIntegrationOnboardingStep {
    AddPhoneNumber = 'add-phone-number',
    ConfigureRoutingBehavior = 'configure-routing-behavior',
}

export const onboardingStepsLabels: Record<
    VoiceIntegrationOnboardingStep,
    string
> = {
    [VoiceIntegrationOnboardingStep.AddPhoneNumber]: 'Add phone number',
    [VoiceIntegrationOnboardingStep.ConfigureRoutingBehavior]:
        'Configure routing behavior',
}

export const DEFAULT_PHONE_ONBOARDING_VALUES = {
    name: '',
    type: IntegrationType.Phone,
    meta: {
        emoji: null,
        function: PhoneFunction.Standard,
        send_calls_to_voicemail: false,
        preferences: {
            record_inbound_calls: false,
            voicemail_outside_business_hours: true,
            record_outbound_calls: false,
            transcribe: {
                recordings: false,
                voicemails: false,
            },
        },
        voicemail: {
            ...DEFAULT_VOICE_MESSAGE,
            allow_to_leave_voicemail: true,
        },
        greeting_message: {
            voice_message_type: VoiceMessageType.None,
            text_to_speech_content: '',
        },
    },
}

export const VOICEMAIL_FLOW_STEP: SendToVoicemailStep = {
    id: 'voicemail',
    name: 'Voicemail',
    step_type: 'send_to_voicemail',
    voicemail: {
        ...VOICEMAIL_DEFAULT_VOICE_MESSAGE,
        language: DEFAULT_TTS_LANGUAGE,
        gender: DEFAULT_TTS_GENDER,
    },
    allow_to_leave_voicemail: true,
    next_step_id: null,
}

export const SUCCESSFUL_ONBOARDING_PARAM = 'onboarded_id'
