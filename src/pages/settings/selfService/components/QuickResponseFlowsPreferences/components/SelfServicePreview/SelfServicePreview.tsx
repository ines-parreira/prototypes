import React, {useMemo} from 'react'
import {useRouteMatch} from 'react-router'
import {ListGroup, Button} from 'reactstrap'

import gorgiasChatSendMessageIcon from 'assets/img/integrations/gorgias-chat-send-message-icon.svg'
import {
    isGorgiasChatIntegration,
    isShopifyIntegration,
    GorgiasChatPositionAlignmentEnum,
} from 'models/integration/types'
import {
    GORGIAS_CHAT_SSP_TEXTS,
    GORGIAS_CHAT_DEFAULT_COLOR,
} from 'config/integrations/gorgias_chat'
import {useConfigurationData} from 'pages/settings/selfService/components/hooks'
import {getIntegrations} from 'state/integrations/selectors'
import GorgiasChatIntegrationPreview from 'pages/integrations/detail/components/gorgias_chat/GorgiasChatIntegrationPreview/ChatIntegrationPreview'
import useAppSelector from 'hooks/useAppSelector'

import css from './SelfServicePreview.less'
import HomePageListGroupItem from './components/HomePageListGroupItem'

const SelfServicePreview = () => {
    const {configuration: selfServiceConfiguration} = useConfigurationData()

    const integrations = useAppSelector(getIntegrations)
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

        const foundIntegration = integrations
            .filter(isGorgiasChatIntegration)
            .find((integration) => {
                return (
                    integration.meta.shop_integration_id ===
                    shopifyIntegration?.id
                )
            })

        if (foundIntegration) {
            return foundIntegration
        }

        return {
            name: 'Chat',
            meta: {
                language: 'en-US',
            },
            decoration: {
                avatar_type: 'team-members',
                avatar_team_picture_url: '',
                introduction_text: 'How can we help?',
                main_color: GORGIAS_CHAT_DEFAULT_COLOR,
                position: {
                    offsetX: 0,
                    offsetY: 0,
                    alignment: GorgiasChatPositionAlignmentEnum.BOTTOM_RIGHT,
                },
            },
        }
    }, [integrations])

    const visibleQuickReplies = useMemo(() => {
        return (
            selfServiceConfiguration?.quick_response_policies.filter(
                (policy) => !policy.deactivated_datetime
            ) || []
        )
    }, [selfServiceConfiguration])

    if (!selfServiceConfiguration) {
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
