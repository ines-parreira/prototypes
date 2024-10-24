import classnames from 'classnames'
import React from 'react'

import css from './TicketEvent.less'
import {TicketEventEnum} from './types'

type Props = {
    eventType: TicketEventEnum
    isFirst?: boolean
    isLast?: boolean
    children?: React.ReactNode
}

export const TicketEventToIcon: {[key in TicketEventEnum]: string} = {
    [TicketEventEnum.CLOSE]: 'check',
    [TicketEventEnum.ASSIGN_TICKET]: 'person_add',
    [TicketEventEnum.SNOOZE]: 'timer',
    [TicketEventEnum.TAGGED]: 'label',
}

export const TicketEventToLabel: {[key in TicketEventEnum]: string} = {
    [TicketEventEnum.CLOSE]: 'Closed',
    [TicketEventEnum.ASSIGN_TICKET]: 'Handed over',
    [TicketEventEnum.SNOOZE]: 'Snoozed',
    [TicketEventEnum.TAGGED]: 'Tagged',
}

const TicketEvent = ({eventType, isFirst, isLast, children}: Props) => {
    return (
        <div className={css.ticketEventContainer}>
            <div className={css.ticketEventBadge}>
                {!isFirst && <div className={css.badgeTopLine}></div>}
                <div
                    className={classnames(
                        css.badgeIconContainer,
                        eventType === TicketEventEnum.CLOSE
                            ? css.badgeIconContainerGreen
                            : css.badgeIconContainerBlack
                    )}
                >
                    <i className={classnames('material-icons', css.badgeIcon)}>
                        {TicketEventToIcon[eventType]}
                    </i>
                </div>
                {!isLast && <div className={css.badgeBottomLine}></div>}
            </div>
            <div className={css.ticketEventDetails}>
                <div className={css.ticketEventLabel}>
                    {TicketEventToLabel[eventType]}
                </div>
                {children}
            </div>
        </div>
    )
}

export default TicketEvent
