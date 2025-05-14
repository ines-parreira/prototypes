import React, {
    ComponentProps,
    MouseEvent,
    useCallback,
    useMemo,
    useRef,
} from 'react'

import cn from 'classnames'
import { Link } from 'react-router-dom'
import { CSSTransition } from 'react-transition-group'
import { Components } from 'react-virtuoso'

import { Tooltip } from '@gorgias/merchant-ui-kit'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import RelativeTime from 'pages/common/components/RelativeTime'
import SourceIcon from 'pages/common/components/SourceIcon'
import ViewingIndicator from 'pages/common/components/ViewingIndicator/ViewingIndicator'
import CheckBox from 'pages/common/forms/CheckBox'

import useIsTicketViewed from '../hooks/useIsTicketViewed'
import { TicketCompact, TicketPartial } from '../types'
import TicketSkeleton from './TicketSkeleton'

import css from './Ticket.less'

type InjectedProps = ComponentProps<typeof CSSTransition> &
    ComponentProps<NonNullable<Components['Item']>>

type Props = {
    isActive: boolean
    ticket: TicketPartial | TicketCompact
    viewId: number
    isNewTicket?: boolean
    isSelected?: boolean
    onSelect: (id: number, selected: boolean, selectRange?: boolean) => void
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
    isSelected,
    context, // eslint-disable-line @typescript-eslint/no-unused-vars
    style,
    onSelect,
    ['data-index']: dataIndex,
    ['data-item-index']: dataItemIndex,
    ['data-item-group-index']: dataItemGroupIndex,
    ['data-known-size']: dataKnownSize,
    ...transitionProps
}: MergedProps) {
    const shouldRedirectDeprecatedTicketRoutes = useFlag<boolean>(
        FeatureFlagKey.RedirectDeprecatedTicketRoutes,
        false,
    )

    const { isTicketViewed, agentViewingMessage } = useIsTicketViewed(ticket.id)
    const datetime = useMemo(
        () =>
            'channel' in ticket
                ? ticket.last_message_datetime || ticket.updated_datetime
                : null,
        [ticket],
    )

    const checkboxRef = useRef<HTMLInputElement | null>(null)
    const handleClickLink = useCallback((e: MouseEvent<HTMLAnchorElement>) => {
        if (e.target === checkboxRef.current) {
            e.preventDefault()
        }
    }, [])

    const handleClickCheckbox = useCallback(
        (e: MouseEvent<HTMLInputElement>) => {
            onSelect(ticket.id, e.currentTarget.checked, e.shiftKey)
        },
        [ticket, onSelect],
    )

    const excerptRef = useRef<HTMLDivElement | null>(null)
    const sourceRef = useRef<HTMLImageElement | null>(null)

    const customer =
        'channel' in ticket && ticket.customer
            ? ticket.customer?.name ||
              ticket.customer?.email ||
              `Customer #${ticket.customer?.id}`
            : ''

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
                    className={cn(css.inner, {
                        [css.active]: isActive,
                    })}
                    to={
                        shouldRedirectDeprecatedTicketRoutes
                            ? `/app/tickets/${viewId}/${ticket.id}`
                            : `/app/views/${viewId}/${ticket.id}`
                    }
                    onClick={handleClickLink}
                >
                    {!('channel' in ticket) ? (
                        <TicketSkeleton />
                    ) : (
                        <>
                            {isTicketViewed && (
                                <ViewingIndicator
                                    className={css.viewingIndicator}
                                    position="right"
                                    title={agentViewingMessage}
                                />
                            )}
                            <CheckBox
                                ref={checkboxRef}
                                isChecked={isSelected}
                                onClick={handleClickCheckbox}
                            />
                            <div
                                className={cn(css.content, {
                                    [css.unread]: ticket.is_unread,
                                })}
                            >
                                <header className={css.header}>
                                    <span className={css.customerChannel}>
                                        <span className={css.customer}>
                                            {customer}
                                        </span>

                                        <SourceIcon
                                            ref={sourceRef}
                                            className={css.icon}
                                            type={ticket.channel}
                                        />
                                        <Tooltip
                                            delay={100}
                                            placement="bottom"
                                            target={sourceRef}
                                        >
                                            {ticket.channel}
                                        </Tooltip>
                                    </span>
                                    {!!datetime && (
                                        <span className={css.time}>
                                            <RelativeTime datetime={datetime} />
                                        </span>
                                    )}
                                    {ticket.is_unread && (
                                        <span className={css.unreadIndicator} />
                                    )}
                                </header>
                                <div className={css.subject}>
                                    {ticket.subject}
                                </div>
                                <div ref={excerptRef} className={css.excerpt}>
                                    {ticket.excerpt}
                                </div>
                                {ticket.excerpt !== '' && (
                                    <Tooltip
                                        delay={450}
                                        placement="top"
                                        target={excerptRef}
                                    >
                                        {ticket.excerpt}
                                    </Tooltip>
                                )}
                            </div>
                        </>
                    )}
                </Link>
            </div>
        </CSSTransition>
    )
}
