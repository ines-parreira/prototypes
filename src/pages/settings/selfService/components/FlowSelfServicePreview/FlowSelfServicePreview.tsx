import React, {useMemo} from 'react'
import {useRouteMatch} from 'react-router'
import {ListGroup, Button, ButtonGroup} from 'reactstrap'
import {ConnectedProps, connect} from 'react-redux'

import {List, Map} from 'immutable'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {GORGIAS_CHAT_SSP_TEXTS} from 'config/integrations/gorgias_chat'
import {getIntegrations} from 'state/integrations/selectors'
import ChatIntegrationPreview from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationPreview/ChatIntegrationPreview'
import MessageContentPreview, {
    AgentMessages,
} from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationPreview/MessageContent'
import useAppSelector from 'hooks/useAppSelector'
import {RootState} from 'state/types'

import {toJS} from 'utils'
import {FeatureFlagKey} from 'config/featureFlags'
import HomePageListGroupItem from '../QuickResponseFlowsPreferences/components/SelfServicePreview/components/HomePageListGroupItem'
import css from '../QuickResponseFlowsPreferences/components/SelfServicePreview/SelfServicePreview.less'
import quickResponseCss from '../QuickResponseFlowItem/QuickResponseFlowItem.less'
import {useChatIntegration} from '../QuickResponseFlowsPreferences/components/SelfServicePreview/hooks'
import {SelfServicePreviewFooter} from '../QuickResponseFlowsPreferences/components/SelfServicePreview/components/SelfServicePreviewFooter'
import QuickResponseReplies from '../QuickResponseFlowItem/components/QuickResponseReplies/QuickResponseReplies'
import {useConfigurationData} from '../hooks'
import {OrderManagementFlow} from '../QuickResponseFlowsPreferences/components/SelfServicePreview/components/OrderManagementFlow'

type Props = {
    message: string | JSX.Element
    responseMessage: Map<any, any>
    newMessageAttachments: List<any>
    isLandingPage: boolean
    setIsLandingPage: (value: boolean) => void
    isQuickResponsePreview?: boolean
    quickResponseId?: string
    showHelpfulPrompt?: boolean
}

const FlowSelfServicePreview = ({
    message,
    responseMessage,
    currentUser,
    newMessageAttachments,
    isLandingPage,
    setIsLandingPage,
    isQuickResponsePreview = false,
    quickResponseId,
    showHelpfulPrompt = false,
}: Props & ConnectedProps<typeof connector>) => {
    const integrations = useAppSelector(getIntegrations)
    const {configuration: selfServiceConfiguration} = useConfigurationData()
    const hasAutomatedResponseOrderManagementFlag =
        useFlags()[FeatureFlagKey.SelfServiceAutomatedResponseOrderManagement]

    const {
        params: {shopName},
    } = useRouteMatch<{
        shopName: string
    }>()

    const {chatIntegration} = useChatIntegration({integrations, shopName})

    const sspTexts =
        GORGIAS_CHAT_SSP_TEXTS[chatIntegration.meta.language || 'en-US']

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

    const hasOrderManagementFlow =
        selfServiceConfiguration.track_order_policy.enabled ||
        selfServiceConfiguration.cancel_order_policy.enabled ||
        selfServiceConfiguration.report_issue_policy.enabled ||
        selfServiceConfiguration.return_order_policy.enabled

    const shouldDisplayRegularConversation =
        responseMessage.get('text') === '' && newMessageAttachments.size === 0

    const agentMessages: AgentMessages = [
        {
            content: responseMessage.get('html') as string,
            isHtml: true,
            attachments: toJS(newMessageAttachments),
        },
    ]

    if (showHelpfulPrompt) {
        agentMessages.push({
            content: 'Was this helpful?',
            isHtml: false,
            attachments: [],
        })
    }

    return (
        <div className={quickResponseCss.container}>
            <ButtonGroup className="mb-4">
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
            <ChatIntegrationPreview
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
                renderFooter={
                    !isLandingPage &&
                    (!showHelpfulPrompt || shouldDisplayRegularConversation)
                }
                renderPoweredBy={!isLandingPage}
                position={chatIntegration.decoration?.position}
                hideButton
            >
                {isLandingPage ? (
                    <>
                        <div className={css.content}>
                            {(isQuickResponsePreview ||
                                visibleQuickReplies.length > 0) && (
                                <ListGroup className={css.buttons}>
                                    <HomePageListGroupItem header>
                                        {sspTexts.quickAnswers}
                                    </HomePageListGroupItem>
                                    {hasAutomatedResponseOrderManagementFlag &&
                                        visibleQuickReplies.map((policy) => (
                                            <React.Fragment key={policy.title}>
                                                {quickResponseId !==
                                                    policy.id && (
                                                    <HomePageListGroupItem
                                                        arrowRight
                                                    >
                                                        {policy.title}
                                                    </HomePageListGroupItem>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    {isQuickResponsePreview && (
                                        <HomePageListGroupItem arrowRight>
                                            {message}
                                        </HomePageListGroupItem>
                                    )}
                                </ListGroup>
                            )}

                            {hasOrderManagementFlow && (
                                <OrderManagementFlow
                                    selfServiceConfiguration={
                                        selfServiceConfiguration
                                    }
                                    sspTexts={sspTexts}
                                />
                            )}
                        </div>
                        <SelfServicePreviewFooter
                            backgroundColor={
                                chatIntegration.decoration?.main_color
                            }
                            sspTexts={sspTexts}
                        />
                    </>
                ) : (
                    <>
                        <MessageContentPreview
                            conversationColor={
                                chatIntegration.decoration?.main_color
                            }
                            currentUser={currentUser}
                            customerInitialMessages={[message] as JSX.Element[]}
                            agentMessages={
                                shouldDisplayRegularConversation
                                    ? []
                                    : agentMessages
                            }
                            hideMessageTimestamp
                        />

                        {showHelpfulPrompt &&
                            !shouldDisplayRegularConversation && (
                                <QuickResponseReplies
                                    quickReplies={[
                                        'Yes, thank you',
                                        'No, I need more help',
                                    ]}
                                    mainColor={
                                        chatIntegration.decoration?.main_color
                                    }
                                />
                            )}
                    </>
                )}
            </ChatIntegrationPreview>
        </div>
    )
}

const connector = connect((state: RootState) => ({
    currentUser: state.currentUser,
}))

export default connector(FlowSelfServicePreview)
