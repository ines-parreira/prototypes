import React, {useCallback} from 'react'
import classNames from 'classnames'

import {GorgiasChatIntegration} from 'models/integration/types/gorgiasChat'
import {SelfServiceConfiguration} from 'models/selfServiceConfiguration/types'

import ChatIntegrationPreview from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationPreview/ChatIntegrationPreview'

import {
    SelfServiceOffArticleRecommendationOff,
    SelfServiceOnArticleRecommendationOff,
    SelfServiceOnArticleRecommendationOn,
} from '../ContentPreviews'

import css from '../../FeaturesPreview.less'

type SelfServicePreviewProps = {
    configuration: SelfServiceConfiguration
    integration: GorgiasChatIntegration
    isSelfServiceChecked?: boolean
    isArticleRecommendationChecked?: boolean
    sspTexts: Record<string, string>
}

const SelfServicePreview = ({
    configuration,
    integration,
    isSelfServiceChecked,
    isArticleRecommendationChecked,
    sspTexts,
}: SelfServicePreviewProps): JSX.Element => {
    const renderChatContent = useCallback(() => {
        const renderInnerContent = () => {
            if (isSelfServiceChecked) {
                if (isArticleRecommendationChecked) {
                    return (
                        <SelfServiceOnArticleRecommendationOn
                            configuration={configuration}
                            sspTexts={sspTexts}
                        />
                    )
                }

                return (
                    <SelfServiceOnArticleRecommendationOff
                        configuration={configuration}
                        integration={integration}
                        sspTexts={sspTexts}
                    />
                )
            }

            return <SelfServiceOffArticleRecommendationOff />
        }

        return (
            <div
                className={classNames({
                    [css.content]: true,
                    [css.whiteBg]: !isSelfServiceChecked,
                })}
            >
                {renderInnerContent()}
            </div>
        )
    }, [
        isSelfServiceChecked,
        isArticleRecommendationChecked,
        configuration,
        integration,
        sspTexts,
    ])

    return (
        <ChatIntegrationPreview
            isOnline
            hideButton
            name={integration.name}
            introductionText={integration.decoration?.introduction_text}
            mainColor={integration.decoration?.main_color}
            language={integration.meta?.language}
            renderPoweredBy={false}
            renderFooter={!isSelfServiceChecked}
        >
            {renderChatContent()}
        </ChatIntegrationPreview>
    )
}

export default SelfServicePreview
