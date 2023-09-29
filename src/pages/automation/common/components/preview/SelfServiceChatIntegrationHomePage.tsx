import React from 'react'
import classnames from 'classnames'
import {useHistory} from 'react-router-dom'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'
import {
    GORGIAS_CHAT_SSP_TEXTS,
    GORGIAS_CHAT_WIDGET_TEXTS,
    getPrimaryLanguageFromChatConfig,
} from 'config/integrations/gorgias_chat'
import {
    GorgiasChatAvatarSettings,
    GorgiasChatIntegration,
} from 'models/integration/types'

import {
    AddIcon,
    BoxIcon,
    ChevronRightIcon,
    PlaneIcon,
} from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationPreview/icon-utils'
import Conversation from 'gorgias-design-system/HomepageModules/Conversation/Conversation'
import List from 'gorgias-design-system/List/List'
import ListItem from 'gorgias-design-system/List/ListItem'
import Card from 'gorgias-design-system/Cards/Card'
import ChatMessageInput from 'gorgias-design-system/Input/ChatMessageInput'
import ConversationAvatars from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationPreview/ConversationAvatars'
import css from './SelfServiceChatIntegrationHomePage.less'
import {useSelfServicePreviewContext} from './SelfServicePreviewContext'
import useWorkflowsEntrypoints from './hooks/useWorkflowsEntrypoints'

type Props = {
    integration: GorgiasChatIntegration
}

const SelfServiceChatIntegrationHomePage = ({integration}: Props) => {
    const history = useHistory()
    const {
        selfServiceConfiguration,
        hoveredQuickResponseId,
        hoveredOrderManagementFlow,
        isArticleRecommendationEnabled,
    } = useSelfServicePreviewContext()

    const language = getPrimaryLanguageFromChatConfig(integration.meta)

    const workflowsEntrypoints = useWorkflowsEntrypoints(language)

    const flipOrderOfQuickResponsesAndFlows =
        useFlags()[FeatureFlagKey.ChatFlipOrderOfQuickResponsesAndFlows]

    const sspTexts = GORGIAS_CHAT_SSP_TEXTS[language]
    const translatedTexts = GORGIAS_CHAT_WIDGET_TEXTS[language]

    const quickResponses =
        selfServiceConfiguration?.quick_response_policies.filter(
            (quickResponse) => !quickResponse.deactivated_datetime
        ) ?? []
    const canTrackOrders = selfServiceConfiguration?.track_order_policy.enabled
    const canManageOrders =
        canTrackOrders ||
        selfServiceConfiguration?.report_issue_policy.enabled ||
        selfServiceConfiguration?.cancel_order_policy.enabled ||
        selfServiceConfiguration?.return_order_policy.enabled
    const isInitialEntry = history.length === 1

    let variant = 'collapsed'
    if (
        !quickResponses.length &&
        !canManageOrders &&
        !workflowsEntrypoints.length
    ) {
        variant = 'expanded'
    }

    const avatar = {
        companyLogoUrl: integration.decoration.avatar?.company_logo_url,
        imageType: integration.decoration.avatar?.image_type,
        nameType: integration.decoration.avatar?.name_type,
    }

    const SelfServiceConversation = () => {
        if (variant === 'expanded') {
            return (
                <Conversation
                    avatar={
                        <ConversationAvatars
                            avatar={avatar as GorgiasChatAvatarSettings}
                            chatTitle={integration.name}
                        />
                    }
                    footer={
                        <ChatMessageInput
                            aria-label={'Gorgias message input'}
                            placeholder={
                                isArticleRecommendationEnabled
                                    ? sspTexts.articleRecommendationInputPlaceholder
                                    : translatedTexts.inputPlaceholder
                            }
                            leadIcon={
                                isArticleRecommendationEnabled ? null : (
                                    <AddIcon />
                                )
                            }
                            leadIconAriaLabel="Add attachment"
                            trailIcon={<PlaneIcon />}
                            trailIconAriaLabel="Send message"
                            readOnly
                            style={
                                isArticleRecommendationEnabled
                                    ? {marginLeft: '10px'}
                                    : {}
                            }
                        />
                    }
                    title={integration.name}
                    variant="expanded"
                />
            )
        }

        return (
            <Conversation
                avatar={
                    <ConversationAvatars
                        avatar={avatar as GorgiasChatAvatarSettings}
                        chatTitle={integration.name}
                    />
                }
                trailIcon={<PlaneIcon />}
                title={integration.name}
                description={sspTexts.sendUsAMessage}
                variant="collapsed"
            />
        )
    }

    const renderWorkflowsEntrypoints = () =>
        workflowsEntrypoints.map((entrypoint) => (
            <ListItem
                key={entrypoint.workflow_id}
                label={entrypoint.label}
                trailIcon={<ChevronRightIcon />}
            />
        ))

    return (
        <div
            className={classnames(css.container, {
                [css.isInitialEntry]: isInitialEntry,
            })}
        >
            <div className={css.contentContainer}>
                {(quickResponses.length > 0 ||
                    workflowsEntrypoints.length > 0) && (
                    <List style={{marginBottom: '20px'}}>
                        {!flipOrderOfQuickResponsesAndFlows &&
                            renderWorkflowsEntrypoints()}
                        {quickResponses.map((quickResponse) => (
                            <ListItem
                                key={quickResponse.id}
                                label={quickResponse.title}
                                trailIcon={<ChevronRightIcon />}
                                className={
                                    quickResponse.id === hoveredQuickResponseId
                                        ? 'active'
                                        : ''
                                }
                            />
                        ))}
                        {flipOrderOfQuickResponsesAndFlows &&
                            renderWorkflowsEntrypoints()}
                    </List>
                )}
                {canManageOrders && (
                    <Card
                        leadIcon={<BoxIcon />}
                        title={
                            canTrackOrders
                                ? sspTexts.trackAndManageMyOrders
                                : sspTexts.manageMyOrders
                        }
                        trailIcon={<ChevronRightIcon />}
                        className={classnames(css.listGroupItemHeading, {
                            [css.isHighlighted]: Boolean(
                                hoveredOrderManagementFlow
                            ),
                        })}
                    />
                )}
                <SelfServiceConversation />
            </div>
        </div>
    )
}

export default SelfServiceChatIntegrationHomePage
