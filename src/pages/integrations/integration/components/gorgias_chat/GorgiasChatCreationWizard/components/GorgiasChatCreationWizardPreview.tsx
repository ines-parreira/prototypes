import React, {useEffect, useState} from 'react'
import {Map} from 'immutable'
import classnames from 'classnames'

import useAppSelector from 'hooks/useAppSelector'
import {getCurrentUser} from 'state/currentUser/selectors'

import {GorgiasChatLauncherType} from 'models/integration/types'

import {
    GORGIAS_CHAT_DEFAULT_COLOR,
    GORGIAS_CHAT_LIVE_CHAT_OFFLINE,
    GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT,
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    GORGIAS_CHAT_WIDGET_TEXTS_DEFAULTS,
} from 'config/integrations/gorgias_chat'

import * as ToggleButton from 'pages/common/components/ToggleButton'

import ConversationTimestamp from '../../GorgiasChatIntegrationPreview/ConversationTimestamp'
import ChatIntegrationPreview from '../../GorgiasChatIntegrationPreview/ChatIntegrationPreview'
import ChatIntegrationPreviewContent from '../../GorgiasChatIntegrationPreview/ChatIntegrationPreviewContent'

import MessageContent from '../../GorgiasChatIntegrationPreview/MessageContent'
import OfflineMessages from '../../GorgiasChatIntegrationPreview/OfflineMessages'

import css from './GorgiasChatCreationWizardPreview.less'

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
}) => {
    const currentUser = useAppSelector(getCurrentUser)

    const liveChatAvailability = integration.getIn([
        'meta',
        'preferences',
        'live_chat_availability',
    ])

    const [currentIsOnline, setCurrentIsOnline] = useState<boolean>(
        liveChatAvailability === GORGIAS_CHAT_LIVE_CHAT_OFFLINE ? false : true
    )

    useEffect(() => {
        setCurrentIsOnline(
            liveChatAvailability === GORGIAS_CHAT_LIVE_CHAT_OFFLINE
                ? false
                : true
        )
    }, [liveChatAvailability])

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

    const language =
        languageProp ??
        integration.getIn(
            ['meta', 'language'],
            GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT
        )

    const introductionText = integration.getIn(
        ['decoration', 'introduction_text'],
        GORGIAS_CHAT_WIDGET_TEXTS_DEFAULTS?.introductionText
    )

    const offlineIntroductionText = integration.getIn(
        ['decoration', 'offline_introduction_text'],
        GORGIAS_CHAT_WIDGET_TEXTS_DEFAULTS?.offlineIntroductionText
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
                introductionText={introductionText}
                offlineIntroductionText={offlineIntroductionText}
                showBackground={false}
                isOpen={isOpen}
                launcher={launcher}
            >
                <ChatIntegrationPreviewContent>
                    {isOnline ? (
                        <MessageContent
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
                        <>
                            <ConversationTimestamp />
                            <OfflineMessages
                                mainColor={mainColor}
                                chatTitle={name}
                            />
                        </>
                    )}
                </ChatIntegrationPreviewContent>
            </ChatIntegrationPreview>
        </div>
    )
}

export default GorgiasChatCreationWizardPreview
