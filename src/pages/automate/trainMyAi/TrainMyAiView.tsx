import React, {useMemo, useState, useRef, useCallback, useEffect} from 'react'
import {useParams} from 'react-router-dom'
import classNames from 'classnames'

import Button from 'pages/common/components/button/Button'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import Loader from 'pages/common/components/Loader/Loader'
import AutomateView from 'pages/automate/common/components/AutomateView'
import {useArticleRecommendationPredictions} from 'models/articleRecommendationPrediction/queries'
import {SegmentEvent} from 'common/segment'
import LinkButton from 'pages/common/components/button/LinkButton'
import ProgressBar from 'pages/common/components/ProgressBar/ProgressBar'
import {useGetHelpCenter} from 'models/helpCenter/queries'

import {TRAIN_MY_AI} from '../common/components/constants'
import {useHistoryTracking} from '../common/hooks/useHistoryTracking'
import useApplicationsAutomationSettings from '../common/hooks/useApplicationsAutomationSettings'
import useSelfServiceChatChannels from '../common/hooks/useSelfServiceChatChannels'
import {useHelpCenterPublishedArticlesCount} from '../common/hooks/useHelpCenterPublishedArticlesCount'
import gorgiasLogo from '../../../assets/img/gorgias-logo.svg'
import RecommendationDivisor from './components/RecommendationDivisor'
import {StatefulMessageCard as MessageCard} from './components/MessageCard'
import Header from './components/Header'
import ArticleRecommendationDisabled from './components/ArticleRecommendationDisabled'
import RecommendationPagination from './components/RecommendationPagination'
import PreviewSection from './components/PreviewSection'
import css from './TrainMyAiView.less'
import {RecommendationDisabled} from './components/TrainMyAiAlerts'

