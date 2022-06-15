import React, {useEffect, useState} from 'react'

import {GORGIAS_CHAT_SSP_TEXTS} from 'config/integrations/gorgias_chat'

import {GorgiasChatIntegration} from 'models/integration/types/gorgiasChat'

import Button from 'pages/common/components/button/Button'
import Group from 'pages/common/components/layout/Group'
import Loader from 'pages/common/components/Loader/Loader'
import {useSelfServiceConfigurationById} from 'pages/settings/selfService/hooks/useSelfServiceConfigurationById'

import ArticleRecommendationPreview from './components/ArticleRecommendationPreview'
import SelfServicePreview from './components/SelfServicePreview'

import classes from './FeaturesPreview.less'

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
    const [currentPreview, setCurrentPreview] = useState<
        'article-recommendation' | 'self-service'
    >('self-service')
    const sspTexts =
        GORGIAS_CHAT_SSP_TEXTS[integration.meta?.language ?? 'en-US']

    const {configuration, isLoading} = useSelfServiceConfigurationById(
        integration.meta?.shop_integration_id ?? null,
        integration.meta?.shop_name ?? null
    )

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
                    <Group className="mb-3">
                        <Button
                            intent={
                                currentPreview === 'self-service'
                                    ? 'primary'
                                    : 'secondary'
                            }
                            onClick={() => setCurrentPreview('self-service')}
                        >
                            Self-Service
                        </Button>
                        <Button
                            intent={
                                currentPreview !== 'self-service'
                                    ? 'primary'
                                    : 'secondary'
                            }
                            onClick={() =>
                                setCurrentPreview('article-recommendation')
                            }
                        >
                            Article Recommendation
                        </Button>
                    </Group>
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
