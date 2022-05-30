import React, {useEffect, useState} from 'react'

import {GORGIAS_CHAT_SSP_TEXTS} from 'config/integrations/gorgias_chat'

import {GorgiasChatIntegration} from 'models/integration/types/gorgiasChat'

import Loader from 'pages/common/components/Loader/Loader'
import {useSelfServiceConfigurationById} from 'pages/settings/selfService/hooks/useSelfServiceConfigurationById'

import Segmented, {
    ChangeSegmentedOptionFn,
} from 'pages/common/components/Segmented'

import ArticleRecommendationPreview from './components/ArticleRecommendationPreview'
import SelfServicePreview from './components/SelfServicePreview'

import classes from './FeaturesPreview.less'

const options = [
    {
        value: 'self-service',
        label: 'Self-Service',
    },
    {
        value: 'article-recommendation',
        label: 'Article Recommendation',
    },
]

type FeaturesPreviewProps = {
    integration: GorgiasChatIntegration
    isSelfServiceChecked?: boolean
    isArticleRecommendationChecked?: boolean
}

const FeaturesPreview = ({
    integration,
    isSelfServiceChecked = false,
    isArticleRecommendationChecked = false,
}: FeaturesPreviewProps): JSX.Element => {
    const [currentPreview, setCurrentPreview] = useState('self-service')
    const sspTexts =
        GORGIAS_CHAT_SSP_TEXTS[integration.meta?.language ?? 'en-US']

    const {configuration, isLoading} = useSelfServiceConfigurationById(
        integration.meta?.shop_integration_id ?? null,
        integration.meta?.shop_name ?? null
    )

    const handleChangePreview: ChangeSegmentedOptionFn = (ev, value) => {
        setCurrentPreview(value)
    }

    useEffect(() => {
        setCurrentPreview(
            !isSelfServiceChecked && isArticleRecommendationChecked
                ? 'article-recommendation'
                : 'self-service'
        )
    }, [isSelfServiceChecked, isArticleRecommendationChecked])

    return (
        <div className={classes.container}>
            {isLoading ? (
                <Loader />
            ) : (
                <>
                    <div className={classes.navigation}>
                        <Segmented
                            options={options}
                            value={currentPreview}
                            onChange={handleChangePreview}
                        />
                    </div>
                    {currentPreview === 'self-service' && configuration && (
                        <SelfServicePreview
                            configuration={configuration}
                            integration={integration}
                            isSelfServiceChecked={isSelfServiceChecked}
                            isArticleRecommendationChecked={
                                isArticleRecommendationChecked
                            }
                            sspTexts={sspTexts}
                        />
                    )}
                    {currentPreview === 'article-recommendation' && (
                        <ArticleRecommendationPreview
                            integration={integration}
                        />
                    )}
                </>
            )}
        </div>
    )
}

export default FeaturesPreview
