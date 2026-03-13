import { logEvent, SegmentEvent } from '@repo/logging'
import classNames from 'classnames'
import { Link } from 'react-router-dom'

import { LegacyButton as Button } from '@gorgias/axiom'

import { TicketChannel } from 'business/types/ticket'
import { getLanguagesFromChatConfig } from 'config/integrations/gorgias_chat'
import useAppSelector from 'hooks/useAppSelector'
import useApplicationsAutomationSettings from 'pages/automate/common/hooks/useApplicationsAutomationSettings'
import type { SelfServiceChatChannel } from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import type { ChannelLanguage } from 'pages/automate/common/types'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import { getHasAutomate } from 'state/billing/selectors'

import {
    ARTICLE_RECOMMENDATION,
    MAX_ACTIVE_FLOWS,
    ORDER_MANAGEMENT,
} from '../../../common/components/constants'
import WorkflowsFeatureList from '../../../common/components/WorkflowsFeatureList'
import { useConnectedChannelsViewContext } from '../ConnectedChannelsViewContext'
import AutomateSubscriptionAction from './AutomateSubscriptionAction'
import ConnectedChannelFeatureToggle from './ConnectedChannelFeatureToggle'

import css from './ConnectedChannelAccordionBodyChat.less'

type Props = {
    channel: SelfServiceChatChannel
}

/**
 * @deprecated This component is outdated and not used anymore. Do not add any new usage of this component.
 * @date 2025-10-02
 * @type automate-deprecation
 */
const ConnectedChannelAccordionBodyChat = ({ channel }: Props) => {
    const applicationId = channel.value.meta.app_id!

    const {
        applicationsAutomationSettings,
        handleChatApplicationAutomationSettingsUpdate,
        isUpdatePending,
    } = useApplicationsAutomationSettings([applicationId])
    const {
        articleRecommendationHelpCenterId,
        isHelpCenterEmpty,
        isOrderManagementAvailable,
        articleRecommendationUrl,
        workflowConfigurations: configurations,
        workflowsEntrypoints: allEntrypoints,
    } = useConnectedChannelsViewContext()
    const hasAutomate = useAppSelector(getHasAutomate)

    const applicationAutomationSettings =
        applicationsAutomationSettings[applicationId]

    const { articleRecommendation, orderManagement, workflows } =
        applicationAutomationSettings

    const updateSettings =
        (key: 'articleRecommendation' | 'orderManagement') =>
        (value: boolean) =>
            handleChatApplicationAutomationSettingsUpdate({
                ...applicationAutomationSettings,
                [key]: { enabled: value },
            })

    const renderArticleRecommendationAction = () => {
        if (!hasAutomate) {
            return <AutomateSubscriptionAction />
        }

        if (!articleRecommendationHelpCenterId) {
            return (
                <Link to={articleRecommendationUrl}>
                    <Button fillStyle="ghost" size="small">
                        <ButtonIconLabel
                            icon="warning"
                            className={css.connectHelpCenterWarning}
                        >
                            Select a help center to enable
                        </ButtonIconLabel>
                    </Button>
                </Link>
            )
        }

        if (isHelpCenterEmpty) {
            return (
                <Link
                    to={`/app/settings/help-center/${articleRecommendationHelpCenterId}/articles`}
                >
                    <Button size="small">
                        Add Articles To Your Help Center
                    </Button>
                </Link>
            )
        }
    }

    const channelLanguages = getLanguagesFromChatConfig(
        channel.value.meta,
    ) as ChannelLanguage[]

    return (
        <>
            <WorkflowsFeatureList
                channelType={TicketChannel.Chat}
                channelId={`chat-${applicationId}`}
                integrationId={channel.value.id}
                channelLanguages={channelLanguages}
                entrypoints={workflows.entrypoints || []}
                maxActiveWorkflows={MAX_ACTIVE_FLOWS}
                configurations={configurations}
                allEntrypoints={allEntrypoints}
                limitTooltipMessage={
                    <>
                        You’ve reached the maximum number of Flows to display on
                        this channel.
                    </>
                }
                onChange={(nextEntrypoints) => {
                    logEvent(SegmentEvent.AutomateChannelUpdateFromChannels, {
                        page: 'Channels',
                    })
                    void handleChatApplicationAutomationSettingsUpdate({
                        ...applicationAutomationSettings,
                        workflows: {
                            ...workflows,
                            entrypoints: nextEntrypoints,
                        },
                    })
                }}
            />

            {isOrderManagementAvailable && (
                <ConnectedChannelFeatureToggle
                    name={ORDER_MANAGEMENT}
                    value={orderManagement.enabled}
                    onChange={updateSettings('orderManagement')}
                    disabled={isUpdatePending}
                />
            )}

            <ConnectedChannelFeatureToggle
                name={
                    <span>
                        <i className={classNames('material-icons', css.AIIcon)}>
                            auto_awesome
                        </i>
                        {' ' + ARTICLE_RECOMMENDATION}
                    </span>
                }
                description="Requires an active Help Center with published articles."
                value={
                    !!articleRecommendationHelpCenterId &&
                    articleRecommendation.enabled
                }
                onChange={updateSettings('articleRecommendation')}
                disabled={
                    isUpdatePending ||
                    !articleRecommendationHelpCenterId ||
                    !hasAutomate
                }
                action={renderArticleRecommendationAction()}
            />
        </>
    )
}

export default ConnectedChannelAccordionBodyChat
