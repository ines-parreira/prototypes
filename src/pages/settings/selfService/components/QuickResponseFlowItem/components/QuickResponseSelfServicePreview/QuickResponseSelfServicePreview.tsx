import React from 'react'
import {useRouteMatch} from 'react-router'
import {ListGroup, Button, ButtonGroup} from 'reactstrap'
import {ConnectedProps, connect} from 'react-redux'

import {List, Map} from 'immutable'
import {GORGIAS_CHAT_SSP_TEXTS} from 'config/integrations/gorgias_chat'
import {getIntegrations} from 'state/integrations/selectors'
import ChatIntegrationPreview from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationPreview/ChatIntegrationPreview'
import MessageContentPreview from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationPreview/MessageContent'
import useAppSelector from 'hooks/useAppSelector'
import {RootState} from 'state/types'

import {toJS} from 'utils'
import HomePageListGroupItem from '../../../QuickResponseFlowsPreferences/components/SelfServicePreview/components/HomePageListGroupItem'
import css from '../../../QuickResponseFlowsPreferences/components/SelfServicePreview/SelfServicePreview.less'
import quickResponseCss from '../../QuickResponseFlowItem.less'
import {useChatIntegration} from '../../../QuickResponseFlowsPreferences/components/SelfServicePreview/hooks'
import {SelfServicePreviewFooter} from '../../../QuickResponseFlowsPreferences/components/SelfServicePreview/components/SelfServicePreviewFooter'
import QuickResponseReplies from '../QuickResponseReplies/QuickResponseReplies'

type Props = {
    quickResponseTitle: string
    quickResponseMessage: Map<any, any>
    newMessageAttachments: List<any>
    isLandingPage: boolean
    setIsLandingPage: (value: boolean) => void
}

const QuickResponseSelfServicePreview = ({
    quickResponseTitle,
    quickResponseMessage,
    currentUser,
    newMessageAttachments,
    isLandingPage,
    setIsLandingPage,
}: Props & ConnectedProps<typeof connector>) => {
    const integrations = useAppSelector(getIntegrations)
    const {
        params: {shopName},
    } = useRouteMatch<{
        shopName: string
    }>()

    const {chatIntegration} = useChatIntegration({integrations, shopName})

    const sspTexts =
        GORGIAS_CHAT_SSP_TEXTS[chatIntegration.meta.language || 'en-US']

    const shouldDisplayRegularConversation =
        quickResponseMessage.get('text') === '' &&
        newMessageAttachments.size === 0

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
                    !isLandingPage && shouldDisplayRegularConversation
                }
                renderPoweredBy={!isLandingPage}
                position={chatIntegration.decoration?.position}
                hideButton
            >
                {isLandingPage ? (
                    <div className={css.content}>
                        <div className={css.listGroup}>
                            <ListGroup className={css.buttons}>
                                <HomePageListGroupItem header>
                                    {sspTexts.quickAnswers}
                                </HomePageListGroupItem>
                                <HomePageListGroupItem>
                                    {quickResponseTitle}
                                </HomePageListGroupItem>
                            </ListGroup>
                        </div>

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
                            agentMessages={
                                shouldDisplayRegularConversation
                                    ? []
                                    : [
                                          {
                                              content:
                                                  quickResponseMessage.get(
                                                      'html'
                                                  ),
                                              isHtml: true,
                                              attachments: toJS(
                                                  newMessageAttachments
                                              ),
                                          },
                                          {
                                              content: 'Was this helpful?',
                                              isHtml: false,
                                              attachments: [],
                                          },
                                      ]
                            }
                            hideMessageTimestamp
                        />

                        {!shouldDisplayRegularConversation && (
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

export default connector(QuickResponseSelfServicePreview)
