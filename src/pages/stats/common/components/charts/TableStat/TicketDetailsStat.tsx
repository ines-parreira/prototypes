import React, {useMemo} from 'react'

import {reportError} from 'utils/errors'
import {TicketChannel, TicketStatus} from 'business/types/ticket'
import SourceIcon from 'pages/common/components/SourceIcon'
import {ViewFilter} from 'state/views/types'
import {getTicketViewField, getTicketViewFieldPath} from 'config/views'
import {ViewField} from 'models/view/types'
import {
    logEvent,
    SegmentEvent,
    StatViewLinkClickedStat,
} from 'store/middlewares/segmentTracker'
import {EqualityOperator} from 'state/rules/types'
import {TICKET_CHANNEL_NAMES} from 'state/ticket/constants'

import ViewLink from '../../../ViewLink'
import {useStatsViewFilters} from '../../../utils'

import css from './TicketDetailsStat.less'

const ASSIGNEE_FILTER_LEFT = getTicketViewFieldPath(
    getTicketViewField(ViewField.Assignee)
)

const STATUS_FILTER = {
    left: getTicketViewFieldPath(getTicketViewField(ViewField.Status)),
    operator: EqualityOperator.Eq,
    right: JSON.stringify(TicketStatus.Open),
}

type Props = {
    agentName: string
    agentId: number
    openTickets: number
    channelsBreakdown: Partial<Record<string, number>>
    assigneeFilterLeft?: string
    statusFilter?: ViewFilter
}

export default function TicketDetailsStat({
    agentName,
    agentId,
    openTickets,
    channelsBreakdown,
}: Props) {
    const periodFilterLeft = getTicketViewFieldPath(
        getTicketViewField(ViewField.Closed)
    )
    const statsViewFilters = useStatsViewFilters(periodFilterLeft)

    const assigneeFilter = useMemo<ViewFilter>(
        () => ({
            left: ASSIGNEE_FILTER_LEFT,
            operator: EqualityOperator.Eq,
            right: agentId,
        }),
        [agentId]
    )

    const baseFilters = useMemo<ViewFilter[]>(() => {
        return statsViewFilters.filter(
            (filter) =>
                filter.left !== periodFilterLeft &&
                filter.left !== ASSIGNEE_FILTER_LEFT
        )
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statsViewFilters])

    const openTicketsFilters = useMemo<ViewFilter[]>(
        () => [assigneeFilter, STATUS_FILTER, ...baseFilters],
        [assigneeFilter, baseFilters]
    )

    const channelFilters = useMemo<Record<TicketChannel, ViewFilter[]>>(() => {
        const channelFilterLeft = getTicketViewFieldPath(
            getTicketViewField(ViewField.Channel)
        )
        return Object.values(TicketChannel).reduce(
            (acc, channel) => ({
                ...acc,
                [channel]: [
                    assigneeFilter,
                    STATUS_FILTER,
                    {
                        left: channelFilterLeft,
                        operator: EqualityOperator.Eq,
                        right: JSON.stringify(channel),
                    },
                    ...baseFilters.filter(
                        (filter) => filter.left !== channelFilterLeft
                    ),
                ],
            }),
            {} as Record<TicketChannel, ViewFilter[]>
        )
    }, [assigneeFilter, baseFilters])

    if (!openTickets) {
        return (
            <div className={css.empty}>
                No open tickets assigned to this agent
            </div>
        )
    }

    return (
        <div className={css.wrapper}>
            <div className={css.openTickets}>
                <ViewLink
                    viewName={`Open tickets assigned to: ${agentName}`}
                    filters={openTicketsFilters}
                    onClick={() => {
                        logEvent(SegmentEvent.StatViewLinkClicked, {
                            stat: StatViewLinkClickedStat.TicketsOpenPerAgentLive,
                        })
                    }}
                >
                    {openTickets}
                </ViewLink>
            </div>
            <div className={css.separator} />
            <div className={css.channelsBreakdown}>
                {(Object.entries(channelsBreakdown) as [string, number][]).map(
                    ([name, ticketsNumber]) => {
                        if (!ticketsNumber) {
                            return null
                        } else if (!channelFilters[name as TicketChannel]) {
                            reportError(
                                new Error(
                                    `Channel not found for the name: ${name}`
                                )
                            )
                            return (
                                <div
                                    key={name}
                                    className={css.channel}
                                    title={name}
                                >
                                    <i
                                        className={`material-icons ${css.channelIcon}`}
                                    >
                                        live_help
                                    </i>
                                    {ticketsNumber}
                                </div>
                            )
                        }
                        const channelName = name as TicketChannel
                        return (
                            <div
                                key={channelName}
                                className={css.channel}
                                title={TICKET_CHANNEL_NAMES[channelName]}
                            >
                                <SourceIcon
                                    type={channelName}
                                    className={css.channelIcon}
                                />
                                <ViewLink
                                    viewName={`Open tickets assigned to: ${agentName}, channel: ${TICKET_CHANNEL_NAMES[channelName]}`}
                                    filters={channelFilters[channelName]}
                                    onClick={() => {
                                        logEvent(
                                            SegmentEvent.StatViewLinkClicked,
                                            {
                                                stat: StatViewLinkClickedStat.TicketsOpenPerAgentPerChannelLive,
                                            }
                                        )
                                    }}
                                >
                                    {ticketsNumber}
                                </ViewLink>
                            </div>
                        )
                    }
                )}
            </div>
        </div>
    )
}
