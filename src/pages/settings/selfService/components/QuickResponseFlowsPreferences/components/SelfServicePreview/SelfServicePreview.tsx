import React, {useMemo} from 'react'
import {useRouteMatch} from 'react-router'
import {ListGroup} from 'reactstrap'

import {GORGIAS_CHAT_SSP_TEXTS} from 'config/integrations/gorgias_chat'
import {useConfigurationData} from 'pages/settings/selfService/components/hooks'
import {getIntegrations} from 'state/integrations/selectors'
import GorgiasChatIntegrationPreview from 'pages/integrations/detail/components/gorgias_chat/GorgiasChatIntegrationPreview/ChatIntegrationPreview'
import useAppSelector from 'hooks/useAppSelector'

import css from './SelfServicePreview.less'
import HomePageListGroupItem from './components/HomePageListGroupItem'
import {useChatIntegration} from './hooks'
import {OrderManagementFlow} from './components/OrderManagementFlow'
import {SelfServicePreviewFooter} from './components/SelfServicePreviewFooter'

const SelfServicePreview = () => {
    const {configuration: selfServiceConfiguration} = useConfigurationData()

    const integrations = useAppSelector(getIntegrations)
    const {
        params: {shopName},
    } = useRouteMatch<{
        shopName: string
    }>()

    const {chatIntegration} = useChatIntegration({integrations, shopName})

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
                    <OrderManagementFlow
                        selfServiceConfiguration={selfServiceConfiguration}
                        sspTexts={sspTexts}
                    />
                )}
            </div>
            <SelfServicePreviewFooter
                backgroundColor={chatIntegration.decoration?.main_color}
                sspTexts={sspTexts}
            />
        </GorgiasChatIntegrationPreview>
    )
}

export default SelfServicePreview
