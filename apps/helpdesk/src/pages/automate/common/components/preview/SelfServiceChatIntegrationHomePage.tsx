import styled from '@emotion/styled'
import classnames from 'classnames'
import { useHistory } from 'react-router-dom'

import {
    getPrimaryLanguageFromChatConfig,
    GORGIAS_CHAT_SSP_TEXTS,
    GORGIAS_CHAT_WIDGET_TEXTS,
} from 'config/integrations/gorgias_chat'
import Card from 'gorgias-design-system/Cards/Card'
import Conversation from 'gorgias-design-system/HomepageModules/Conversation/Conversation'
import ChatMessageInput from 'gorgias-design-system/Input/ChatMessageInput'
import List from 'gorgias-design-system/List/List'
import ListItem from 'gorgias-design-system/List/ListItem'
import type {
    GorgiasChatAvatarSettings,
    GorgiasChatIntegration,
} from 'models/integration/types'
import ConversationAvatars from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationPreview/ConversationAvatars'
import {
    AddIcon,
    BoxIcon,
    ChevronRightIcon,
    PlaneIcon,
} from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationPreview/icon-utils'

import { MAX_ACTIVE_FLOWS } from '../constants'
import useWorkflowsEntrypoints from './hooks/useWorkflowsEntrypoints'
import { useSelfServicePreviewContext } from './SelfServicePreviewContext'

import css from './SelfServiceChatIntegrationHomePage.less'

const StyledCard = styled(Card)`
    padding: 8px 16px 8px 8px;
`

type Props = {
    integration: GorgiasChatIntegration
    disableAnimations?: boolean
}

const SelfServiceChatIntegrationHomePage = ({
    integration,
    disableAnimations,
}: Props) => {
    const history = useHistory()
    const {
        selfServiceConfiguration,
        hoveredOrderManagementFlow,
        isArticleRecommendationEnabled,
    } = useSelfServicePreviewContext()

    const language = getPrimaryLanguageFromChatConfig(integration.meta)

    const workflowsEntrypoints = useWorkflowsEntrypoints(language)

    const sspTexts = GORGIAS_CHAT_SSP_TEXTS[language]
    const translatedTexts = GORGIAS_CHAT_WIDGET_TEXTS[language]

    const canTrackOrders = selfServiceConfiguration?.trackOrderPolicy.enabled
    const canManageOrders =
        canTrackOrders ||
        selfServiceConfiguration?.reportIssuePolicy.enabled ||
        selfServiceConfiguration?.cancelOrderPolicy.enabled ||
        selfServiceConfiguration?.returnOrderPolicy.enabled
    const isInitialEntry = history.length === 1

    let variant = 'collapsed'
    if (!canManageOrders && !workflowsEntrypoints.length) {
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
                                    ? { marginLeft: '10px' }
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

    return (
        <div
            className={classnames(css.container, {
                [css.isInitialEntry]: !disableAnimations && isInitialEntry,
            })}
        >
            <div className={css.contentContainer}>
                {workflowsEntrypoints.length > 0 && (
                    <List>
                        {workflowsEntrypoints
                            .slice(0, MAX_ACTIVE_FLOWS)
                            .map((entrypoint) => (
                                <ListItem
                                    key={entrypoint.workflow_id}
                                    label={entrypoint.label}
                                    trailIcon={<ChevronRightIcon />}
                                />
                            ))}
                    </List>
                )}
                {canManageOrders && (
                    <StyledCard
                        leadIcon={<BoxIcon />}
                        title={
                            canTrackOrders
                                ? sspTexts.trackAndManageMyOrders
                                : sspTexts.manageMyOrders
                        }
                        trailIcon={<ChevronRightIcon />}
                        className={classnames(css.listGroupItemHeading, {
                            [css.isHighlighted]: Boolean(
                                hoveredOrderManagementFlow,
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
