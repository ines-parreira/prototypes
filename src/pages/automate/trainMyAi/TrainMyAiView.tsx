import React, {useMemo, useState, useRef} from 'react'
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
import {TRAIN_MY_AI} from '../common/components/constants'
import {useHistoryTracking} from '../common/hooks/useHistoryTracking'
import useApplicationsAutomationSettings from '../common/hooks/useApplicationsAutomationSettings'
import useSelfServiceChatChannels from '../common/hooks/useSelfServiceChatChannels'
import {useHelpCenterPublishedArticlesCount} from '../common/hooks/useHelpCenterPublishedArticlesCount'
import gorgiasLogo from '../../../assets/img/gorgias-logo.svg'
import RecommendationDivisor from './components/RecommendationDivisor'
import MessageCard from './components/MessageCard'
import Header from './components/Header'
import ArticleRecommendationDisabled from './components/ArticleRecommendationDisabled'
import RecommendationPagination from './components/RecommendationPagination'
import css from './TrainMyAiView.less'
import {RecommendationDisabled} from './components/TrainMyAiAlerts'

const TrainMyAiView = () => {
    const leftColRef = useRef<HTMLDivElement>(null)

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

    const isArticleRecommendationEnabled = useMemo(
        () =>
            Object.values(applicationsAutomationSettings).some(
                (settings) => settings.articleRecommendation.enabled
            ) && helpCenterId,
        [applicationsAutomationSettings, helpCenterId]
    )

    const helpCenterArticlesCount =
        useHelpCenterPublishedArticlesCount(helpCenterId)

    const [currentPage, setCurrentPage] = useState(1)
    const {
        data: articleRecommndationsData,
        isInitialLoading,
        isFetched,
    } = useArticleRecommendationPredictions({
        page: currentPage,
        shopName,
        shopType,
        helpCenterId,
    })

    const isLoading = !selfServiceConfiguration || isFetchPending

    const isHelpCenterEmpty = !helpCenterArticlesCount

    const hasArticleRecommendations = Boolean(
        articleRecommndationsData?.meta?.pagination.totalSize
    )

    const [selectedRecommendationIndex, setSelectedRecommendationIndex] =
        useState<number | null>(null)

    const selectedRecommendationData = useMemo(() => {
        if (selectedRecommendationIndex === null) {
            return null
        }
        const articleRecommendationData =
            articleRecommndationsData?.data?.[selectedRecommendationIndex]

        return articleRecommendationData
    }, [articleRecommndationsData, selectedRecommendationIndex])

    return (
        <AutomateView
            title={TRAIN_MY_AI}
            isLoading={isLoading}
            className={classNames(css.container, {
                [css.enabled]:
                    isArticleRecommendationEnabled || hasArticleRecommendations,
            })}
        >
            {isArticleRecommendationEnabled || hasArticleRecommendations ? (
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
                            {articleRecommndationsData?.meta && (
                                <div className={css.headerContent}>
                                    <ProgressBar
                                        value={
                                            articleRecommndationsData.meta
                                                .totalLabeledArticles
                                        }
                                        maxValue={Math.min(
                                            articleRecommndationsData.meta
                                                .pagination.totalSize,
                                            25 *
                                                articleRecommndationsData.meta
                                                    .totalDistinctArticles
                                        )}
                                        labelType="fraction"
                                    />
                                    <RecommendationDivisor />
                                </div>
                            )}
                        </Header>
                        {isFetched && !hasArticleRecommendations && (
                            <div
                                className={classNames(css.content, css.empty, {
                                    [css.withButton]: isHelpCenterEmpty,
                                })}
                            >
                                <div className={css.description}>
                                    {isHelpCenterEmpty
                                        ? `There are no articles published in ${shopName} Help Center.`
                                        : 'No recommendations have been sent yet'}
                                </div>
                                {helpCenterId && isHelpCenterEmpty ? (
                                    <LinkButton
                                        target=""
                                        href={`/app/settings/help-center/${helpCenterId}/articles`}
                                    >
                                        Add articles to your help center
                                    </LinkButton>
                                ) : (
                                    <a
                                        href="https://docs.gorgias.com/en-US/help-center---article-recommendations-in-chat-89341"
                                        rel="noopener noreferrer"
                                        target="_blank"
                                    >
                                        Learn about Article Recommendation and
                                        AI training
                                    </a>
                                )}
                            </div>
                        )}

                        <div className={css.content}>
                            {isInitialLoading ? (
                                <Loader />
                            ) : (
                                articleRecommndationsData?.data &&
                                articleRecommndationsData.data.map(
                                    (
                                        {id, message, articleIdFeedback},
                                        index
                                    ) => {
                                        return (
                                            <MessageCard
                                                articleTitle={''}
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
                            {isFetched && hasArticleRecommendations && (
                                <RecommendationPagination
                                    page={
                                        articleRecommndationsData?.meta
                                            ?.pagination.currentPage
                                    }
                                    count={
                                        articleRecommndationsData?.meta
                                            ?.pagination.totalPages
                                    }
                                    onChange={(page) => {
                                        setCurrentPage(page)
                                        setSelectedRecommendationIndex(null)
                                        leftColRef.current?.scrollTo({
                                            top: 0,
                                            behavior: 'auto',
                                        })
                                    }}
                                />
                            )}
                        </div>
                    </div>
                    <div
                        className={classNames(css.rightCol, {
                            [css.empty]: !selectedRecommendationData,
                        })}
                    >
                        {!selectedRecommendationData && (
                            <div className={css.container}>
                                <img src={gorgiasLogo} alt="Gorgias" />
                                {hasArticleRecommendations && (
                                    <>
                                        <div className={css.description}>
                                            <div className={css.title}>
                                                Provide feedback on Article
                                                Recommendations.
                                            </div>
                                            <div className={css.subtitle}>
                                                Start by providing feedback for
                                                articles that could deflect the
                                                most tickets and aim to match 25
                                                messages to each article for
                                                best results.
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => {
                                                setSelectedRecommendationIndex(
                                                    0
                                                )
                                                leftColRef.current?.scrollTo({
                                                    top: 0,
                                                    behavior: 'auto',
                                                })
                                            }}
                                        >
                                            Provide feedback
                                        </Button>
                                    </>
                                )}
                            </div>
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
