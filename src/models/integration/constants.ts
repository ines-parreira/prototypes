export enum IntegrationType {
    Email = 'email',
    Gmail = 'gmail',
    Outlook = 'outlook',
    Aircall = 'aircall',
    GorgiasChat = 'gorgias_chat',
    Smooch = 'smooch',
    SmoochInside = 'smooch_inside',
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
    SelfService = 'self_service',
    App = 'app',
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
}

export enum AddressType {
    Company = 'company',
    Personal = 'personal',
}

export const MESSAGING_INTEGRATION_TYPES = Object.freeze([
    IntegrationType.Email,
    IntegrationType.Outlook,
    IntegrationType.Gmail,
    IntegrationType.Aircall,
    IntegrationType.SmoochInside,
    IntegrationType.Smooch,
    IntegrationType.Facebook,
    IntegrationType.GorgiasChat,
    IntegrationType.Phone,
    IntegrationType.Sms,
    IntegrationType.Twitter,
    IntegrationType.Yotpo,
    IntegrationType.SelfService,
])

export const DEFAULT_VOICE_MESSAGE = {
    voice_message_type: VoiceMessageType.TextToSpeech,
    text_to_speech_content:
        "Hello, unfortunately we aren't able to take your call right now. Please call us back later. Thank you!",
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

export const DEFAULT_EMAIL_DKIM_KEY_SIZE = 1024

export const TAGS_LIMIT = 30
