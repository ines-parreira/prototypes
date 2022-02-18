import React, {useState, useEffect} from 'react'
import moment from 'moment'
import _truncate from 'lodash/truncate'
import {useAsyncFn} from 'react-use'
import {Card, CardBody, CardHeader, Table} from 'reactstrap'
import {useSelector} from 'react-redux'

import useAppDispatch from 'hooks/useAppDispatch'
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
import history from 'pages/history'

import css from './RuleTicketList.less'

type Props = {
    ruleId: number
    numTickets?: number
}

export const RuleTicketList = ({ruleId, numTickets = 10}: Props) => {
    const dispatch = useAppDispatch()
    const [shouldShowList, setShouldShowList] = useState(true)
    const [paginationMeta, setPaginationMeta] = useState<CursorMeta | null>(
        null
    )
    const [ticketList, setTicketList] = useState<Ticket[]>([])
    const currentAccount = useSelector(getCurrentAccountState)
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
    }, [])

    const visitTicket = (ticketId: number) => {
        logEvent(SegmentEvent.RuleDebuggingTicketVisited, {
            account_domain: currentAccount.get('domain'),
            ticket_id: ticketId,
        })
        history.push(`/app/ticket/${ticketId}`)
    }

    const toggleVisibility = (visibility: boolean) => {
        setShouldShowList(visibility)
        logEvent(
            visibility
                ? SegmentEvent.RuleDebbugingExpanded
                : SegmentEvent.RuleDebbugingExpanded,
            {
                account_domain: currentAccount.get('domain'),
            }
        )
    }

    const renderTable = (tickets: Ticket[]) => (
        <Table>
            <thead>
                <tr>
                    <th className={css.avatar}></th>
                    <th>ticket information</th>
                    <th>created</th>
                    <th>channel</th>
                </tr>
            </thead>
            <tbody>
                {tickets.map((ticket) => (
                    <tr key={ticket.id} onClick={() => visitTicket(ticket.id)}>
                        <td>
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
                        </td>
                        <td className={css.ticketInfo}>
                            <div className={css.ticketSubject}>
                                {ticket.subject}
                            </div>
                            <div className={css.ticketDescription}>
                                {_truncate(ticket.excerpt, {length: 100})}
                            </div>
                        </td>
                        <td>
                            {moment(ticket.created_datetime).format(
                                'DD/MM/YYYY'
                            )}
                        </td>
                        <td>
                            <ChannelLabel
                                channel={
                                    ticket.channel as unknown as TicketMessageSourceType
                                }
                            />
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    )

    return (
        <>
            <Card className={css.wrapper}>
                <CardHeader
                    className={css.header}
                    onClick={() => toggleVisibility(!shouldShowList)}
                >
                    <div className={css.title}>
                        List of tickets triggering the rule
                    </div>
                    <div className={css.toggle}>
                        <span className="material-icons ml-2">
                            {shouldShowList
                                ? 'keyboard_arrow_down'
                                : 'keyboard_arrow_up'}
                        </span>
                    </div>
                </CardHeader>
                {shouldShowList && (
                    <CardBody className={css.body}>
                        {loading ? (
                            <Loader minHeight="60px" />
                        ) : !!ticketList.length ? (
                            renderTable(ticketList)
                        ) : (
                            <h5 className="ml-3">
                                This rule has not run on any tickets.
                            </h5>
                        )}
                    </CardBody>
                )}
            </Card>
            {shouldShowList && (
                <div className={css.navigation}>
                    <Navigation
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
                </div>
            )}
        </>
    )
}
