import React, {useMemo, useRef, useState} from 'react'
import {
    Route,
    Switch,
    useRouteMatch,
    useParams,
    useHistory,
} from 'react-router-dom'

import {useFlags} from 'launchdarkly-react-client-sdk'
import Label from 'pages/common/forms/Label/Label'
import {useHelpCenterList} from 'pages/settings/helpCenter/hooks/useHelpCenterList'
import {HELP_CENTER_MAX_CREATION} from 'pages/settings/helpCenter/constants'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import {useHelpCenterPublishedArticlesCount} from 'pages/automate/common/hooks/useHelpCenterPublishedArticlesCount'
import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import AutomateView from 'pages/automate/common/components/AutomateView'
import AutomateViewContent from 'pages/automate/common/components/AutomateViewContent'
import useEffectOnce from 'hooks/useEffectOnce'

import {SegmentEvent, logEvent} from 'common/segment'
import {FeatureFlagKey} from 'config/featureFlags'
import {ARTICLE_RECOMMENDATION} from '../common/components/constants'
import {useHistoryTracking} from '../common/hooks/useHistoryTracking'
import HelpCenterSelect from '../common/components/HelpCenterSelect'
import TrainMyAiViewContainer from '../trainMyAi/TrainMyAiViewContainer'
import {getArticleRecommendationNavItems} from '../common/utils/getArticleRecommendationNavItems'
import {
    ConnectedChannelsInfoAlert,
    EmptyHelpCenterAlert,
    ManyHelpCentersAlert,
    NoHelpCenterAlert,
} from './components/ArticleRecommendationAlerts'
import ArticleRecommendationPreview from './ArticleRecommendationPreview'

import css from './ArticleRecommendationView.less'

const ArticleRecommendationView = () => {
    useHistoryTracking(SegmentEvent.AutomateArticleRecommendationVisited)
    const {shopType, shopName} = useParams<{
        shopType: string
        shopName: string
    }>()

    const {helpCenters, isLoading: isLoadingHelpCenters} = useHelpCenterList({
        per_page: HELP_CENTER_MAX_CREATION,
        type: 'faq',
    })
    const {
        isUpdatePending,
        selfServiceConfiguration,
        handleSelfServiceConfigurationUpdate,
    } = useSelfServiceConfiguration(shopType, shopName)
    const channels = useSelfServiceChatChannels(shopType, shopName)
    const history = useHistory()
    const helpCenterId =
        selfServiceConfiguration?.article_recommendation_help_center_id

    const [dirtyHelpCenterId, setDirtyHelpCenterId] = useState(helpCenterId)
    const previousHelpCenterId = useRef(helpCenterId)

    if (previousHelpCenterId.current !== helpCenterId) {
        previousHelpCenterId.current = helpCenterId

        setDirtyHelpCenterId(helpCenterId)
    }

    const helpCenterArticlesCount =
        useHelpCenterPublishedArticlesCount(dirtyHelpCenterId)

    const helpCenter = useMemo(() => {
        return helpCenters.find(
            (helpCenter) => helpCenter.id === dirtyHelpCenterId
        )
    }, [helpCenters, dirtyHelpCenterId])

    const handleSubmit = () => {
        void handleSelfServiceConfigurationUpdate((draft) => {
            draft.article_recommendation_help_center_id = dirtyHelpCenterId
        })
    }
    const handleCancel = () => {
        setDirtyHelpCenterId(helpCenterId)
    }

    const isHelpCenterDirty = dirtyHelpCenterId !== helpCenterId
    const isHelpCenterEmpty = helpCenterArticlesCount === 0
    const isLoading = !selfServiceConfiguration || isLoadingHelpCenters
    const changeAutomateSettingButtomPosition =
        useFlags()[FeatureFlagKey.ChangeAutomateSettingButtomPosition]

    const isImprovedNavigationEnabled =
        useFlags()[FeatureFlagKey.ImprovedAutomateNavigation]

    useEffectOnce(() => {
        if (!changeAutomateSettingButtomPosition) return
        logEvent(SegmentEvent.AutomateSettingPageViewed, {
            page: 'Article Recommendation',
        })
    })

    const {path} = useRouteMatch()
    const basePath = `/app/automation/:shopType/:shopName/article-recommendation`

    const articleRecommendation = (
        <AutomateView
            title={ARTICLE_RECOMMENDATION}
            isLoading={isLoading}
            {...(isImprovedNavigationEnabled
                ? {
                      headerNavbarItems: getArticleRecommendationNavItems(
                          shopType,
                          shopName
                      ),
                  }
                : {})}
        >
            <AutomateViewContent
                description="Automatically send a Help Center article in response to customer questions in Chat, if a relevant article exists. If a customer requests more help, a ticket will be created for an agent to handle."
                helpUrl="https://docs.gorgias.com/en-US/article-recommendations-in-chat-368447"
                helpTitle={`Learn About ${ARTICLE_RECOMMENDATION} In Chat`}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isSubmittable={isHelpCenterDirty && !isUpdatePending}
                isCancelable={isHelpCenterDirty && !isUpdatePending}
            >
                {helpCenters.length === 0 && <NoHelpCenterAlert />}
                {helpCenters.length > 1 && !isHelpCenterEmpty && (
                    <ManyHelpCentersAlert
                        shopName={shopName}
                        shopType={shopType}
                    />
                )}
                {dirtyHelpCenterId && isHelpCenterEmpty && (
                    <EmptyHelpCenterAlert helpCenterId={dirtyHelpCenterId} />
                )}

                <Label className={css.selectorTitle}>Help Center</Label>
                <HelpCenterSelect
                    helpCenter={helpCenter}
                    setHelpCenterId={setDirtyHelpCenterId}
                    helpCenters={helpCenters}
                />

                {helpCenter && (
                    <ConnectedChannelsInfoAlert
                        shopName={shopName}
                        shopType={shopType}
                    />
                )}
            </AutomateViewContent>

            <ArticleRecommendationPreview
                channels={channels}
                selfServiceConfiguration={selfServiceConfiguration!}
                isHelpCenterSelected={Boolean(helpCenter)}
            />
        </AutomateView>
    )

    if (!isImprovedNavigationEnabled) {
        return articleRecommendation
    }

    const baseUrl = `/app/automation/${shopType}/${shopName}/article-recommendation`
    const hasLegacyTrainMyAIUrl =
        path === '/app/automation/:shopType/:shopName/train-my-ai'

    if (hasLegacyTrainMyAIUrl && isImprovedNavigationEnabled) {
        history.replace(baseUrl)
    }

    return (
        <Switch>
            <Route path={basePath} exact>
                <TrainMyAiViewContainer />
            </Route>
            <Route path={`${basePath}/configuration`} exact>
                {articleRecommendation}
            </Route>
        </Switch>
    )
}

export default ArticleRecommendationView
