import React, {useState} from 'react'
import {Map} from 'immutable'
import classnames from 'classnames'

import useAppSelector from 'hooks/useAppSelector'
import {getCurrentUser} from 'state/currentUser/selectors'

import {
    GorgiasChatAvatarImageType,
    GorgiasChatAvatarNameType,
    GorgiasChatLauncherType,
} from 'models/integration/types'

import {
    GORGIAS_CHAT_DEFAULT_COLOR,
    GORGIAS_CHAT_LIVE_CHAT_OFFLINE,
    GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT,
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    GORGIAS_CHAT_WIDGET_TEXTS,
} from 'config/integrations/gorgias_chat'

import * as ToggleButton from 'pages/common/components/ToggleButton'

import ConversationTimestamp from '../../GorgiasChatIntegrationPreview/ConversationTimestamp'
import ChatIntegrationPreview from '../../GorgiasChatIntegrationPreview/ChatIntegrationPreview'
import ChatIntegrationPreviewContent from '../../GorgiasChatIntegrationPreview/ChatIntegrationPreviewContent'

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
            GORGIAS_CHAT_DEFAULT_COLOR
        )

    const conversationColor: string =
        conversationColorProp ??
        integration.getIn(
            ['decoration', 'conversation_color'],
            GORGIAS_CHAT_DEFAULT_COLOR
        )

    const mainFontFamily: string =
        mainColorProp ??
        integration.getIn(
            ['decoration', 'main_font_family'],
            GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT
        )

    const language: string =
        languageProp ??
        integration.getIn(
            ['meta', 'language'],
            GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT
        )

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
                introductionText={
                    GORGIAS_CHAT_WIDGET_TEXTS[language]?.introductionText
                }
                offlineIntroductionText={
                    GORGIAS_CHAT_WIDGET_TEXTS[language]?.offlineIntroductionText
                }
                showBackground={false}
                isOpen={isOpen}
                launcher={launcher}
                renderFooter={!showOfflineMessages && isOnline}
            >
                {isOnline && !showOfflineMessages ? (
                    <MessageContent
                        className={css.messageContent}
                        avatar={avatar}
                        conversationColor={conversationColor}
                        customerInitialMessages={[
                            'Hi, could you give me an update on my order status?',
                        ]}
                        agentMessages={[
                            {
                                content:
                                    "Hi there, thanks for your patience! Sure, let me check. What's your order number?",
                                isHtml: false,
                                attachments: [],
                            },
                        ]}
                        currentUser={currentUser}
                    />
                ) : (
                    <ChatIntegrationPreviewContent>
                        <ConversationTimestamp />
                        <OfflineMessages
                            mainColor={mainColor}
                            chatTitle={name}
                            language={language}
                        />
                    </ChatIntegrationPreviewContent>
                )}
            </ChatIntegrationPreview>
        </div>
    )
}

export default GorgiasChatCreationWizardPreview
