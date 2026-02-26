import type React from 'react'
import { useMemo, useState } from 'react'

import classnames from 'classnames'
import type { Map } from 'immutable'

import {
    GORGIAS_CHAT_AUTO_RESPONDER_ENABLED_DEFAULT,
    GORGIAS_CHAT_AUTO_RESPONDER_REPLY_DYNAMIC,
    GORGIAS_CHAT_DEFAULT_COLOR,
    GORGIAS_CHAT_LIVE_CHAT_OFFLINE,
    GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT,
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    GORGIAS_CHAT_WIDGET_TEXTS,
} from 'config/integrations/gorgias_chat'
import useAppSelector from 'hooks/useAppSelector'
import type { GorgiasChatLauncherType } from 'models/integration/types'
import {
    GorgiasChatAvatarImageType,
    GorgiasChatAvatarNameType,
} from 'models/integration/types'
import * as ToggleButton from 'pages/common/components/ToggleButton'
import { getCurrentUser } from 'state/currentUser/selectors'

import ChatIntegrationPreview from '../../GorgiasChatIntegrationPreview/ChatIntegrationPreview'
import ChatIntegrationPreviewContent from '../../GorgiasChatIntegrationPreview/ChatIntegrationPreviewContent'
import ConversationTimestamp from '../../GorgiasChatIntegrationPreview/ConversationTimestamp'
import MessageContent from '../../GorgiasChatIntegrationPreview/MessageContent'
import OfflineMessages from '../../GorgiasChatIntegrationPreview/OfflineMessages'

import css from './GorgiasChatCreationWizardPreview.less'

const avatar = {
    imageType: GorgiasChatAvatarImageType.AGENT_PICTURE,
    nameType: GorgiasChatAvatarNameType.AGENT_FIRST_NAME,
}

type Props = {
    integration: Map<any, any>
    showStatusToggle?: boolean
    name?: string
    language?: string
    mainColor?: string
    conversationColor?: string
    isOnline?: boolean
    isOpen?: boolean
    launcher?: {
        type: GorgiasChatLauncherType
        label?: string
    }
    showOfflineMessages?: boolean
    isWidgetConversation?: boolean
    showGoBackButton?: boolean
    renderFooter?: boolean
    children?: React.ReactNode
}

const GorgiasChatCreationWizardPreview: React.FC<Props> = ({
    integration,
    showStatusToggle = true,
    name: nameProp,
    language: languageProp,
    mainColor: mainColorProp,
    conversationColor: conversationColorProp,
    isOnline: isOnlineProp,
    isOpen,
    launcher,
    showOfflineMessages: showOfflineMessagesProp,
    isWidgetConversation,
    showGoBackButton,
    renderFooter,
    children,
}) => {
    const currentUser = useAppSelector(getCurrentUser)

    const liveChatAvailability = integration.getIn([
        'meta',
        'preferences',
        'live_chat_availability',
    ])

    const showOfflineMessages =
        showOfflineMessagesProp ??
        liveChatAvailability === GORGIAS_CHAT_LIVE_CHAT_OFFLINE

    const [currentIsOnline, setCurrentIsOnline] = useState(true)

    const isOnline = isOnlineProp ?? currentIsOnline

    const name: string = nameProp ?? integration.get('name', '')

    const mainColor: string =
        mainColorProp ??
        integration.getIn(
            ['decoration', 'main_color'],
            GORGIAS_CHAT_DEFAULT_COLOR,
        )

    const conversationColor: string =
        conversationColorProp ??
        integration.getIn(
            ['decoration', 'conversation_color'],
            GORGIAS_CHAT_DEFAULT_COLOR,
        )

    const mainFontFamily: string =
        mainColorProp ??
        integration.getIn(
            ['decoration', 'main_font_family'],
            GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT,
        )

    const language: string =
        languageProp ??
        integration.getIn(
            ['meta', 'language'],
            GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
        )

    const displayBotLabel: boolean = integration.getIn(
        ['decoration', 'display_bot_label'],
        true,
    )

    const useMainColorOutsideBusinessHours: boolean = integration.getIn(
        ['decoration', 'use_main_color_outside_business_hours'],
        false,
    )

    const widgetTranslatedTexts = GORGIAS_CHAT_WIDGET_TEXTS[language]

    const previewContent = useMemo(() => {
        if (children) {
            return children
        }

        if (isOnline && !showOfflineMessages) {
            return (
                <MessageContent
                    className={css.messageContent}
                    avatar={avatar}
                    conversationColor={conversationColor}
                    customerInitialMessages={[
                        widgetTranslatedTexts?.previewCustomerInitialMessage,
                    ]}
                    agentMessages={[
                        {
                            content:
                                widgetTranslatedTexts?.previewAgentInitialMessage,
                            isHtml: false,
                            attachments: [],
                        },
                    ]}
                    currentUser={currentUser}
                    language={language}
                />
            )
        }

        return (
            <ChatIntegrationPreviewContent>
                <ConversationTimestamp />
                <OfflineMessages
                    mainColor={mainColor}
                    chatTitle={name}
                    language={language}
                />
            </ChatIntegrationPreviewContent>
        )
    }, [
        children,
        conversationColor,
        currentUser,
        isOnline,
        showOfflineMessages,
        language,
        mainColor,
        name,
        widgetTranslatedTexts?.previewCustomerInitialMessage,
        widgetTranslatedTexts?.previewAgentInitialMessage,
    ])

    return (
        <div className={css.wrapper}>
            <div
                className={classnames(css.toggleButtonWrapper, {
                    [css.hideToggleButtonWrapper]: !showStatusToggle,
                })}
            >
                <ToggleButton.Wrapper
                    type={ToggleButton.Type.Label}
                    value={currentIsOnline}
                    onChange={setCurrentIsOnline}
                >
                    <ToggleButton.Option value={true}>
                        During Business Hours
                    </ToggleButton.Option>
                    <ToggleButton.Option value={false}>
                        Outside Business Hours
                    </ToggleButton.Option>
                </ToggleButton.Wrapper>
            </div>

            <ChatIntegrationPreview
                name={name}
                language={language}
                mainColor={mainColor}
                mainFontFamily={mainFontFamily}
                isOnline={isOnline}
                introductionText={widgetTranslatedTexts?.introductionText}
                offlineIntroductionText={
                    widgetTranslatedTexts?.offlineIntroductionText
                }
                showBackground={false}
                isOpen={isOpen}
                launcher={launcher}
                renderFooter={
                    renderFooter === undefined
                        ? !showOfflineMessages && isOnline
                        : renderFooter
                }
                isWidgetConversation={isWidgetConversation}
                showGoBackButton={showGoBackButton}
                autoResponderEnabled={
                    GORGIAS_CHAT_AUTO_RESPONDER_ENABLED_DEFAULT
                }
                autoResponderReply={GORGIAS_CHAT_AUTO_RESPONDER_REPLY_DYNAMIC}
                avatar={avatar}
                displayBotLabel={displayBotLabel}
                useMainColorOutsideBusinessHours={
                    useMainColorOutsideBusinessHours
                }
            >
                {previewContent}
            </ChatIntegrationPreview>
        </div>
    )
}

export default GorgiasChatCreationWizardPreview
