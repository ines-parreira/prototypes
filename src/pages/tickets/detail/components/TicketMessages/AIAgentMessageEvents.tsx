import classNames from 'classnames'
import {fromJS} from 'immutable'
import React from 'react'

import {TicketMessage} from 'models/ticket/types'
import TicketTag from 'pages/common/components/TicketTag'

import {useAIAgentMessageEvents} from '../../hooks/useAIAgentMessageEvents'
import {
    TicketEventToIcon,
    TicketEventToLabel,
} from '../AIAgentFeedbackBar/TicketEvent'
import {TicketEventEnum} from '../AIAgentFeedbackBar/types'
import {ActionName} from '../AuditLogEvent'
import cssEvent from '../Event.less'
import css from './AIAgentMessageEvents.less'

export type Props = {
    message: TicketMessage
}

const ByAIAgent = () => (
    <div className={css.byAIAgent}>
        by{' '}
        <i className={classNames('material-icons', css.awesomeIcon)}>
            auto_awesome
        </i>{' '}
        AI Agent
    </div>
)

const AIAgentMessageEvents = ({message}: Props) => {
    const [{tags, action}] = useAIAgentMessageEvents([message])

    return (
        <>
            {tags.length > 0 && (
                <div className={cssEvent.component}>
                    <div className={cssEvent.event}>
                        <div className={cssEvent.content}>
                            <div className={cssEvent.icon}>
                                <i className="material-icons">local_offer</i>
                            </div>
                            <ActionName>Tagged</ActionName>
                            {tags.map((tag) => (
                                <TicketTag
                                    key={tag.id}
                                    text={tag.name}
                                    decoration={fromJS(tag.decoration)}
                                    className={cssEvent.equalFiller}
                                />
                            ))}
                            <ByAIAgent />
                        </div>
                    </div>
                </div>
            )}
            {!!action && (
                <div
                    className={cssEvent.component}
                    data-testid="ai-agent-message-action"
                >
                    <div className={cssEvent.event}>
                        <div className={cssEvent.content}>
                            <div
                                className={classNames(cssEvent.icon, {
                                    [cssEvent.success]:
                                        action === TicketEventEnum.CLOSE,
                                })}
                            >
                                <i className="material-icons">
                                    {TicketEventToIcon[action]}
                                </i>
                            </div>
                            <ActionName>
                                {TicketEventToLabel[action]}
                            </ActionName>
                            {''}
                            <ByAIAgent />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default AIAgentMessageEvents
