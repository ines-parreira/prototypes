import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import classNames from 'classnames'
import { Link, useParams } from 'react-router-dom'

import { Badge, LoadingSpinner } from '@gorgias/axiom'

import { SegmentEvent } from 'common/segment'
import {
    ARTICLE_RECOMMENDATION_PREDICTION_QUERY_KEY,
    useArticleRecommendationPredictions,
} from 'models/articleRecommendationPrediction/queries'
import { useGetHelpCenter } from 'models/helpCenter/queries'
import AutomateView from 'pages/automate/common/components/AutomateView'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import Alert, { AlertType } from 'pages/common/components/Alert/Alert'
import Button from 'pages/common/components/button/Button'
import LinkButton from 'pages/common/components/button/LinkButton'
import Paywall from 'pages/common/components/Paywall/Paywall'
import ProgressBar from 'pages/common/components/ProgressBar/ProgressBar'
import { useIsAutomateSettings } from 'settings/automate/hooks/useIsAutomateSettings'

import { assetsUrl } from '../../../utils'
import { ARTICLE_RECOMMENDATION } from '../common/components/constants'
import useApplicationsAutomationSettings from '../common/hooks/useApplicationsAutomationSettings'
import { useHelpCenterPublishedArticlesCount } from '../common/hooks/useHelpCenterPublishedArticlesCount'
import { useHistoryTracking } from '../common/hooks/useHistoryTracking'
import useSelfServiceChatChannels from '../common/hooks/useSelfServiceChatChannels'
import { getArticleRecommendationNavItems } from '../common/utils/getArticleRecommendationNavItems'
import Header from './components/Header'
import { StatefulMessageCard as MessageCard } from './components/MessageCard'
import PreviewSection from './components/PreviewSection'
import RecommendationDivisor from './components/RecommendationDivisor'
import RecommendationFilterNoResults from './components/RecommendationFilterNoResults'
import RecommendationFilters, {
    DEFAULT_FEEDBACK_OPTIONS,
    FeedbackOptions,
} from './components/RecommendationFilters'
import RecommendationPagination from './components/RecommendationPagination'
import { RecommendationDisabled } from './components/TrainMyAiAlerts'

import css from './TrainMyAiView.less'

