import {fromJS} from 'immutable'

import {GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT} from 'config/integrations/gorgias_chat'

import {User, UserSettingType} from 'config/types/user'
import {ADMIN_ROLE} from 'config/user'
import {DateFormatType, TimeFormatType} from 'constants/datetime'
import {
    GorgiasChatAvatarImageType,
    GorgiasChatAvatarNameType,
} from 'models/integration/types'

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
    role: {name: ADMIN_ROLE},
    updated_datetime: '2016-12-22T19:36:12.489432+00:00',
    has_2fa_enabled: false,
}

export const chatPreviewSettings = {
    name: 'My ecommerce chat',
    mainFontFamily: GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT,
    isOnline: true,
    renderFooter: false,
    hideButton: true,
    showBackground: false,
    mainColor: '#222222',
    background:
        'linear-gradient(180deg, #DDD 0.03%, #EEE 11.9%, #F9F9F9 99.97%)',
    children: null,
    avatar: {
        imageType: GorgiasChatAvatarImageType.AGENT_PICTURE,
        nameType: GorgiasChatAvatarNameType.AGENT_FIRST_NAME,
    },
    displayBotLabel: true,
    useMainColorOutsideBusinessHours: false,
}

export const agentChatConversationSettings = {
    conversationColor: '#222222',
    avatar: {
        imageType: GorgiasChatAvatarImageType.AGENT_PICTURE,
        nameType: GorgiasChatAvatarNameType.AGENT_FIRST_NAME,
    },
    user: fromJS({
        ...chatUserConfiguration,
        name: 'AI Agent',
        meta: {
            profile_picture_url:
                'data:image/png;base64,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',
        },
    }),
    messages: [
        {
            content:
                'Hi, I’m after a long dress for everyday wear, something comfortable and cute.',
            isHtml: false,
            fromAgent: false,
            attachments: [],
        },
        {
            content:
                'Hi 👋  Our sizes are made for all shapes and body types. Check out this standard size chart for a measurement guide and international conversion.',
            isHtml: true,
            fromAgent: true,
            attachments: [],
        },
        {
            content: 'Was this helpful?',
            isHtml: true,
            fromAgent: true,
            attachments: [],
        },
        {
            content: 'Yes!',
            isHtml: false,
            fromAgent: false,
            attachments: [],
        },
        {
            content: 'Thanks for your help!',
            isHtml: false,
            fromAgent: false,
            attachments: [],
        },
        {
            content: 'You are welcome!',
            isHtml: true,
            fromAgent: true,
            attachments: [],
        },
    ],
}
