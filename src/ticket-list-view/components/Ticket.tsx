import React, {ComponentProps, useMemo} from 'react'
import cn from 'classnames'
import {CSSTransition} from 'react-transition-group'
import {Link} from 'react-router-dom'
import {Components} from 'react-virtuoso'

import ViewingIndicator from 'pages/common/components/ViewingIndicator/ViewingIndicator'
import TicketIcon from 'pages/common/components/TicketIcon'
import useIsTicketViewed from 'ticket-list-view/hooks/useIsTicketViewed'

import {TicketPartial, TicketSummary} from '../types'
import RelativeTime from './RelativeTime'
import TicketSkeleton from './TicketSkeleton'
import css from './Ticket.less'

type InjectedProps = ComponentProps<typeof CSSTransition> &
    ComponentProps<NonNullable<Components['Item']>>

type Props = {
    isActive: boolean
    ticket: TicketPartial | TicketSummary
    viewId: number
    isNewTicket?: boolean
}

type MergedProps = Props & Partial<InjectedProps>

const classNames = {
    enter: css.enter,
    enterActive: css.enterActive,
    exit: css.exit,
    exitActive: css.exitActive,
}

export default function Ticket({
    isActive,
    ticket,
    viewId,
    isNewTicket,
    context, // eslint-disable-line @typescript-eslint/no-unused-vars
    style,
    ['data-index']: dataIndex,
    ['data-item-index']: dataItemIndex,
    ['data-item-group-index']: dataItemGroupIndex,
    ['data-known-size']: dataKnownSize,
    ...transitionProps
}: MergedProps) {
    const {isTicketViewed, agentViewingMessage} = useIsTicketViewed(ticket.id)
    const datetime = useMemo(
        () =>
            'channel' in ticket
                ? ticket.last_message_datetime || ticket.updated_datetime
                : null,
        [ticket]
    )

    return (
        <CSSTransition
            classNames={classNames}
            timeout={650}
            {...transitionProps}
            enter={isNewTicket}
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
                    className={cn(css.inner, {[css.active]: isActive})}
                    to={`/app/views/${viewId}/${ticket.id}`}
                >
                    {!('channel' in ticket) ? (
                        <TicketSkeleton />
                    ) : (
                        <>
                            {isTicketViewed && (
                                <ViewingIndicator
                                    title={agentViewingMessage}
                                    position="right"
                                    className={css.viewingIndicator}
                                />
                            )}
                            <TicketIcon
                                channel={ticket.channel}
                                className={css.icon}
                                status={ticket.status}
                            />
                            <div
                                className={cn(css.content, {
                                    [css.unread]: !isActive && ticket.is_unread,
                                })}
                            >
                                <div className={css.wrapper}>
                                    <div className={css.subject}>
                                        {ticket.subject}
                                    </div>
                                    {!isActive && ticket.is_unread && (
                                        <div className={css.counter} />
                                    )}
                                </div>
                                <div className={cn(css.wrapper, css.body)}>
                                    <div className={css.excerpt}>
                                        {ticket.excerpt}
                                    </div>
                                    <div className={css.time}>
                                        {!!datetime && (
                                            <RelativeTime datetime={datetime} />
                                        )}
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
