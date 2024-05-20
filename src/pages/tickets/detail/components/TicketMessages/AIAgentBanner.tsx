import React from 'react'
import classNames from 'classnames'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'

import {TicketMessage} from 'models/ticket/types'

import IconButton from 'pages/common/components/button/IconButton'
import Button from 'pages/common/components/button/Button'

import {
    changeActiveTab,
    changeTicketMessage,
    getSelectedAIMessage,
} from 'state/ui/ticketAIAgentFeedback'
import {TicketAIAgentFeedbackTab} from 'state/ui/ticketAIAgentFeedback/constants'

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
    }

    return (
        <div className={css.container}>
            <i className={classNames('material-icons', css.icon)}>
                auto_awesome
            </i>
            <div className={css.content}>
                <div className={css.message}>
                    This message was sent by an AI agent
                </div>
                <div className={css.feedbackContainer}>
                    <div className={css.feedbackQuestion}>
                        {ACCURATE_RESPONSE}
                    </div>
                    <div className={css.feedbackButtons}>
                        <IconButton
                            fillStyle="fill"
                            intent="secondary"
                            size="small"
                            iconClassName="material-icons-outlined"
                        >
                            thumb_up
                        </IconButton>
                        <Button
                            intent="secondary"
                            size="small"
                            fillStyle="fill"
                            onClick={handleImproveResponse}
                            isDisabled={selectedAIMessage === message}
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
