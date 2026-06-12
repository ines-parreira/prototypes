import type React from 'react'
import { useEffect, useState } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { DateAndTimeFormatting, formatDatetime } from '@repo/utils'
import { Link } from 'react-router-dom'
import { Table } from 'reactstrap'
import { truncate, uniqueId } from '@gorgias/toolkit'
import { useAsyncFn } from '@gorgias/toolkit-react'

import { toast } from '@gorgias/axiom'
import type { CursorPaginationMeta } from '@gorgias/helpdesk-queries'

import type { TicketMessageSourceType } from 'business/types/ticket'
import { useAppSelector } from 'hooks/useAppSelector'
import { useGetDateAndTimeFormat } from 'hooks/useGetDateAndTimeFormat'
import { fetchTicketsByRuleId } from 'models/ticket/resources'
import type { Ticket } from 'models/ticket/types'
import { Avatar } from 'pages/common/components/Avatar/Avatar'
import { Loader } from 'pages/common/components/Loader/Loader'
import { Navigation } from 'pages/common/components/Navigation/Navigation'
import { ChannelLabel } from 'pages/common/utils/labels'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

import css from './RuleTicketList.less'

type Props = {
    ruleId: number
    numTickets?: number
}

export const RuleTicketList = ({ ruleId, numTickets = 10 }: Props) => {
    const [paginationMeta, setPaginationMeta] =
        useState<CursorPaginationMeta | null>(null)
    const [ticketList, setTicketList] = useState<Ticket[]>([])
    const currentAccount = useAppSelector(getCurrentAccountState)
    const [{ loading }, handleFetchData] = useAsyncFn(
        async (cursor?: string) => {
            try {
                const { data, meta } = await fetchTicketsByRuleId(ruleId, {
                    cursor: cursor,
                    limit: numTickets,
                })
                setTicketList(data)
                setPaginationMeta(meta)
            } catch {
                toast.error('Failed to fetch ticket list')
            }
        },
        [],
    )

    const datetimeFormat = useGetDateAndTimeFormat(
        DateAndTimeFormatting.CompactDate,
    )

    useEffect(() => {
        void handleFetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleVisit = (ticketId: number, event: React.MouseEvent) => {
        if (event.button !== 2) {
            logEvent(SegmentEvent.RuleDebuggingTicketVisited, {
                account_domain: currentAccount.get('domain'),
                ticket_id: ticketId,
            })
        }
    }

    const LinkedCell = ({
        ticketId,
        children,
        className,
    }: {
        ticketId: number
        children: React.ReactNode
        className?: string
    }) => {
        return (
            <td className={className}>
                <Link
                    onMouseDown={(event) => {
                        handleVisit(ticketId, event)
                    }}
                    to={`/app/ticket/${ticketId}`}
                >
                    <div className={css.cellWrapper}>{children}</div>
                </Link>
            </td>
        )
    }

    const renderTable = (tickets: Ticket[]) => (
        <>
            <Table className={css.wrapper}>
                <thead>
                    <tr>
                        <th colSpan={2}>ticket information</th>
                        <th>created</th>
                        <th>channel</th>
                    </tr>
                </thead>
                <tbody>
                    {!!tickets.length &&
                        tickets.map((ticket) => (
                            <tr key={uniqueId(`${ticket.id}-`)}>
                                <LinkedCell
                                    ticketId={ticket.id}
                                    className={css.avatar}
                                >
                                    {ticket.assignee_user && (
                                        <Avatar
                                            email={ticket.assignee_user.email}
                                            url={
                                                ticket.assignee_user?.meta
                                                    ?.profile_picture_url
                                            }
                                            name={ticket.assignee_user.name}
                                            size={30}
                                        />
                                    )}
                                </LinkedCell>
                                <LinkedCell
                                    ticketId={ticket.id}
                                    className={css.ticketInfo}
                                >
                                    <div className={css.ticketSubject}>
                                        {ticket.subject}
                                    </div>
                                    <div className={css.ticketDescription}>
                                        {truncate(ticket.excerpt ?? '', {
                                            length: 100,
                                        })}
                                    </div>
                                </LinkedCell>
                                <LinkedCell ticketId={ticket.id}>
                                    {formatDatetime(
                                        ticket.created_datetime,
                                        datetimeFormat,
                                    )}
                                </LinkedCell>
                                <LinkedCell ticketId={ticket.id}>
                                    <ChannelLabel
                                        channel={
                                            ticket.channel as unknown as TicketMessageSourceType
                                        }
                                    />
                                </LinkedCell>
                            </tr>
                        ))}
                </tbody>
            </Table>
        </>
    )

    return (
        <>
            {loading ? <Loader minHeight="60px" /> : renderTable(ticketList)}
            <Navigation
                className={css.navigation}
                hasNextItems={!!paginationMeta?.next_cursor}
                hasPrevItems={!!paginationMeta?.prev_cursor}
                fetchNextItems={() =>
                    paginationMeta?.next_cursor &&
                    handleFetchData(paginationMeta.next_cursor)
                }
                fetchPrevItems={() =>
                    paginationMeta?.prev_cursor &&
                    handleFetchData(paginationMeta.prev_cursor)
                }
            />
            {!ticketList.length && (
                <div
                    className={css.noTrigger}
                >{`This rule hasn't fired yet.`}</div>
            )}
        </>
    )
}
