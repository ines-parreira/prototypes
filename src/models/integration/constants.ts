// Update these statuspage components as well when you add a new integration here:
import { VoiceMessageNone } from './types'

// src/services/statusPageManager/constants.ts
export enum IntegrationType {
    Email = 'email',
    Gmail = 'gmail',
    Outlook = 'outlook',
    Aircall = 'aircall',
    GorgiasChat = 'gorgias_chat',
    Facebook = 'facebook',
    Http = 'http',
    Shopify = 'shopify',
    BigCommerce = 'bigcommerce',
    Recharge = 'recharge',
    Smile = 'smile',
    Magento2 = 'magento2',
    Zendesk = 'zendesk',
    Yotpo = 'yotpo',
    Klaviyo = 'klaviyo',
    Phone = 'phone',
    Sms = 'sms',
    Twitter = 'twitter',
    Alloy = 'alloy',
    App = 'app',
    WhatsApp = 'whatsapp',
    Ecommerce = 'ecom',
}

export enum VoiceMessageType {
    VoiceRecording = 'voice_recording',
    TextToSpeech = 'text_to_speech',
    None = 'none',
}

export enum IvrMenuActionType {
    ForwardToExternalNumber = 'forward_to_external_number',
    ForwardToGorgiasNumber = 'forward_to_gorgias_number',
    PlayMessage = 'play_message',
    SendToSms = 'deflect_to_sms',
}

export enum AddressType {
    Company = 'company',
    Personal = 'personal',
}

export const HELP_CENTER_INTEGRATION_ADDRESS_PREFIX = 'help-center'
export const CONTACT_FORM_INTEGRATION_ADDRESS_PREFIX = 'contact-form'

export const MESSAGING_INTEGRATION_TYPES = Object.freeze([
    IntegrationType.Email,
    IntegrationType.Outlook,
    IntegrationType.Gmail,
    IntegrationType.Aircall,
    IntegrationType.Facebook,
    IntegrationType.GorgiasChat,
    IntegrationType.Phone,
    IntegrationType.Sms,
    IntegrationType.WhatsApp,
    IntegrationType.Twitter,
    IntegrationType.Yotpo,
])

export const DEFAULT_GREETING_MESSAGE: VoiceMessageNone = {
    voice_message_type: VoiceMessageType.None,
}

export const DEFAULT_VOICE_MESSAGE = {
    voice_message_type: VoiceMessageType.TextToSpeech,
    text_to_speech_content:
        "Hello, unfortunately we aren't able to take your call right now. Please call us back later. Thank you!",
}

export const VOICEMAIL_DEFAULT_VOICE_MESSAGE = {
    voice_message_type: VoiceMessageType.TextToSpeech,
    text_to_speech_content:
        "Hello, unfortunately we aren't able to take your call right now. Please leave us a voicemail and we'll get back to you as soon as possible. Thank you!",
}

export const DEFAULT_IVR_SETTINGS = {
    greeting_message: {
        voice_message_type: VoiceMessageType.TextToSpeech,
        text_to_speech_content:
            'Hello, thanks for calling. This IVR number has no menu options. Press 1 for set up instructions.',
    },
    menu_options: [
        {
            action: IvrMenuActionType.PlayMessage,
            digit: '1',
            voice_message: {
                voice_message_type: VoiceMessageType.TextToSpeech,
                text_to_speech_content:
                    "You can update greetings and menu options in the integration's IVR settings page.",
            },
        },
    ],
}

export const DEFAULT_IVR_DEFLECTION_CONFIRMATION_MESSAGE = {
    voice_message_type: VoiceMessageType.TextToSpeech,
    text_to_speech_content:
        'Thank you for choosing our service! We’ve received your request and are on it.',
}

export const DEFAULT_IVR_DEFLECTION_SMS_CONTENT =
    'Hello! Thanks for choosing our messaging service. How can I help you?'
export const DEFAULT_EMAIL_DKIM_KEY_SIZE = 1024

export enum EmailProvider {
    Mailgun = 'mailgun',
    Sendgrid = 'sendgrid',
}

export enum EmailIntegrationDefaultProviderSetting {
    SendViaGmail = 'enable_gmail_sending',
    SendViaOutlook = 'enable_outlook_sending',
}

export const TAGS_LIMIT = 30

export const TEXT_TO_SPEECH_MAX_LENGTH = 1000
export const MAX_VOICE_RECORDING_FILE_SIZE_MB = 2
export const MAX_WAIT_MUSIC_CUSTOM_RECORDING_FILE_SIZE_MB = 3

export const DEPRECATED_DEFAULT_RECORDING_NOTIFICATION = {
    voice_message_type: VoiceMessageType.TextToSpeech,
    text_to_speech_content:
        'This call may be monitored and recorded for record keeping, training, or quality-assurance purposes.',
}

export const DEFAULT_RECORDING_NOTIFICATION = {
    voice_message_type: VoiceMessageType.TextToSpeech,
    text_to_speech_content:
        'This call may be recorded for notetaking, training, or record-keeping purposes.',
}
export const RECORDING_NOTIFICATION_MAX_DURATION = 1 * 60

export const DEFAULT_CALLBACK_REQUESTS = {
    enabled: false,
    prompt_message: {
        voice_message_type: VoiceMessageType.TextToSpeech,
        text_to_speech_content: `You can request a callback at any time. Just press star and we'll return your call shortly.`,
    },
    confirmation_message: {
        voice_message_type: VoiceMessageType.TextToSpeech,
        text_to_speech_content:
            'Your callback has been requested. Please leave a message after the tone.',
    },
    allow_to_leave_voicemail: true,
}
