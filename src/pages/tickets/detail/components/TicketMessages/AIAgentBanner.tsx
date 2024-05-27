import React from 'react'
import classNames from 'classnames'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'

import {TicketMessage} from 'models/ticket/types'
import {useGetAiAgentFeedback} from 'models/aiAgentFeedback/queries'

import IconButton from 'pages/common/components/button/IconButton'
import Button from 'pages/common/components/button/Button'

import {
    changeActiveTab,
    changeTicketMessage,
    getSelectedAIMessage,
} from 'state/ui/ticketAIAgentFeedback'
import {TicketAIAgentFeedbackTab} from 'state/ui/ticketAIAgentFeedback/constants'
import {openPanel} from 'state/layout/actions'

import css from './AIAgentBanner.less'

export type AIAgentBannerProps = {
    message: TicketMessage
}

export const ACCURATE_RESPONSE = 'Is the response accurate?'
export const IMPROVE_RESPONSE = 'Improve response'

const AIAgentBanner = ({message}: AIAgentBannerProps) => {
    const dispatch = useAppDispatch()
    const selectedAIMessage = useAppSelector(getSelectedAIMessage)
    const handleImproveResponse = () => {
        dispatch(
            changeActiveTab({
                activeTab: TicketAIAgentFeedbackTab.AIAgent,
            })
        )
        dispatch(
            changeTicketMessage({
                message,
            })
        )
        dispatch(openPanel('infobar'))
    }

    const {data, isLoading, isError} = useGetAiAgentFeedback(
        message.ticket_id!,
        {
            refetchOnWindowFocus: false,
        }
    )

    if (isLoading || isError) {
        return null
    }

    const ticketFeedback = data?.data

    const messageFeedback = ticketFeedback?.messages?.find(
        (messageFeedback) => messageFeedback.messageId === message.id
    )

    const positiveFeedback =
        messageFeedback &&
        messageFeedback.actions?.every((action) => action.feedback === 1) &&
        messageFeedback.guidance?.every(
            (guidance) => guidance.feedback === 1
        ) &&
        messageFeedback.knowledge?.every(
            (knowledge) => knowledge.feedback === 1
        )

    return (
        <div className={css.container}>
            <i className={classNames('material-icons', css.icon)}>
                auto_awesome
            </i>
            <div className={css.content}>
                <div className={css.message}>{messageFeedback?.summary}</div>
                <div className={css.feedbackContainer}>
                    <div className={css.feedbackQuestion}>
                        {ACCURATE_RESPONSE}
                    </div>
                    <div className={css.feedbackButtons}>
                        <IconButton
                            fillStyle="fill"
                            intent="secondary"
                            size="small"
                            iconClassName={
                                positiveFeedback
                                    ? 'material-icons'
                                    : 'material-icons-outlined'
                            }
                            className={classNames(css.feedbackButton, {
                                [css.positiveFeedback]: positiveFeedback,
                            })}
                        >
                            thumb_up
                        </IconButton>
                        <Button
                            intent="secondary"
                            size="small"
                            fillStyle="fill"
                            onClick={handleImproveResponse}
                            isDisabled={selectedAIMessage === message}
                            className={css.feedbackButton}
                        >
                            {IMPROVE_RESPONSE}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AIAgentBanner
