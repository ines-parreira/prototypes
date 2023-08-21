import React from 'react'

import {GORGIAS_CHAT_SSP_TEXTS} from 'config/integrations/gorgias_chat'
import useAppSelector from 'hooks/useAppSelector'
import {getCurrentUser} from 'state/currentUser/selectors'
import MessageContent from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationPreview/MessageContent'
import {GorgiasChatIntegration} from 'models/integration/types'
import {AgentMessage} from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationPreview/AgentMessages'

import css from './SelfServiceChatIntegrationArticleRecommendationPage.less'

type Props = {
    integration: GorgiasChatIntegration
}

const SelfServiceChatIntegrationArticleRecommendationPage = ({
    integration,
}: Props) => {
    const currentUser = useAppSelector(getCurrentUser)

    const language = integration.meta.language || 'en-US'
    const sspTexts = GORGIAS_CHAT_SSP_TEXTS[language]

    const {decoration} = integration

    const agentMessages: AgentMessage[] = [
        {
            content: 'Here’s an article that may help:',
            isHtml: false,
            attachments: [],
        },
        {
            content: '',
            isHtml: true,
            attachments: [
                {
                    title: 'What size should I order?',
                    summary:
                        'Unsure what size will work? Check out our sizing guide located above the sizes offered on each product page...',
                },
            ],
        },
        {
            content: sspTexts.wasThisRelevant,
            isHtml: false,
            attachments: [],
        },
    ]

    return (
        <MessageContent
            className={css.messageContent}
            conversationColor={decoration.conversation_color}
            currentUser={currentUser}
            customerInitialMessages={['What size am I?']}
            agentMessages={agentMessages}
            hideConversationTimestamp
        >
            <div className={css.repliesContainer}>
                {[sspTexts.yesThankYou, sspTexts.noINeedMoreHelp].map(
                    (reply) => (
                        <div
                            key={reply}
                            className={css.reply}
                            style={{
                                color: decoration.main_color,
                                borderColor: decoration.main_color,
                            }}
                        >
                            {reply}
                        </div>
                    )
                )}
            </div>
        </MessageContent>
    )
}

export default SelfServiceChatIntegrationArticleRecommendationPage
