import React, {useMemo} from 'react'
import {useSelector} from 'react-redux'

import {
    TicketChannel,
    TicketStatus,
} from '../../../../../../business/types/ticket'
import SourceIcon from '../../../../../common/components/SourceIcon'
import {getLiveAgentsStatsFilters} from '../../../../../../state/stats/selectors'
import {ViewFilter} from '../../../../../../state/views/types'
import {
    getTicketViewField,
    getTicketViewFieldPath,
} from '../../../../../../config/views'
import {ViewField} from '../../../../../../models/view/types'
import {getStatsViewFilters} from '../../../utils'
import * as segmentTracker from '../../../../../../store/middlewares/segmentTracker.js'
import {EqualityOperator} from '../../../../../../state/rules/types'
import ViewLink from '../../../ViewLink'
import {TICKET_CHANNEL_NAMES} from '../../../../../../state/ticket/constants'
import {
    SegmentEvent,
    StatViewLinkClickedStat,
} from '../../../../../../store/middlewares/types/segmentTracker'

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
    channelsBreakdown: Record<TicketChannel, number>
    assigneeFilterLeft?: string
    statusFilter?: ViewFilter
}

export default function TicketDetailsStat({
    agentName,
    agentId,
    openTickets,
    channelsBreakdown,
}: Props) {
    const statsFilters = useSelector(getLiveAgentsStatsFilters)

    const assigneeFilter = useMemo<ViewFilter>(
        () => ({
            left: ASSIGNEE_FILTER_LEFT,
            operator: EqualityOperator.Eq,
            right: agentId,
        }),
        [agentId]
    )

    const baseFilters = useMemo<ViewFilter[]>(() => {
        const periodFilterLeft = getTicketViewFieldPath(
            getTicketViewField(ViewField.Closed)
        )
        return getStatsViewFilters(periodFilterLeft, statsFilters).filter(
            (filter) =>
                filter.left !== periodFilterLeft &&
                filter.left !== ASSIGNEE_FILTER_LEFT
        )
    }, [statsFilters])

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
                        segmentTracker.logEvent(
                            SegmentEvent.StatViewLinkClicked,
                            {
                                stat: StatViewLinkClickedStat.TicketsOpenPerAgentLive,
                            }
                        )
                    }}
                >
                    {openTickets}
                </ViewLink>
            </div>
            <div className={css.separator} />
            <div className={css.channelsBreakdown}>
                {(
                    Object.entries(channelsBreakdown) as [
                        TicketChannel,
                        number
                    ][]
                ).map(([channel, ticketsNumber]) => {
                    return ticketsNumber ? (
                        <div key={channel} className={css.channel}>
                            <SourceIcon
                                type={channel}
                                className={css.channelIcon}
                            />
                            <ViewLink
                                viewName={`Open tickets assigned to: ${agentName}, channel: ${TICKET_CHANNEL_NAMES[channel]}`}
                                filters={channelFilters[channel]}
                                onClick={() => {
                                    segmentTracker.logEvent(
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
                    ) : null
                })}
            </div>
        </div>
    )
}
