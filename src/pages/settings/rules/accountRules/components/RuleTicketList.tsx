import React, {useState, useEffect} from 'react'
import moment from 'moment'
import _truncate from 'lodash/truncate'
import _uniqueId from 'lodash/uniqueId'
import {useAsyncFn} from 'react-use'
import {Link} from 'react-router-dom'
import {Table} from 'reactstrap'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import {fetchTicketsByRuleId} from 'models/ticket/resources'
import {CursorMeta} from 'models/api/types'
import {TicketMessageSourceType} from 'business/types/ticket'
import {Ticket} from 'models/ticket/types'
import Navigation from 'pages/common/components/Navigation/Navigation'
import Avatar from 'pages/common/components/Avatar/Avatar'
import {ChannelLabel} from 'pages/common/utils/labels'
import Loader from 'pages/common/components/Loader/Loader'

import css from './RuleTicketList.less'

type Props = {
    ruleId: number
    numTickets?: number
}

export const RuleTicketList = ({ruleId, numTickets = 10}: Props) => {
    const dispatch = useAppDispatch()
    const [paginationMeta, setPaginationMeta] = useState<CursorMeta | null>(
        null
    )
    const [ticketList, setTicketList] = useState<Ticket[]>([])
    const currentAccount = useAppSelector(getCurrentAccountState)
    const [{loading}, handleFetchData] = useAsyncFn(async (cursor?: string) => {
        try {
            const {data, meta} = await fetchTicketsByRuleId(ruleId, {
                cursor: cursor,
                limit: numTickets,
            })
            setTicketList(data)
            setPaginationMeta(meta)
        } catch (error) {
            void dispatch(
                notify({
                    message: 'Failed to fetch ticket list',
                    status: NotificationStatus.Error,
                })
            )
        }
    }, [])

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
                            <tr key={_uniqueId(`${ticket.id}-`)}>
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
                                        {_truncate(ticket.excerpt, {
                                            length: 100,
                                        })}
                                    </div>
                                </LinkedCell>
                                <LinkedCell ticketId={ticket.id}>
                                    {moment(ticket.created_datetime).format(
                                        'DD/MM/YYYY'
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
                <div className={css.noTrigger}>This rule hasn't fired yet.</div>
            )}
        </>
    )
}
