import React, {useMemo} from 'react'
import {useParams} from 'react-router-dom'

import {useHelpCenterList} from 'pages/settings/helpCenter/hooks/useHelpCenterList'
import {HELP_CENTER_MAX_CREATION} from 'pages/settings/helpCenter/constants'
import useSelfServiceConfiguration from 'pages/automation/common/hooks/useSelfServiceConfiguration'
import AutomationView from 'pages/automation/common/components/AutomationView'
import AutomationViewContent from 'pages/automation/common/components/AutomationViewContent'

import {SegmentEvent} from 'common/segment'
import {TRAIN_MY_AI} from '../common/components/constants'
import {useHistoryTracking} from '../common/hooks/useHistoryTracking'
import useApplicationsAutomationSettings from '../common/hooks/useApplicationsAutomationSettings'
import useSelfServiceChatChannels from '../common/hooks/useSelfServiceChatChannels'
import {useHelpCenterPublishedArticlesCount} from '../common/hooks/useHelpCenterPublishedArticlesCount'
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

    const {applicationsAutomationSettings} =
        useApplicationsAutomationSettings(chatApplicationsIds)

    const isArticleRecommendationEnabled = useMemo(
        () =>
            Object.values(applicationsAutomationSettings).some(
                (settings) => settings.articleRecommendation.enabled
            ),
        [applicationsAutomationSettings]
    )
    const helpCenterId =
        selfServiceConfiguration?.article_recommendation_help_center_id

    const helpCenterArticlesCount =
        useHelpCenterPublishedArticlesCount(helpCenterId)

    const isLoading = !selfServiceConfiguration || isLoadingHelpCenters

    return (
        <AutomationView
            title={TRAIN_MY_AI}
            isLoading={isLoading}
            className={css.container}
        >
            {isArticleRecommendationEnabled || helpCenterArticlesCount === 0 ? (
                <AutomationViewContent
                    description="Review customer messages, check if recommended articles are helpful, and provide feedback to improve future recommendations."
                    // TODO: add help url
                    helpUrl="https://docs.gorgias.com/en-US/help-center---article-recommendations-in-chat-89341"
                    helpTitle={`How To Train Article Recommendations`}
                >
                    <div />
                </AutomationViewContent>
            ) : (
                <ArticleRecommendationDisabled
                    articleRecommendationUrl={`/app/automation/${shopType}/${shopName}/article-recommendation`}
                />
            )}
        </AutomationView>
    )
}

export default TrainMyAiView