const TrainMyAiView = () => {
    const leftColRef = useRef<HTMLDivElement>(null)
    const rightColRef = useRef<HTMLDivElement>(null)

    useHistoryTracking(SegmentEvent.AutomateArticleRecommendationVisited)
    const {shopType, shopName} = useParams<{
        shopType: string
        shopName: string
    }>()

    const {selfServiceConfiguration} = useSelfServiceConfiguration(
        shopType,
        shopName
    )
    const channels = useSelfServiceChatChannels(shopType, shopName)

    const chatApplicationsIds = useMemo(
        () =>
            channels
                .map((v) => v.value.meta.app_id)
                .filter((value): value is string => Boolean(value)),
        [channels]
    )

    const {applicationsAutomationSettings, isFetchPending} =
        useApplicationsAutomationSettings(chatApplicationsIds)

    const helpCenterId =
        selfServiceConfiguration?.article_recommendation_help_center_id

    const {
        data: helpCenterData,
        isInitialLoading: helpCenterInitialLoading,
        isError: helpCenterIsError,
    } = useGetHelpCenter(
        helpCenterId as number,
        {},
        {enabled: typeof helpCenterId === 'number'}
    )

    const isHelpCenterSelfServiceDeleted =
        !!helpCenterData?.deleted_datetime || helpCenterIsError

    const isArticleRecommendationEnabled = useMemo(
        () =>
            chatApplicationsIds.some(
                (chatApplicationsId) =>
                    applicationsAutomationSettings[chatApplicationsId]
                        ?.articleRecommendation?.enabled
            ) && !!helpCenterId,
        [applicationsAutomationSettings, chatApplicationsIds, helpCenterId]
    )

    const helpCenterArticlesCount =
        useHelpCenterPublishedArticlesCount(helpCenterId)

    const [currentPage, setCurrentPage] = useState(1)
    const {
        data: articleRecommendationsData,
        isInitialLoading: isInitialLoadingArticleRecommndations,
        isFetched: isFetchedArticleRecommendations,
    } = useArticleRecommendationPredictions({
        page: currentPage,
        shopName,
        shopType,
        helpCenterId,
    })

    const isLoading =
        !selfServiceConfiguration ||
        isFetchPending ||
        isInitialLoadingArticleRecommndations ||
        helpCenterInitialLoading

    const isHelpCenterEmpty =
        helpCenterArticlesCount === undefined
            ? null
            : helpCenterArticlesCount === 0

    const hasArticleRecommendations = Boolean(
        articleRecommendationsData?.meta?.pagination.totalSize
    )

    const [selectedRecommendationIndex, setSelectedRecommendationIndex] =
        useState<number | null>(null)

    const selectedRecommendationData = useMemo(() => {
        if (selectedRecommendationIndex === null) {
            return null
        }
        const articleRecommendationData =
            articleRecommendationsData?.data?.[selectedRecommendationIndex]

        return articleRecommendationData
    }, [articleRecommendationsData, selectedRecommendationIndex])

    const isAllFeedbacksProvided =
        typeof articleRecommendationsData?.meta?.pagination.totalSize ===
            'number' &&
        typeof articleRecommendationsData?.meta?.totalLabeledArticles ===
            'number' &&
        articleRecommendationsData.meta.pagination.totalSize ===
            articleRecommendationsData.meta.totalLabeledArticles

    const nextUnansweredRecommendationIndex = useCallback(
        (data: typeof articleRecommendationsData, startFrom = -1) => {
            if (!data || !data.data) {
                return null
            }
            const index = data.data.findIndex(
                (item, i) => item.articleIdFeedback === null && i > startFrom
            )

            return typeof index === 'number' && index >= 0 ? index : null
        },
        []
    )

    const handleConfirmFeedback = useCallback(() => {
        if (selectedRecommendationIndex === null) return
        const nextIndex = nextUnansweredRecommendationIndex(
            articleRecommendationsData,
            selectedRecommendationIndex
        )

        setSelectedRecommendationIndex(nextIndex)
    }, [
        articleRecommendationsData,
        selectedRecommendationIndex,
        nextUnansweredRecommendationIndex,
    ])

    useEffect(() => {
        rightColRef.current?.scrollTo({
            top: 0,
            behavior: 'auto',
        })
    }, [selectedRecommendationIndex])

    useEffect(() => {
        if (isAllFeedbacksProvided) {
            setSelectedRecommendationIndex(null)
        }
    }, [isAllFeedbacksProvided])

    return (
        <AutomateView
            title={TRAIN_MY_AI}
            isLoading={isLoading}
            className={classNames(css.container, {
                [css.enabled]:
                    !isHelpCenterSelfServiceDeleted &&
                    (isArticleRecommendationEnabled ||
                        hasArticleRecommendations),
            })}
        >
            {!isHelpCenterSelfServiceDeleted &&
            (isArticleRecommendationEnabled || hasArticleRecommendations) ? (
                <>
                    <div ref={leftColRef} className={css.leftCol}>
                        <Header
                            alert={
                                !isArticleRecommendationEnabled ? (
                                    <RecommendationDisabled
                                        link={`/app/automation/${shopType}/${shopName}/article-recommendation`}
                                    />
                                ) : undefined
                            }
                        >
                            {articleRecommendationsData?.meta &&
                                hasArticleRecommendations && (
                                    <div className={css.headerContent}>
                                        <ProgressBar
                                            value={
                                                articleRecommendationsData.meta
                                                    .totalLabeledArticles
                                            }
                                            maxValue={Math.min(
                                                articleRecommendationsData.meta
                                                    .pagination.totalSize,
                                                25 *
                                                    articleRecommendationsData
                                                        .meta
                                                        .totalDistinctArticles
                                            )}
                                            labelType="fraction"
                                        />
                                        <RecommendationDivisor />
                                    </div>
                                )}
                        </Header>
                        {isFetchedArticleRecommendations &&
                            !hasArticleRecommendations && (
                                <div
                                    className={classNames(
                                        css.content,
                                        css.empty,
                                        {
                                            [css.withButton]: isHelpCenterEmpty,
                                        }
                                    )}
                                >
                                    <div className={css.description}>
                                        {isHelpCenterEmpty
                                            ? `There are no articles published in ${shopName} Help Center.`
                                            : 'No recommendations have been sent yet'}
                                    </div>
                                    {typeof helpCenterId === 'number' &&
                                    isHelpCenterEmpty ? (
                                        <LinkButton
                                            target=""
                                            href={`/app/settings/help-center/${helpCenterId}/articles`}
                                        >
                                            Add articles to your help center
                                        </LinkButton>
                                    ) : (
                                        <a
                                            href="https://link.gorgias.com/m1k"
                                            rel="noopener noreferrer"
                                            target="_blank"
                                        >
                                            Learn about Article Recommendation
                                            and AI training
                                        </a>
                                    )}
                                </div>
                            )}

                        <div className={css.content}>
                            {isInitialLoadingArticleRecommndations ||
                            typeof helpCenterId !== 'number' ? (
                                <Loader />
                            ) : (
                                articleRecommendationsData?.data &&
                                articleRecommendationsData.data.map(
                                    (
                                        {
                                            id,
                                            message,
                                            articleIdFeedback,
                                            articleId,
                                            locale,
                                        },
                                        index
                                    ) => {
                                        return (
                                            <MessageCard
                                                articleId={
                                                    articleIdFeedback ||
                                                    articleId
                                                }
                                                helpCenterId={helpCenterId}
                                                locale={locale}
                                                isSelected={
                                                    selectedRecommendationIndex ===
                                                    index
                                                }
                                                onSelect={() =>
                                                    setSelectedRecommendationIndex(
                                                        index
                                                    )
                                                }
                                                message={message}
                                                key={id}
                                                isSuccess={!!articleIdFeedback}
                                            />
                                        )
                                    }
                                )
                            )}
                            {isFetchedArticleRecommendations &&
                                hasArticleRecommendations && (
                                    <RecommendationPagination
                                        page={
                                            articleRecommendationsData?.meta
                                                ?.pagination.currentPage
                                        }
                                        count={
                                            articleRecommendationsData?.meta
                                                ?.pagination.totalPages
                                        }
                                        onChange={(page) => {
                                            setCurrentPage(page)
                                            setSelectedRecommendationIndex(null)
                                            leftColRef.current?.scrollTo({
                                                top: 0,
                                                behavior: 'smooth',
                                            })
                                        }}
                                    />
                                )}
                        </div>
                    </div>
                    <div
                        ref={rightColRef}
                        className={classNames(css.rightCol, {
                            [css.empty]: !selectedRecommendationData,
                        })}
                    >
                        {!selectedRecommendationData ? (
                            <div className={css.container}>
                                {hasArticleRecommendations &&
                                isAllFeedbacksProvided ? (
                                    <span
                                        role="img"
                                        aria-label="party popper"
                                        className={css.partyPopper}
                                    >
                                        🎉
                                    </span>
                                ) : (
                                    <img src={gorgiasLogo} alt="Gorgias" />
                                )}

                                {hasArticleRecommendations && (
                                    <>
                                        {isAllFeedbacksProvided ? (
                                            <div className={css.description}>
                                                <div className={css.title}>
                                                    Great work!
                                                </div>
                                                <div className={css.subtitle}>
                                                    You’ve provided feedback on
                                                    every Article
                                                    Recommendation.
                                                    <br />
                                                    Check again later for more.
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div
                                                    className={css.description}
                                                >
                                                    <div className={css.title}>
                                                        Provide feedback on
                                                        Article Recommendations.
                                                    </div>
                                                    <div
                                                        className={css.subtitle}
                                                    >
                                                        Start by providing
                                                        feedback for articles
                                                        that could deflect the
                                                        most tickets and aim to
                                                        match 25 messages to
                                                        each article for best
                                                        results.
                                                    </div>
                                                </div>
                                                <Button
                                                    onClick={() => {
                                                        setSelectedRecommendationIndex(
                                                            nextUnansweredRecommendationIndex(
                                                                articleRecommendationsData
                                                            )
                                                        )
                                                        leftColRef.current?.scrollTo(
                                                            {
                                                                top: 0,
                                                                behavior:
                                                                    'smooth',
                                                            }
                                                        )
                                                    }}
                                                >
                                                    Provide feedback
                                                </Button>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        ) : (
                            <PreviewSection
                                key={selectedRecommendationIndex}
                                page={currentPage}
                                recommendations={selectedRecommendationData}
                                onConfirmFeedback={handleConfirmFeedback}
                            />
                        )}
                    </div>
                </>
            ) : (
                <ArticleRecommendationDisabled
                    articleRecommendationUrl={`/app/automation/${shopType}/${shopName}/article-recommendation`}
                />
            )}
        </AutomateView>
    )
}

export default TrainMyAiView
