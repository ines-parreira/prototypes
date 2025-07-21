import {
    Integration,
    IntegrationType,
    isAppIntegration,
} from 'models/integration/types'

export const isEmailChannel = (channel: Integration) => {
    return [
        IntegrationType.Email,
        IntegrationType.Gmail,
        IntegrationType.Outlook,
    ].includes(channel.type)
}
export const isChatChannel = (channel: Integration) => {
    return channel.type === IntegrationType.GorgiasChat
}

export const isVoiceChannel = (channel: Integration) => {
    return [IntegrationType.Phone, IntegrationType.Aircall].includes(
        channel.type,
    )
}

export const isSmsChannel = (channel: Integration) => {
    return channel.type === IntegrationType.Sms
}

export const isContactFormChannel = (channel: Integration) => {
    return (
        isAppIntegration(channel) &&
        channel.meta.address?.includes('contact-form')
    )
}

export const isHelpCenterChannel = (channel: Integration) => {
    return (
        isAppIntegration(channel) &&
        channel.meta.address?.includes('help-center')
    )
}

export const isWhatsAppChannel = (channel: Integration) => {
    return channel.type === IntegrationType.WhatsApp
}
export const isFacebookChannel = (channel: Integration) => {
    return channel.type === IntegrationType.Facebook
}

export const isTikTokChannel = (channel: Integration) => {
    return (
        isAppIntegration(channel) &&
        channel.application_id === '653a626236234a4ec85eca67'
    )
}
