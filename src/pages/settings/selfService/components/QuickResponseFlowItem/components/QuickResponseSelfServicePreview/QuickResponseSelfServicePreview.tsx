import React, {useState} from 'react'
import {useRouteMatch} from 'react-router'
import {ListGroup, Button, ButtonGroup} from 'reactstrap'
import {ConnectedProps, connect} from 'react-redux'

import {GORGIAS_CHAT_SSP_TEXTS} from 'config/integrations/gorgias_chat'
import {useConfigurationData} from 'pages/settings/selfService/components/hooks'
import {getIntegrations} from 'state/integrations/selectors'
import GorgiasChatIntegrationPreview from 'pages/integrations/detail/components/gorgias_chat/GorgiasChatIntegrationPreview/ChatIntegrationPreview'
import MessageContentPreview from 'pages/integrations/detail/components/gorgias_chat/GorgiasChatIntegrationPreview/MessageContent'
import QuickRepliesPreview from 'pages/integrations/detail/components/gorgias_chat/GorgiasChatIntegrationPreview/QuickReplies'
import useAppSelector from 'hooks/useAppSelector'
import {RootState} from 'state/types'

import HomePageListGroupItem from '../../../QuickResponseFlowsPreferences/components/SelfServicePreview/components/HomePageListGroupItem'
import css from '../../../QuickResponseFlowsPreferences/components/SelfServicePreview/SelfServicePreview.less'
import {useChatIntegration} from '../../../QuickResponseFlowsPreferences/components/SelfServicePreview/hooks'
import {OrderManagementFlow} from '../../../QuickResponseFlowsPreferences/components/SelfServicePreview/components/OrderManagementFlow'
import {SelfServicePreviewFooter} from '../../../QuickResponseFlowsPreferences/components/SelfServicePreview/components/SelfServicePreviewFooter'

type Props = {
    quickResponseTitle: string
    quickResponseResponse: string
}

const QuickResponseSelfServicePreview = ({
    quickResponseTitle,
    quickResponseResponse,
    currentUser,
}: Props & ConnectedProps<typeof connector>) => {
    const {configuration: selfServiceConfiguration} = useConfigurationData()
    const [isLandingPage, setIsLandingPage] = useState(true)

    const integrations = useAppSelector(getIntegrations)
    const {
        params: {shopName},
    } = useRouteMatch<{
        shopName: string
    }>()

    const {chatIntegration} = useChatIntegration({integrations, shopName})

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
        <>
            <ButtonGroup className="mb-3">
                <Button
                    type="button"
                    color={isLandingPage ? 'info' : 'secondary'}
                    onClick={() => setIsLandingPage(true)}
                >
                    Landing Page
                </Button>
                <Button
                    type="button"
                    color={!isLandingPage ? 'info' : 'secondary'}
                    onClick={() => setIsLandingPage(false)}
                >
                    Message Thread
                </Button>
            </ButtonGroup>
            <GorgiasChatIntegrationPreview
                name={chatIntegration.name}
                introductionText={chatIntegration.decoration?.introduction_text}
                mainColor={chatIntegration.decoration?.main_color}
                avatarTeamPictureUrl={
                    chatIntegration.decoration
                        ?.avatar_team_picture_url as string
                }
                avatarType={chatIntegration.decoration?.avatar_type}
                isOnline
                language={chatIntegration.meta.language}
                renderFooter={false}
                renderPoweredBy={!isLandingPage}
                position={chatIntegration.decoration?.position}
                hideButton
            >
                {isLandingPage ? (
                    <div className={css.content}>
                        <ListGroup className={css.buttons}>
                            <HomePageListGroupItem header>
                                {sspTexts.quickAnswers}
                            </HomePageListGroupItem>
                            <HomePageListGroupItem>
                                {quickResponseTitle}
                            </HomePageListGroupItem>
                        </ListGroup>

                        {hasOrderManagementFlow && (
                            <OrderManagementFlow
                                selfServiceConfiguration={
                                    selfServiceConfiguration
                                }
                                sspTexts={sspTexts}
                            />
                        )}

                        <SelfServicePreviewFooter
                            backgroundColor={
                                chatIntegration.decoration?.main_color
                            }
                            sspTexts={sspTexts}
                        />
                    </div>
                ) : (
                    <>
                        <MessageContentPreview
                            conversationColor={
                                chatIntegration.decoration?.main_color
                            }
                            currentUser={currentUser}
                            customerInitialMessages={[quickResponseTitle]}
                            agentMessages={[
                                {content: quickResponseResponse, isHtml: true},
                                {content: 'Was this helpful?', isHtml: false},
                            ]}
                            hideMessageTimestamp
                        />

                        <QuickRepliesPreview
                            quickReplies={[
                                'Yes, thank you',
                                'No, I need more help',
                            ]}
                            mainColor={chatIntegration.decoration?.main_color}
                        />
                    </>
                )}
            </GorgiasChatIntegrationPreview>
        </>
    )
}

const connector = connect((state: RootState) => ({
    currentUser: state.currentUser,
}))

export default connector(QuickResponseSelfServicePreview)
