import {
    getPrimaryLanguageFromChatConfig,
    GORGIAS_CHAT_SSP_TEXTS,
    GORGIAS_CHAT_WIDGET_TEXTS,
} from 'config/integrations/gorgias_chat'
import useAppSelector from 'hooks/useAppSelector'
import type { GorgiasChatIntegration } from 'models/integration/types'
import type { AgentMessage } from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationPreview/AgentMessages'
import MessageContent from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationPreview/MessageContent'
import { getCurrentUser } from 'state/currentUser/selectors'

import css from './SelfServiceChatIntegrationArticleRecommendationPage.less'

type Props = {
    integration: GorgiasChatIntegration
}

const SelfServiceChatIntegrationArticleRecommendationPage = ({
    integration,
}: Props) => {
    const currentUser = useAppSelector(getCurrentUser)

    const language = getPrimaryLanguageFromChatConfig(integration.meta)
    const sspTexts = GORGIAS_CHAT_SSP_TEXTS[language]
    const widgetTranslatedTexts = GORGIAS_CHAT_WIDGET_TEXTS[language]

    const { decoration } = integration

    const agentMessages: AgentMessage[] = [
        {
            content:
                widgetTranslatedTexts.previewArticleRecommendationAgentInitialMessage,
            isHtml: false,
            attachments: [],
        },
        {
            content: '',
            isHtml: true,
            attachments: [
                {
                    title: widgetTranslatedTexts.previewArticleRecommendationArticleTitle,
                    summary:
                        widgetTranslatedTexts.previewArticleRecommendationArticleSummary,
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
            customerInitialMessages={[
                widgetTranslatedTexts.previewArticleRecommendationCustomerInitialMessage,
            ]}
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
                    ),
                )}
            </div>
        </MessageContent>
    )
}

export default SelfServiceChatIntegrationArticleRecommendationPage
