import React, {useMemo} from 'react'
import {useParams} from 'react-router-dom'

import classNames from 'classnames'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import AutomationView from 'pages/automate/common/components/AutomationView'
import {useHelpCenterList} from 'pages/settings/helpCenter/hooks/useHelpCenterList'
import {HELP_CENTER_MAX_CREATION} from 'pages/settings/helpCenter/constants'

import {SegmentEvent} from 'common/segment'
import LinkButton from 'pages/common/components/button/LinkButton'
import ProgressBar from 'pages/common/components/ProgressBar/ProgressBar'
import {TRAIN_MY_AI} from '../common/components/constants'
import {useHistoryTracking} from '../common/hooks/useHistoryTracking'
import useApplicationsAutomationSettings from '../common/hooks/useApplicationsAutomationSettings'
import useSelfServiceChatChannels from '../common/hooks/useSelfServiceChatChannels'
import {useHelpCenterPublishedArticlesCount} from '../common/hooks/useHelpCenterPublishedArticlesCount'
import Header from './components/Header'
import ArticleRecommendationDisabled from './components/ArticleRecommendationDisabled'
import css from './TrainMyAiView.less'

const TrainMyAiView = () => {
    useHistoryTracking(SegmentEvent.AutomateArticleRecommendationVisited)
    const {shopType, shopName} = useParams<{
        shopType: string
        shopName: string
    }>()
    const {isLoading: isLoadingHelpCenters} = useHelpCenterList({
        per_page: HELP_CENTER_MAX_CREATION,
    })
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

    const recommendations = [] // a stub until data is ready

    const isLoading =
        !selfServiceConfiguration || isLoadingHelpCenters || isFetchPending

    const isHelpCenterEmpty = !helpCenterArticlesCount
    return (
        <AutomationView
            title={TRAIN_MY_AI}
            isLoading={isLoading}
            className={classNames(css.container, {
                [css.enabled]:
                    isArticleRecommendationEnabled ||
                    recommendations.length > 0,
            })}
        >
            {isArticleRecommendationEnabled || recommendations.length > 0 ? (
                <>
                    <div className={css.leftCol}>
                        <Header hasAlert={!isArticleRecommendationEnabled}>
                            {recommendations.length > 0 && (
                                <ProgressBar
                                    value={12}
                                    maxValue={50}
                                    labelType="fraction"
                                />
                            )}
                        </Header>
                        {isHelpCenterEmpty && recommendations.length === 0 && (
                            <div
                                className={classNames(
                                    css.content,
                                    css.empty,
                                    css.withButton
                                )}
                            >
                                <div className={css.description}>
                                    There are no articles published in{' '}
                                    {shopName} Help Center.
                                </div>
                                {helpCenterId && (
                                    <LinkButton
                                        target=""
                                        href={`/app/settings/help-center/${helpCenterId}/articles`}
                                    >
                                        Add articles to your help center
                                    </LinkButton>
                                )}
                            </div>
                        )}
                        {!isHelpCenterEmpty && recommendations.length === 0 && (
                            <div className={classNames(css.content, css.empty)}>
                                <div className={css.description}>
                                    No recommendations have been sent yet.
                                </div>
                                <a
                                    href="https://docs.gorgias.com/en-US/help-center---article-recommendations-in-chat-89341"
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    Learn about Article Recommendation and AI
                                    training
                                </a>
                            </div>
                        )}
                        {recommendations.length > 0 && (
                            <div className={css.content}></div>
                        )}
                    </div>
                    <div className={css.rightCol}></div>
                </>
            ) : (
                <ArticleRecommendationDisabled
                    articleRecommendationUrl={`/app/automation/${shopType}/${shopName}/article-recommendation`}
                />
            )}
        </AutomationView>
    )
}

export default TrainMyAiView
