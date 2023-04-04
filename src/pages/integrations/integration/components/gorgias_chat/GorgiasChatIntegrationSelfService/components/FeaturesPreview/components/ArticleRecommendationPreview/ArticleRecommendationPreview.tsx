import React from 'react'

import {GorgiasChatIntegration} from 'models/integration/types/gorgiasChat'
import ChatIntegrationPreview from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationPreview/ChatIntegrationPreview'

import {GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT} from 'config/integrations/gorgias_chat'
import {SelfServiceOffArticleRecommendationOn} from '../ContentPreviews'

type ArticleRecommendationPreviewProps = {
    integration: GorgiasChatIntegration
}

const ArticleRecommendationPreview = ({
    integration,
}: ArticleRecommendationPreviewProps): JSX.Element => {
    return (
        <ChatIntegrationPreview
            isOnline
            hideButton
            name={integration.name}
            introductionText={integration.decoration?.introduction_text}
            mainColor={integration.decoration?.main_color}
            mainFontFamily={
                integration.decoration?.main_font_family ??
                GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT
            }
            language={integration.meta?.language}
            renderPoweredBy={true}
            renderFooter={false}
        >
            <SelfServiceOffArticleRecommendationOn integration={integration} />
        </ChatIntegrationPreview>
    )
}

export default ArticleRecommendationPreview
