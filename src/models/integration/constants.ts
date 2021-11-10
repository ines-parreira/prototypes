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
    Recharge = 'recharge',
    Smile = 'smile',
    Magento2 = 'magento2',
    Zendesk = 'zendesk',
    Yotpo = 'yotpo',
    Klaviyo = 'klaviyo',
    Phone = 'phone',
    Twitter = 'twitter',
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
    IntegrationType.Twitter,
])

export const DEFAULT_VOICE_MESSAGE = {
    voice_message_type: VoiceMessageType.TextToSpeech,
    text_to_speech_content:
        "Hello, unfortunately we aren't able to take your call right now. Please call us back later. Thank you!",
}