const TrainMyAiView = () => {
    const isAutomateSettings = useIsAutomateSettings()
    const leftColRef = useRef<HTMLDivElement>(null)
    const rightColRef = useRef<HTMLDivElement>(null)

    useHistoryTracking(SegmentEvent.AutomateArticleRecommendationVisited)
    const { shopType, shopName } = useParams<{
        shopType: string
        shopName: string
    }>()

    const { selfServiceConfiguration } = useSelfServiceConfiguration(
        shopType,
        shopName,
    )
    const channels = useSelfServiceChatChannels(shopType, shopName)

    const chatApplicationsIds = useMemo(
        () =>
            channels
                .map((v) => v.value.meta.app_id)
                .filter((value): value is string => Boolean(value)),
        [channels],
    )

    const { applicationsAutomationSettings, isFetchPending } =
        useApplicationsAutomationSettings(chatApplicationsIds)

    const helpCenterId =
        selfServiceConfiguration?.articleRecommendationHelpCenterId

    const {
        data: helpCenterData,
        isInitialLoading: helpCenterInitialLoading,
        isError: helpCenterIsError,
    } = useGetHelpCenter(
        helpCenterId as number,
        {},
        { enabled: typeof helpCenterId === 'number' },
    )

    const isHelpCenterSelfServiceDeleted =
        !!helpCenterData?.deleted_datetime || helpCenterIsError

    const isArticleRecommendationEnabled = useMemo(
        () =>
            chatApplicationsIds.some(
                (chatApplicationsId) =>
                    applicationsAutomationSettings[chatApplicationsId]
                        ?.articleRecommendation?.enabled,
            ) && !!helpCenterId,
        [applicationsAutomationSettings, chatApplicationsIds, helpCenterId],
    )

    const helpCenterArticlesCount =
        useHelpCenterPublishedArticlesCount(helpCenterId)

    const [currentPage, setCurrentPage] = useState(1)
    const queryClient = useQueryClient()

    const [recommendationFilterArticleId, setRecommendationFilterArticleId] =
        useState<number | null>(null)
    const [
        recommendationFilterShowCompleted,
        setRecommendationFilterShowCompleted,
    ] = useState<boolean>(true)
    const [
        recommendationFilterFeedbackOptions,
        setRecommendationFilterFeedbackOptions,
    ] = useState(DEFAULT_FEEDBACK_OPTIONS)

    const {
        data: articleRecommendationsData,
        isInitialLoading: isInitialLoadingArticleRecommndations,
        isFetched: isFetchedArticleRecommendations,
    } = useArticleRecommendationPredictions({
        page: currentPage,
        shopName,
        shopType,
        helpCenterId,
        articleId: recommendationFilterArticleId ?? undefined,
        feedbackOptions: recommendationFilterFeedbackOptions,
        showCompleted: recommendationFilterShowCompleted,
    })

    const handleShowCompletedFilter = useCallback(
        (value: boolean) => setRecommendationFilterShowCompleted(value),
        [],
    )

    const handleArticleFilter = useCallback((articleId: number | null) => {
        setRecommendationFilterArticleId(articleId || null)
    }, [])

    const handleFeedbackFilter = useCallback(
        (feedbackOption: FeedbackOptions) => {
            if (
                recommendationFilterFeedbackOptions.length === 1 &&
                recommendationFilterFeedbackOptions[0] === feedbackOption
            ) {
                return
            }

            setRecommendationFilterFeedbackOptions((options) => {
                const newOptions = options.includes(feedbackOption)
                    ? options.filter((option) => option !== feedbackOption)
                    : options.concat(feedbackOption)
                return newOptions
            })
        },
        [recommendationFilterFeedbackOptions],
    )

    useEffect(() => {
        resetCurrectPagination()
    }, [
        recommendationFilterArticleId,
        recommendationFilterFeedbackOptions,
        recommendationFilterShowCompleted,
    ])
    const isNoRelevantArticleFilter = recommendationFilterArticleId === -1

    const isLoading =
        !selfServiceConfiguration ||
        (isFetchPending && isArticleRecommendationEnabled) ||
        isInitialLoadingArticleRecommndations ||
        helpCenterInitialLoading

    const isHelpCenterEmpty =
        helpCenterArticlesCount === undefined
            ? null
            : helpCenterArticlesCount === 0

    const hasArticleRecommendations = Boolean(
        articleRecommendationsData?.meta?.pagination.totalSize,
    )

    const [selectedRecommendationId, setSelectedRecommendationId] = useState<
        number | null
    >(null)

    const selectedRecommendationData = useMemo(() => {
        if (selectedRecommendationId === null) {
            return null
        }
        const articleRecommendationData =
            articleRecommendationsData?.data?.find(
                (data) => data.id === selectedRecommendationId,
            )

        return articleRecommendationData
    }, [articleRecommendationsData, selectedRecommendationId])

    const isAllFeedbacksProvided =
        articleRecommendationsData?.meta?.completed === true

    const nextUnansweredRecommendationId = useCallback(
        (
            data: typeof articleRecommendationsData,
            selectedArticleId: number | null,
        ) => {
            if (!data || !data.data) {
                return null
            }
            const selectedRecommendationIndex = data.data.findIndex(
                (item) => item.id === selectedArticleId,
            )
            const articlePrediction = data.data.find(
                (item, i) =>
                    item.articleIdFeedback === null &&
                    i > selectedRecommendationIndex,
            )
            return articlePrediction ? articlePrediction.id : null
        },
        [],
    )

    const resetCurrectPagination = () => {
        setCurrentPage(1)
        leftColRef.current?.scrollTo({
            top: 0,
            behavior: 'smooth',
        })
    }

    const handleResetFilters = () => {
        setRecommendationFilterArticleId(null)
        setRecommendationFilterShowCompleted(true)
        setRecommendationFilterFeedbackOptions(DEFAULT_FEEDBACK_OPTIONS)
    }

    const handleConfirmFeedback = useCallback(() => {
        if (selectedRecommendationId === null) return
        const nextRecommendationId = nextUnansweredRecommendationId(
            articleRecommendationsData,
            selectedRecommendationId,
        )

        setSelectedRecommendationId(nextRecommendationId)
        void queryClient.invalidateQueries({
            queryKey: [ARTICLE_RECOMMENDATION_PREDICTION_QUERY_KEY],
            type: 'all',
        })
    }, [
        articleRecommendationsData,
        selectedRecommendationId,
        nextUnansweredRecommendationId,
        queryClient,
    ])

    const hasAppliedFilters =
        typeof recommendationFilterArticleId === 'number' ||
        recommendationFilterFeedbackOptions.length < 3 ||
        recommendationFilterShowCompleted === false

    useEffect(() => {
        if (
            !articleRecommendationsData?.data?.some(
                (item) => item.id === selectedRecommendationId,
            )
        ) {
            setSelectedRecommendationId(null)
        }
    }, [articleRecommendationsData, selectedRecommendationId])

    useEffect(() => {
        rightColRef.current?.scrollTo({
            top: 0,
            behavior: 'auto',
        })
    }, [selectedRecommendationId])

    useEffect(() => {
        if (isAllFeedbacksProvided) {
            setSelectedRecommendationId(null)
        }
    }, [isAllFeedbacksProvided])

    const baseUrl = isAutomateSettings
        ? `/app/settings/article-recommendations/${shopType}/${shopName}`
        : `/app/automation/${shopType}/${shopName}/article-recommendation`

    const shouldShowPaywall =
        !isLoading &&
        !(
            !isHelpCenterSelfServiceDeleted &&
            (isArticleRecommendationEnabled || hasArticleRecommendations)
        )

    return (
        <AutomateView
            title={isAutomateSettings ? undefined : ARTICLE_RECOMMENDATION}
            isLoading={isLoading}
            headerNavbarItems={
                !isAutomateSettings && !isLoading
                    ? getArticleRecommendationNavItems(shopType, shopName)
                    : undefined
            }
            className={classNames(css.newContainer, {
                [css.enabled]:
                    !isHelpCenterSelfServiceDeleted &&
                    (isArticleRecommendationEnabled ||
                        hasArticleRecommendations),
            })}
        >
            {shouldShowPaywall ? (
                <Paywall
                    hideBubble
                    previewImage={assetsUrl('/img/train-my-ai/preview.png')}
                    requiredUpgrade={''}
                    header="Configure Article Recommendation to access AI training"
                    description="Review recommendations and provide feedback to optimize AI performance."
                    customBadge={
                        <Badge className={css.badge}>
                            <span>
                                <i
                                    className={classNames(
                                        'material-icons',
                                        css.AIIcon,
                                    )}
                                >
                                    auto_awesome
                                </i>
                                {' AI POWERED'}
                            </span>
                        </Badge>
                    }
                    customCta={
                        <Button
                            intent="primary"
                            fillStyle="fill"
                            className={css.cta}
                        >
                            <Link
                                to={`${baseUrl}/configuration`}
                                className={css.linkCta}
                            >
                                Set up Article Recommendation
                            </Link>
                        </Button>
                    }
                />
            ) : (
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
                                (hasArticleRecommendations ||
                                    hasAppliedFilters) && (
                                    <div className={css.headerContent}>
                                        <ProgressBar
                                            value={
                                                articleRecommendationsData.meta
                                                    .progress.value
                                            }
                                            maxValue={
                                                articleRecommendationsData.meta
                                                    .progress.maxValue
                                            }
                                            labelType="fraction"
                                        />
                                        {helpCenterId && (
                                            <RecommendationFilters
                                                helpCenterId={helpCenterId}
                                                articleId={
                                                    recommendationFilterArticleId
                                                }
                                                feedbackOptions={
                                                    recommendationFilterFeedbackOptions
                                                }
                                                showCompleted={
                                                    recommendationFilterShowCompleted
                                                }
                                                onHandleArticleChange={
                                                    handleArticleFilter
                                                }
                                                onHandleShowCompletedChange={
                                                    handleShowCompletedFilter
                                                }
                                                onHandleFeedbackOptionChange={
                                                    handleFeedbackFilter
                                                }
                                            />
                                        )}
                                        {hasArticleRecommendations &&
                                            recommendationFilterFeedbackOptions.length ===
                                                1 &&
                                            recommendationFilterFeedbackOptions[0] ===
                                                'helpful' && (
                                                <Alert
                                                    type={AlertType.Info}
                                                    icon
                                                >
                                                    Giving feedback on articles
                                                    with no rating or unhelpful
                                                    ratings improves accuracy
                                                    more than confirming helpful
                                                    ones.
                                                </Alert>
                                            )}
                                        <RecommendationDivisor />
                                    </div>
                                )}
                        </Header>
                        {isFetchedArticleRecommendations &&
                            !hasArticleRecommendations && (
                                <>
                                    {hasAppliedFilters ? (
                                        <RecommendationFilterNoResults
                                            onResetButtonClick={
                                                handleResetFilters
                                            }
                                        />
                                    ) : (
                                        <div
                                            className={classNames(
                                                css.content,
                                                css.empty,
                                                {
                                                    [css.withButton]:
                                                        isHelpCenterEmpty,
                                                },
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
                                                    Add articles to your help
                                                    center
                                                </LinkButton>
                                            ) : (
                                                <a
                                                    href="https://link.gorgias.com/m1k"
                                                    rel="noopener noreferrer"
                                                    target="_blank"
                                                >
                                                    Learn about Article
                                                    Recommendation and AI
                                                    training
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}

                        <div className={css.content}>
                            {isInitialLoadingArticleRecommndations ||
                            typeof helpCenterId !== 'number' ? (
                                <div className={css.spinner}>
                                    <LoadingSpinner size="big" />
                                </div>
                            ) : (
                                articleRecommendationsData?.data &&
                                articleRecommendationsData.data.map(
                                    ({
                                        id,
                                        message,
                                        articleIdFeedback,
                                        articleId,
                                        locale,
                                    }) => {
                                        return (
                                            <MessageCard
                                                articleId={
                                                    articleIdFeedback ||
                                                    articleId
                                                }
                                                helpCenterId={helpCenterId}
                                                locale={locale}
                                                isSelected={
                                                    selectedRecommendationId ===
                                                    id
                                                }
                                                onSelect={() =>
                                                    setSelectedRecommendationId(
                                                        id,
                                                    )
                                                }
                                                message={message}
                                                key={id}
                                                isSuccess={!!articleIdFeedback}
                                            />
                                        )
                                    },
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
                                            setSelectedRecommendationId(null)
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
                                isAllFeedbacksProvided &&
                                !isNoRelevantArticleFilter ? (
                                    <span
                                        role="img"
                                        aria-label="party popper"
                                        className={css.partyPopper}
                                    >
                                        🎉
                                    </span>
                                ) : (
                                    <div
                                        title="Gorgias logo"
                                        className={css.logo}
                                    />
                                )}

                                {hasArticleRecommendations &&
                                    !isNoRelevantArticleFilter && (
                                        <>
                                            {isAllFeedbacksProvided ? (
                                                <div
                                                    className={css.description}
                                                >
                                                    <div className={css.title}>
                                                        Great work!
                                                    </div>
                                                    <div
                                                        className={css.subtitle}
                                                    >
                                                        You’ve provided feedback
                                                        on every Article
                                                        Recommendation.
                                                        <br />
                                                        Check again later for
                                                        more.
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div
                                                        className={
                                                            css.description
                                                        }
                                                    >
                                                        <div
                                                            className={
                                                                css.title
                                                            }
                                                        >
                                                            Provide feedback on
                                                            Article
                                                            Recommendations.
                                                        </div>
                                                        <div
                                                            className={
                                                                css.subtitle
                                                            }
                                                        >
                                                            Start by providing
                                                            feedback for
                                                            articles that could
                                                            deflect the most
                                                            tickets and aim to
                                                            match 25 messages to
                                                            each article for
                                                            best results.
                                                        </div>
                                                    </div>
                                                    <Button
                                                        onClick={() => {
                                                            setSelectedRecommendationId(
                                                                nextUnansweredRecommendationId(
                                                                    articleRecommendationsData,
                                                                    selectedRecommendationId,
                                                                ),
                                                            )
                                                            leftColRef.current?.scrollTo(
                                                                {
                                                                    top: 0,
                                                                    behavior:
                                                                        'smooth',
                                                                },
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
                                helpCenter={helpCenterData!}
                                key={selectedRecommendationId}
                                page={currentPage}
                                recommendations={selectedRecommendationData}
                                onConfirmFeedback={handleConfirmFeedback}
                            />
                        )}
                    </div>
                </>
            )}
        </AutomateView>
    )
}

export default TrainMyAiView
