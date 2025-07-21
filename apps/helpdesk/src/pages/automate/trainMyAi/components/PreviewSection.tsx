import React, { useEffect, useMemo, useState } from 'react'

import classNames from 'classnames'

import { LoadingSpinner } from '@gorgias/merchant-ui-kit'

import { useGetHelpCenterArticle } from 'models/helpCenter/queries'
import { HelpCenter } from 'models/helpCenter/types'
import CurrentHelpCenterContext from 'pages/settings/helpCenter/contexts/CurrentHelpCenterContext'
import { EditionManagerContextProvider } from 'pages/settings/helpCenter/providers/EditionManagerContext'
import { Components } from 'rest_api/ssp_api/client.generated'

import useUpdateArticleRecommendationPrediction from '../hooks/useUpdateArticleRecommendationPrediction'
import DeletedArticlePreview from './DeletedArticlePreview'
import NoRelevantArticlePreview from './NoRelevantArticlePreview'
import PreviewArticle from './PreviewArticle'
import PreviewHeader from './PreviewHeader'

import css from './PreviewSection.less'

interface Props {
    recommendations: Components.Schemas.PredictionResponseDataDTO
    helpCenter: HelpCenter
    onConfirmFeedback: () => void
    page: number
}

export default function TrainMyAiPreview({
    recommendations,
    page,
    onConfirmFeedback,
    helpCenter,
}: Props) {
    const [noRelevantArticles, setNoRelevantArticles] = useState(
        recommendations?.articleIdFeedback === -1,
    )

    const [previewArticleId, setPreviewArticleId] = useState<number>(
        recommendations.articleIdFeedback || recommendations.articleId,
    )

    const { mutateAsync } = useUpdateArticleRecommendationPrediction({
        page,
        shopName: recommendations.shopName,
        shopType: recommendations.shopType,
        helpCenterId: recommendations?.helpCenterId,
    })

    const [isFeedbackProvided, setIsFeedbackProvided] = useState(false)

    const {
        data: previewArticleData,
        isInitialLoading: previewArticleDataIsInitialLoading,
    } = useGetHelpCenterArticle(
        previewArticleId,
        recommendations?.helpCenterId,
        recommendations?.locale,
        { enabled: !noRelevantArticles && !!previewArticleId },
    )

    useEffect(() => {
        if (isFeedbackProvided) {
            const timeout = window.setTimeout(onConfirmFeedback, 1500)
            return () => window.clearTimeout(timeout)
        }
    }, [isFeedbackProvided, onConfirmFeedback])

    const onSelectArticle = async (id: number) => {
        setIsFeedbackProvided(true)
        await mutateAsync(
            [
                { id: recommendations.id },
                {
                    data: { articleIdFeedback: id },
                    meta: previewArticleData
                        ? {
                              articleSlugFeedback:
                                  previewArticleData.translation.slug,
                              articleTitleFeedback:
                                  previewArticleData.translation.title,
                          }
                        : undefined,
                },
            ],
            {
                onError: () => setIsFeedbackProvided(false),
            },
        )
    }

    const onChangeArticle = (id: number) => {
        if (id > 0) {
            setPreviewArticleId(id)
            setNoRelevantArticles(false)
        }
        if (id === -1) {
            setNoRelevantArticles(true)
        }
    }

    const articleEditTitle = useMemo(() => {
        if (noRelevantArticles) {
            return 'No relevant articles'
        }
        if (previewArticleData === null) {
            return 'Deleted article'
        }
        return previewArticleData?.translation.title
    }, [noRelevantArticles, previewArticleData])

    return (
        <div
            className={classNames(css.container, {
                [css.loader]: previewArticleDataIsInitialLoading,
            })}
        >
            <PreviewHeader
                articleTitle={articleEditTitle}
                isFeedbackProvided={isFeedbackProvided}
                onSelectArticle={onSelectArticle}
                noRelevantArticles={noRelevantArticles}
                recommendations={recommendations}
                onChange={onChangeArticle}
            />
            <CurrentHelpCenterContext.Provider value={helpCenter}>
                <EditionManagerContextProvider>
                    <div
                        className={classNames(css.preview, {
                            [css.isLoading]: previewArticleDataIsInitialLoading,
                        })}
                    >
                        {noRelevantArticles ? (
                            <NoRelevantArticlePreview
                                helpCenterId={recommendations?.helpCenterId}
                            />
                        ) : previewArticleData === null ? (
                            <DeletedArticlePreview />
                        ) : previewArticleData ? (
                            <PreviewArticle
                                helpCenter={helpCenter}
                                articleData={previewArticleData}
                            />
                        ) : previewArticleDataIsInitialLoading ? (
                            <LoadingSpinner size="big" />
                        ) : null}
                    </div>
                </EditionManagerContextProvider>
            </CurrentHelpCenterContext.Provider>
        </div>
    )
}
