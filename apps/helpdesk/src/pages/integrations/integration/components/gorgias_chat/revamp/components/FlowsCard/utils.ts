import { TicketChannel } from 'business/types/ticket'
import { getLanguagesFromChatConfig } from 'config/integrations/gorgias_chat'
import type { SelfServiceChannel } from 'pages/automate/common/hooks/useSelfServiceChannels'
import type { ChannelLanguage } from 'pages/automate/common/types'

export const getChannelLanguages = (
    channel: SelfServiceChannel,
): ChannelLanguage[] => {
    switch (channel.type) {
        case TicketChannel.Chat:
            return getLanguagesFromChatConfig(
                channel.value.meta,
            ) as ChannelLanguage[]
        case TicketChannel.HelpCenter:
            return channel.value.supported_locales
        case TicketChannel.ContactForm:
            return [channel.value.default_locale]
    }
    return []
}
