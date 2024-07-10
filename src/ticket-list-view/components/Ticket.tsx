import React, {
    ComponentProps,
    MouseEvent,
    useCallback,
    useMemo,
    useRef,
} from 'react'
import cn from 'classnames'
import {CSSTransition} from 'react-transition-group'
import {Link} from 'react-router-dom'
import {Components} from 'react-virtuoso'

import {useFlag} from 'common/flags'
import {FeatureFlagKey} from 'config/featureFlags'
import RelativeTime from 'pages/common/components/RelativeTime'
import ViewingIndicator from 'pages/common/components/ViewingIndicator/ViewingIndicator'
import SourceIcon from 'pages/common/components/SourceIcon'
import TicketIcon from 'pages/common/components/TicketIcon'
import CheckBox from 'pages/common/forms/CheckBox'
import useIsTicketViewed from 'ticket-list-view/hooks/useIsTicketViewed'

import {TicketPartial, TicketSummary} from '../types'
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
    const hasBulkActions = useFlag(FeatureFlagKey.BulkActionsDTP, false)

    const {isTicketViewed, agentViewingMessage} = useIsTicketViewed(ticket.id)
    const datetime = useMemo(
        () =>
            'channel' in ticket
                ? ticket.last_message_datetime || ticket.updated_datetime
                : null,
        [ticket]
    )

    const checkboxRef = useRef<HTMLInputElement | null>(null)
    const handleClickLink = useCallback((e: MouseEvent<HTMLAnchorElement>) => {
        if (e.target === checkboxRef.current) {
            e.preventDefault()
        }
    }, [])

    if (hasBulkActions) {
        const customer =
            'channel' in ticket &&
            (ticket.customer?.name || ticket.customer?.email)

        return (
            <CSSTransition
                classNames={classNames}
                timeout={650}
                {...transitionProps}
                enter={isNewTicket}
            >
                <div
                    className={css.outerNew}
                    data-index={dataIndex}
                    data-item-index={dataItemIndex}
                    data-item-group-index={dataItemGroupIndex}
                    data-known-size={dataKnownSize}
                    style={style}
                >
                    <Link
                        className={cn(css.innerNew, {
                            [css.active]: isActive,
                        })}
                        to={`/app/views/${viewId}/${ticket.id}`}
                        onClick={handleClickLink}
                    >
                        {!('channel' in ticket) ? (
                            <TicketSkeleton />
                        ) : (
                            <>
                                {isTicketViewed && (
                                    <ViewingIndicator
                                        className={css.viewingIndicatorNew}
                                        position="right"
                                        title={agentViewingMessage}
                                    />
                                )}
                                <CheckBox ref={checkboxRef} isChecked={false} />
                                <div
                                    className={cn(css.contentNew, {
                                        [css.unread]: ticket.is_unread,
                                    })}
                                >
                                    <header className={css.header}>
                                        <span className={css.customerChannel}>
                                            {!!customer && (
                                                <span className={css.customer}>
                                                    {customer}
                                                </span>
                                            )}

                                            <SourceIcon
                                                className={css.icon}
                                                type={ticket.channel}
                                            />
                                        </span>
                                        {!!datetime && (
                                            <span className={css.timeNew}>
                                                <RelativeTime
                                                    datetime={datetime}
                                                />
                                            </span>
                                        )}
                                        {ticket.is_unread && (
                                            <span
                                                className={css.unreadIndicator}
                                            />
                                        )}
                                    </header>
                                    <div className={css.subjectNew}>
                                        {ticket.subject}
                                    </div>
                                    <div className={css.excerptNew}>
                                        {ticket.excerpt}
                                    </div>
                                </div>
                            </>
                        )}
                    </Link>
                </div>
            </CSSTransition>
        )
    }

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
                                    {ticket.is_unread && (
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
