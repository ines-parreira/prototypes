import cn from 'classnames'

import {
    TicketEventToIcon,
    TicketEventToLabel,
} from 'pages/tickets/detail/components/AIAgentFeedbackBar/TicketEvent'
import { TicketEventEnum } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import { ActionName } from 'pages/tickets/detail/components/AuditLogEvent'
import css from 'pages/tickets/detail/components/Event.less'
import { ByAIAgent } from 'pages/tickets/detail/components/TicketMessages/AIAgentMessageEvents'

export type AIEvent = {
    eventType: TicketEventEnum
}

type Props = {
    data: AIEvent
}

export function TicketAIEvent({ data }: Props) {
    const action = data.eventType

    return (
        <div className={css.component}>
            <div className={css.event}>
                <div className={css.content}>
                    <div
                        className={cn(css.icon, {
                            [css.success]: action === TicketEventEnum.CLOSE,
                        })}
                    >
                        <i className="material-icons">
                            {TicketEventToIcon[action]}
                        </i>
                    </div>
                    <ActionName>{TicketEventToLabel[action]}</ActionName>
                    {''}
                    <ByAIAgent />
                </div>
            </div>
        </div>
    )
}
