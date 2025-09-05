import {
    IntegrationType,
    PhoneFunction,
    SendToVoicemailStep,
    VoiceMessageType,
} from '@gorgias/helpdesk-queries'
import { CallRoutingFlow } from '@gorgias/helpdesk-types'

import {
    DEFAULT_VOICE_MESSAGE,
    VOICEMAIL_DEFAULT_VOICE_MESSAGE,
} from 'models/integration/constants'

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
    voicemail: { ...VOICEMAIL_DEFAULT_VOICE_MESSAGE },
    allow_to_leave_voicemail: true,
    next_step_id: null,
}

export const DEFAULT_IVR_INTEGRATION_FLOW: CallRoutingFlow = {
    first_step_id: 'business_hours',
    steps: {
        business_hours: {
            id: 'business_hours',
            name: 'Business Hours',
            step_type: 'time_split_conditional',
            on_true_step_id: 'ivr_menu',
            on_false_step_id: 'voicemail',
        },
        ivr_menu: {
            id: 'ivr_menu',
            name: 'IVR Menu',
            step_type: 'ivr_menu',
            message: {
                voice_message_type: 'text_to_speech',
                text_to_speech_content:
                    'Hello, thanks for calling. This IVR number has no menu options. Press 1 for set up instructions.',
            },
            branch_options: [
                {
                    input_digit: '1',
                    branch_name: 'IVR instructions',
                    next_step_id: 'ivr-instructions',
                },
            ],
        },
        'ivr-instructions': {
            id: 'ivr-instructions',
            name: 'IVR instructions',
            step_type: 'play_message',
            message: {
                voice_message_type: 'text_to_speech',
                text_to_speech_content:
                    'You can update greetings and menu options in the Call flow settings page.',
            },
            next_step_id: null,
        },
        voicemail: VOICEMAIL_FLOW_STEP,
    },
}
