import React, { useMemo } from 'react'

import {
    logEvent,
    reportError,
    SegmentEvent,
    StatViewLinkClickedStat,
} from '@repo/logging'

import { TicketStatus } from 'business/types/ticket'
import { getTicketViewField, getTicketViewFieldPath } from 'config/views'
import css from 'domains/reporting/pages/common/components/charts/TableStat/TicketDetailsStat.less'
import { useStatsViewFilters } from 'domains/reporting/pages/common/utils'
import ViewLink from 'domains/reporting/pages/common/ViewLink'
import { ViewField } from 'models/view/types'
import SourceIcon from 'pages/common/components/SourceIcon'
import { getChannels } from 'services/channels'
import { EqualityOperator } from 'state/rules/types'
import { humanizeChannel } from 'state/ticket/utils'
import type { ViewFilter } from 'state/views/types'

const ASSIGNEE_FILTER_LEFT = getTicketViewFieldPath(
    getTicketViewField(ViewField.Assignee),
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
        getTicketViewField(ViewField.Closed),
    )
    const statsViewFilters = useStatsViewFilters(periodFilterLeft)

    const assigneeFilter = useMemo<ViewFilter>(
        () => ({
            left: ASSIGNEE_FILTER_LEFT,
            operator: EqualityOperator.Eq,
            right: agentId,
        }),
        [agentId],
    )

    const baseFilters = useMemo<ViewFilter[]>(() => {
        return statsViewFilters.filter(
            (filter) =>
                filter.left !== periodFilterLeft &&
                filter.left !== ASSIGNEE_FILTER_LEFT,
        )
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statsViewFilters])

    const openTicketsFilters = useMemo<ViewFilter[]>(
        () => [assigneeFilter, STATUS_FILTER, ...baseFilters],
        [assigneeFilter, baseFilters],
    )

    const channelFilters = useMemo<Record<string, ViewFilter[]>>(() => {
        const channelFilterLeft = getTicketViewFieldPath(
            getTicketViewField(ViewField.Channel),
        )
        return getChannels().reduce<Record<string, ViewFilter[]>>(
            (acc, channel) => ({
                ...acc,
                [channel.slug]: [
                    assigneeFilter,
                    STATUS_FILTER,
                    {
                        left: channelFilterLeft,
                        operator: EqualityOperator.Eq,
                        right: JSON.stringify(channel.slug),
                    },
                    ...baseFilters.filter(
                        (filter) => filter.left !== channelFilterLeft,
                    ),
                ],
            }),
            {},
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
                {Object.entries(channelsBreakdown).map(
                    ([channel, ticketsNumber]) => {
                        if (!ticketsNumber) {
                            return null
                        } else if (!channelFilters[channel]) {
                            reportError(
                                new Error(
                                    `Channel not found for the name: ${channel}`,
                                ),
                            )
                            return (
                                <div
                                    key={channel}
                                    className={css.channel}
                                    title={humanizeChannel(channel)}
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

                        return (
                            <div
                                key={channel}
                                className={css.channel}
                                title={humanizeChannel(channel)}
                            >
                                <SourceIcon
                                    type={channel}
                                    className={css.channelIcon}
                                />
                                <ViewLink
                                    viewName={`Open tickets assigned to: ${agentName}, channel: ${humanizeChannel(
                                        channel,
                                    )}`}
                                    filters={channelFilters[channel]}
                                    onClick={() => {
                                        logEvent(
                                            SegmentEvent.StatViewLinkClicked,
                                            {
                                                stat: StatViewLinkClickedStat.TicketsOpenPerAgentPerChannelLive,
                                            },
                                        )
                                    }}
                                >
                                    {ticketsNumber}
                                </ViewLink>
                            </div>
                        )
                    },
                )}
            </div>
        </div>
    )
}
