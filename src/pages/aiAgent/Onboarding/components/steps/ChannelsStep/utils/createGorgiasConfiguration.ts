import {
    GORGIAS_CHAT_AUTO_RESPONDER_ENABLED_DEFAULT,
    GORGIAS_CHAT_AUTO_RESPONDER_REPLY_DYNAMIC,
    GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT,
    GORGIAS_CHAT_OFFLINE_MODE_ENABLED_DATETIME_DEFAULT,
    GORGIAS_CHAT_WIDGET_AVATAR_TYPE_DEFAULT,
    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_DEFAULT,
    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_ENABLED_DEFAULT,
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    GORGIAS_CHAT_WIDGET_LANGUAGES_DEFAULT,
    GORGIAS_CHAT_WIDGET_POSITION_DEFAULT,
    GORGIAS_CHAT_WIDGET_TEXTS,
} from 'config/integrations/gorgias_chat'
import {GORGIAS_CHAT_INTEGRATION_TYPE} from 'constants/integration'
import {
    GorgiasChatAvatarImageType,
    GorgiasChatAvatarNameType,
    GorgiasChatBackgroundColorStyle,
    StoreIntegration,
} from 'models/integration/types'
import {getShopNameFromStoreIntegration} from 'models/selfServiceConfiguration/utils'

export const createChatConfiguration = (
    storeIntegration: StoreIntegration,
    color: string
) => {
    const language = GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT
    return {
        type: GORGIAS_CHAT_INTEGRATION_TYPE,
        name: storeIntegration.name,
        decoration: {
            conversation_color: color,
            main_color: color,
            introduction_text:
                GORGIAS_CHAT_WIDGET_TEXTS[language].introductionText,
            offline_introduction_text:
                GORGIAS_CHAT_WIDGET_TEXTS[language].offlineIntroductionText,
            avatar_type: GORGIAS_CHAT_WIDGET_AVATAR_TYPE_DEFAULT,
            position: GORGIAS_CHAT_WIDGET_POSITION_DEFAULT,
            avatar: {
                image_type: GorgiasChatAvatarImageType.AGENT_PICTURE,
                name_type: GorgiasChatAvatarNameType.AGENT_FIRST_NAME,
            },
            main_font_family: GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT,
            background_color_style: GorgiasChatBackgroundColorStyle.Gradient,
        },
        meta: {
            language: GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
            languages: GORGIAS_CHAT_WIDGET_LANGUAGES_DEFAULT,
            shop_name: getShopNameFromStoreIntegration(storeIntegration),
            shop_type: storeIntegration.type,
            shop_integration_id: storeIntegration.id,
            preferences: {
                email_capture_enabled:
                    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_ENABLED_DEFAULT,
                email_capture_enforcement:
                    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_DEFAULT,
                auto_responder: {
                    enabled: GORGIAS_CHAT_AUTO_RESPONDER_ENABLED_DEFAULT,
                    reply: GORGIAS_CHAT_AUTO_RESPONDER_REPLY_DYNAMIC,
                },
                offline_mode_enabled_datetime:
                    GORGIAS_CHAT_OFFLINE_MODE_ENABLED_DATETIME_DEFAULT,
            },
        },
    }
}
