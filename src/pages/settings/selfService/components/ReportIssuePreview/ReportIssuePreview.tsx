import classNames from 'classnames'
import React from 'react'
import {useRouteMatch} from 'react-router'
import {Button, ButtonGroup} from 'reactstrap'
import {ConnectedProps, connect} from 'react-redux'

import {List} from 'immutable'
import {GORGIAS_CHAT_SSP_TEXTS} from 'config/integrations/gorgias_chat'
import {ResponseMessageContent} from 'models/selfServiceConfiguration/types'
import {getIntegrations} from 'state/integrations/selectors'
import {SelectableOption} from 'pages/common/forms/SelectField/types'
import ChatIntegrationPreview from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationPreview/ChatIntegrationPreview'
import MessageContentPreview, {
    AgentMessages,
} from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationPreview/MessageContent'
import useAppSelector from 'hooks/useAppSelector'
import {RootState} from 'state/types'

import {toJS} from 'utils'
import quickResponseCss from '../QuickResponseFlowItem/QuickResponseFlowItem.less'
import {useChatIntegration} from '../QuickResponseFlowsPreferences/components/SelfServicePreview/hooks'
import QuickResponseReplies from '../QuickResponseFlowItem/components/QuickResponseReplies/QuickResponseReplies'

import css from './ReportIssuePreview.less'
import {buildReportIssueCustomerMessage} from './utils'

export type ReportIssuePreviewMode = 'alloptions' | 'messagethread'

type Props = {
    reportIssueReason: string
    automatedResponse: ResponseMessageContent | undefined
    newMessageAttachments: List<any>
    reasonOptions: SelectableOption[]
    mode: ReportIssuePreviewMode
    setMode: (value: ReportIssuePreviewMode) => void
    showHelpfulPrompt?: boolean
}

const ReportIssuePreview = ({
    reportIssueReason,
    automatedResponse,
    currentUser,
    newMessageAttachments,
    reasonOptions,
    mode,
    setMode,
    showHelpfulPrompt = false,
}: Props & ConnectedProps<typeof connector>) => {
    const integrations = useAppSelector(getIntegrations)

    const {
        params: {shopName},
    } = useRouteMatch<{
        shopName: string
    }>()

    const {chatIntegration} = useChatIntegration({integrations, shopName})

    const sspTexts =
        GORGIAS_CHAT_SSP_TEXTS[chatIntegration?.meta?.language || 'en-US']

    const reportIssueCustomerMessage = buildReportIssueCustomerMessage(
        reportIssueReason,
        sspTexts
    )

    if (!chatIntegration) {
        return null
    }

    const agentMessages: AgentMessages = automatedResponse?.text
        ? [
              {
                  content: automatedResponse.html,
                  isHtml: true,
                  attachments: toJS(newMessageAttachments),
              },
          ]
        : []

    if (showHelpfulPrompt && agentMessages) {
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
                    color={mode === 'alloptions' ? 'info' : 'secondary'}
                    onClick={() => setMode('alloptions')}
                >
                    All Options
                </Button>
                <Button
                    type="button"
                    color={mode === 'messagethread' ? 'info' : 'secondary'}
                    onClick={() => setMode('messagethread')}
                >
                    Message Thread
                </Button>
            </ButtonGroup>

            <ChatIntegrationPreview
                name={chatIntegration.name}
                introductionText={chatIntegration.decoration?.introduction_text}
                mainColor={chatIntegration.decoration?.main_color}
                avatarTeamPictureUrl={
                    chatIntegration.decoration?.avatar_team_picture_url ??
                    undefined
                }
                avatarType={chatIntegration.decoration?.avatar_type}
                isOnline
                language={chatIntegration.meta.language}
                renderFooter={false}
            >
                {mode === 'alloptions' ? (
                    <>
                        <span className={css.header}>
                            {sspTexts.whatIsWrongWithOrder}
                        </span>
                        <ul className={css.list}>
                            {reasonOptions.map((reason) => (
                                <li className={css.listItem} key={reason.value}>
                                    <span>
                                        {sspTexts[reason.value] ?? reason.label}
                                    </span>

                                    <span
                                        className={classNames(
                                            'material-icons-outlined',
                                            css.chevronIcon
                                        )}
                                    >
                                        chevron_right
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </>
                ) : (
                    <>
                        <MessageContentPreview
                            conversationColor={
                                chatIntegration.decoration?.main_color
                            }
                            currentUser={currentUser}
                            customerInitialMessages={[
                                reportIssueCustomerMessage,
                            ]}
                            agentMessages={agentMessages}
                            hideMessageTimestamp
                        />

                        {showHelpfulPrompt && (
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

export default connector(ReportIssuePreview)
