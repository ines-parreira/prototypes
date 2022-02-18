import React, {useMemo} from 'react'
import {useRouteMatch} from 'react-router'
import {useSelector} from 'react-redux'

import {ListGroup, Button} from 'reactstrap'

import gorgiasChatSendMessageIcon from 'assets/img/integrations/gorgias-chat-send-message-icon.svg'
import {
    isGorgiasChatIntegration,
    isShopifyIntegration,
} from '../../../../../../../models/integration/types'
import {GORGIAS_CHAT_SSP_TEXTS} from '../../../../../../../config/integrations/gorgias_chat'

import {useConfigurationData} from '../../../hooks'
import {getIntegrations} from '../../../../../../../state/integrations/selectors'

import GorgiasChatIntegrationPreview from '../../../../../../integrations/detail/components/gorgias_chat/GorgiasChatIntegrationPreview/ChatIntegrationPreview'
import css from './SelfServicePreview.less'
import HomePageListGroupItem from './components/HomePageListGroupItem'

const SelfServicePreview = () => {
    const {configuration: selfServiceConfiguration} = useConfigurationData()

    const integrations = useSelector(getIntegrations)
    const {
        params: {shopName},
    } = useRouteMatch<{
        shopName: string
    }>()

    const chatIntegration = useMemo(() => {
        const shopifyIntegration = integrations
            .filter(isShopifyIntegration)
            .find((integration) => {
                return integration.name === shopName
            })

        const chatIntegration = integrations
            .filter(isGorgiasChatIntegration)
            .find((integration) => {
                return (
                    integration.meta.shop_integration_id ===
                    shopifyIntegration?.id
                )
            })
        return chatIntegration
    }, [integrations])

    const visibleQuickReplies = useMemo(() => {
        return (
            selfServiceConfiguration?.quick_response_policies.filter(
                (policy) => !policy.deactivated_datetime
            ) || []
        )
    }, [selfServiceConfiguration])

    if (!chatIntegration || !selfServiceConfiguration) {
        return null
    }

    const sspTexts =
        GORGIAS_CHAT_SSP_TEXTS[chatIntegration.meta.language || 'en-US']

    const hasOrderManagementFlow =
        selfServiceConfiguration.track_order_policy.enabled ||
        selfServiceConfiguration.cancel_order_policy.enabled ||
        selfServiceConfiguration.report_issue_policy.enabled ||
        selfServiceConfiguration.return_order_policy.enabled

    return (
        <GorgiasChatIntegrationPreview
            name={chatIntegration.name}
            introductionText={chatIntegration.decoration?.introduction_text}
            mainColor={chatIntegration.decoration?.main_color}
            avatarTeamPictureUrl={
                chatIntegration.decoration?.avatar_team_picture_url as string
            }
            avatarType={chatIntegration.decoration?.avatar_type}
            isOnline
            language={chatIntegration.meta.language}
            renderFooter={false}
            renderPoweredBy={false}
            position={chatIntegration.decoration?.position}
        >
            <div className={css.content}>
                {visibleQuickReplies.length > 0 && (
                    <ListGroup className={css.buttons}>
                        <HomePageListGroupItem header>
                            {sspTexts.quickAnswers}
                        </HomePageListGroupItem>
                        {visibleQuickReplies.map((policy) => (
                            <HomePageListGroupItem key={policy.title}>
                                {policy.title}
                            </HomePageListGroupItem>
                        ))}
                    </ListGroup>
                )}

                {hasOrderManagementFlow && (
                    <ListGroup className={css.buttons}>
                        <HomePageListGroupItem header>
                            {sspTexts.manageYourOrders}
                        </HomePageListGroupItem>
                        {selfServiceConfiguration.track_order_policy
                            .enabled && (
                            <HomePageListGroupItem>
                                {sspTexts.trackOrder}
                            </HomePageListGroupItem>
                        )}
                        {selfServiceConfiguration.return_order_policy
                            .enabled && (
                            <HomePageListGroupItem>
                                {sspTexts.returnOrder}
                            </HomePageListGroupItem>
                        )}
                        {selfServiceConfiguration.cancel_order_policy
                            .enabled && (
                            <HomePageListGroupItem>
                                {sspTexts.cancelOrder}
                            </HomePageListGroupItem>
                        )}
                        {selfServiceConfiguration.report_issue_policy
                            .enabled && (
                            <HomePageListGroupItem>
                                {sspTexts.reportIssue}
                            </HomePageListGroupItem>
                        )}
                    </ListGroup>
                )}

                <div className={css.footer}>
                    <span className={css.needHelpText}>
                        {sspTexts.needHelp}
                    </span>
                    <Button
                        color="primary"
                        style={{
                            backgroundColor:
                                chatIntegration.decoration?.main_color,
                        }}
                    >
                        <img
                            className={css.sendMessageIcon}
                            src={gorgiasChatSendMessageIcon}
                            alt="send message icon"
                        />

                        {sspTexts.sendUsAMessage}
                    </Button>
                </div>
            </div>
        </GorgiasChatIntegrationPreview>
    )
}

export default SelfServicePreview
