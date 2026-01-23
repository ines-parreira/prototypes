import { DateFormatType, TimeFormatType, UserRole } from '@repo/utils'
import { fromJS } from 'immutable'

import { GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT } from 'config/integrations/gorgias_chat'
import type { User } from 'config/types/user'
import { UserSettingType } from 'config/types/user'
import {
    GorgiasChatAvatarImageType,
    GorgiasChatAvatarNameType,
} from 'models/integration/types'

import avatarImage from './components/AiAgentChatConversation/assets/avatar.png'

export const chatUserConfiguration: User = {
    lastname: 'Plugaru',
    settings: [
        {
            data: {
                show_macros: true,
                macros_default_to_search_popover: true,
                prefill_best_macro: true,
                available: true,
                hide_tips: true,
                forward_calls: false,
                date_format: DateFormatType.en_US,
                time_format: TimeFormatType.AmPm,
            },
            id: 3,
            type: UserSettingType.Preferences,
        },
    ],
    meta: {
        profile_picture_url: 'https://config.gorgias.io/production/picture',
    },
    active: true,
    deactivated_datetime: null,
    name: 'Alex Plugaru',
    bio: 'CTO',
    external_id: '2',
    created_datetime: '2016-12-22T19:36:12.487448+00:00',
    country: 'US',
    language: 'en',
    timezone: 'EST',
    id: 2,
    firstname: 'Alex',
    email: 'alex@gorgias.io',
    role: { name: UserRole.Admin },
    updated_datetime: '2016-12-22T19:36:12.489432+00:00',
    has_2fa_enabled: false,
    client_id: null,
}

export const chatPreviewSettings = {
    name: 'Steve Madden',
    mainFontFamily: GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT,
    isOnline: true,
    renderFooter: false,
    hideButton: true,
    showBackground: false,
    mainColor: 'var(--neutral-grey-6)',
    background:
        'linear-gradient(180deg, var(--neutral-grey-3) 0.03%, var(--neutral-grey-2) 11.9%, var(--navigation-background) 99.97%)',
    children: null,
    avatar: {
        imageType: GorgiasChatAvatarImageType.AGENT_PICTURE,
        nameType: GorgiasChatAvatarNameType.AGENT_FIRST_NAME,
    },
    displayBotLabel: true,
    useMainColorOutsideBusinessHours: false,
}

export const agentChatConversationSettings = {
    conversationColor: 'var(--neutral-grey-6)',
    avatar: {
        imageType: GorgiasChatAvatarImageType.AGENT_PICTURE,
        nameType: GorgiasChatAvatarNameType.AGENT_FIRST_NAME,
    },
    user: fromJS({
        ...chatUserConfiguration,
        name: 'AI agent',
        meta: {
            profile_picture_url: avatarImage,
        },
    }),
}
