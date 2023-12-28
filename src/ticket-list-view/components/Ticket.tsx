import cn from 'classnames'
import moment from 'moment'
import React, {ComponentProps} from 'react'
import {CSSTransition} from 'react-transition-group'
import {Link} from 'react-router-dom'
import {Components} from 'react-virtuoso'

import {TicketStatus} from 'business/types/ticket'
import TicketIcon from 'pages/common/components/TicketIcon'

import {TicketPartial, TicketSummary} from '../types'
import css from './Ticket.less'

type InjectedProps = ComponentProps<typeof CSSTransition> &
    ComponentProps<NonNullable<Components['Item']>>

type Props = {
    ticket: TicketPartial | TicketSummary
    viewId: number
}

type MergedProps = Props & Partial<InjectedProps>

const classNames = {
    enter: css.enter,
    enterActive: css.enterActive,
    exit: css.exit,
    exitActive: css.exitActive,
}

export default function Ticket({
    ticket,
    viewId,
    context, // eslint-disable-line @typescript-eslint/no-unused-vars
    style,
    ['data-index']: dataIndex,
    ['data-item-index']: dataItemIndex,
    ['data-item-group-index']: dataItemGroupIndex,
    ['data-known-size']: dataKnownSize,
    ...transitionProps
}: MergedProps) {
    return (
        <CSSTransition
            classNames={classNames}
            timeout={650}
            unmountOnExit
            {...transitionProps}
        >
            <div
                className={css.outer}
                data-index={dataIndex}
                data-item-index={dataItemIndex}
                data-item-group-index={dataItemGroupIndex}
                data-known-size={dataKnownSize}
                style={style}
            >
                <Link
                    className={css.inner}
                    to={`/app/views/${viewId}/${ticket.id}`}
                >
                    {!('channel' in ticket) ? (
                        <p>skeleton</p>
                    ) : (
                        <>
                            <TicketIcon
                                channel={ticket.channel}
                                className={css.icon}
                                isOpen={ticket.status === TicketStatus.Open}
                            />
                            <div
                                className={cn(css.content, {
                                    [css.unread]: ticket.is_unread,
                                })}
                            >
                                <div className={css.wrapper}>
                                    <div className={css.subject}>
                                        {ticket.subject}
                                    </div>
                                    {ticket.is_unread && (
                                        <div className={css.counter} />
                                    )}
                                </div>
                                <div className={cn(css.wrapper, css.body)}>
                                    <div className={css.excerpt}>
                                        {ticket.excerpt}
                                    </div>
                                    <div className={css.time}>
                                        {moment(
                                            ticket.last_message_datetime
                                        ).fromNow()}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </Link>
            </div>
        </CSSTransition>
    )
}
