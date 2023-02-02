import React from 'react'
import classnames from 'classnames'

import {
    QuickResponsePolicy,
    SelfServiceConfiguration,
} from 'models/selfServiceConfiguration/types'
import {GorgiasChatIntegration} from 'models/integration/types'
import ChatIntegrationPreview from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationPreview/ChatIntegrationPreview'
import {GORGIAS_CHAT_SSP_TEXTS} from 'config/integrations/gorgias_chat'
import Button from 'pages/common/components/button/Button'
import gorgiasChatSendMessageIcon from 'assets/img/integrations/gorgias-chat-send-message-icon.svg'
import Collapse from 'pages/common/components/Collapse/Collapse'

import css from './SelfServiceChatIntegrationPreview.less'

type Props = {
    integration: GorgiasChatIntegration
    selfServiceConfiguration: SelfServiceConfiguration
    highlightedQuickResponseId?: QuickResponsePolicy['id'] | null
}

const ChevronRightIcon = () => (
    <i className={classnames('material-icons', css.chevronRightIcon)}>
        chevron_right
    </i>
)

const SelfServiceChatIntegrationPreview = ({
    integration,
    selfServiceConfiguration,
    highlightedQuickResponseId,
}: Props) => {
    const {decoration, meta} = integration

    const sspTexts = GORGIAS_CHAT_SSP_TEXTS[meta.language || 'en-US']

    const quickResponses =
        selfServiceConfiguration.quick_response_policies.filter(
            (quickResponse) => !quickResponse.deactivated_datetime
        )
    const canTrackOrders = selfServiceConfiguration.track_order_policy.enabled
    const canManageOrders =
        canTrackOrders ||
        selfServiceConfiguration.report_issue_policy.enabled ||
        selfServiceConfiguration.cancel_order_policy.enabled ||
        selfServiceConfiguration.return_order_policy.enabled

    return (
        <ChatIntegrationPreview
            name={integration.name}
            introductionText={decoration.introduction_text}
            mainColor={decoration.main_color}
            avatarType={decoration.avatar_type}
            avatarTeamPictureUrl={decoration.avatar_team_picture_url}
            isOnline
            language={meta.language}
            renderFooter={false}
            renderPoweredBy={false}
            hideButton
            enableAnimations
            showBackground={false}
        >
            <div className={css.contentContainer}>
                <Collapse isOpen={quickResponses.length > 0} memoizeOnExit>
                    <div className={css.listGroup}>
                        <div className={css.listGroupItemHeading}>
                            {sspTexts.quickResponses}
                        </div>
                        {quickResponses.map((quickResponse) => (
                            <div
                                key={quickResponse.id}
                                className={classnames(css.listGroupItem, {
                                    [css.isHighlighted]:
                                        quickResponse.id ===
                                        highlightedQuickResponseId,
                                })}
                            >
                                {quickResponse.title}
                                <ChevronRightIcon />
                            </div>
                        ))}
                    </div>
                </Collapse>
                {canManageOrders && (
                    <div className={css.listGroup}>
                        <div className={css.listGroupItemHeading}>
                            {canTrackOrders
                                ? sspTexts.trackAndManageMyOrders
                                : sspTexts.manageMyOrders}
                            <ChevronRightIcon />
                        </div>
                    </div>
                )}
            </div>
            <div className={css.footer}>
                {sspTexts.needHelp}
                <Button>
                    <img
                        className={css.sendMessageIcon}
                        src={gorgiasChatSendMessageIcon}
                        alt="send message icon"
                    />
                    {sspTexts.sendUsAMessage}
                </Button>
            </div>
        </ChatIntegrationPreview>
    )
}

export default SelfServiceChatIntegrationPreview
