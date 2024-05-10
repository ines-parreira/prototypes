import React from 'react'
import classnames from 'classnames'
import css from './TicketEvent.less'

export enum TicketEventType {
    Closed = 'Closed',
}

type Props = {
    type: TicketEventType
}

const TicketEvent = ({type}: Props) => {
    return (
        // TODO: Make Icon change based on event type => Next iteration
        <div className={css.ticketEventContainer}>
            <div className={css.ticketEventBadge}>
                <div className={css.badgeTopLine}></div>
                <div className={css.badgeIconContainer}>
                    <i className={classnames('material-icons', css.badgeIcon)}>
                        check
                    </i>
                </div>
                <div className={css.badgeBottomLine}></div>
            </div>
            <div className={css.ticketEventLabel}>{type}</div>
        </div>
    )
}

export default TicketEvent
