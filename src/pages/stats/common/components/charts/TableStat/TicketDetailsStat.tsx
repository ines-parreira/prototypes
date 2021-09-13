import React, {useMemo} from 'react'
import {useSelector} from 'react-redux'

import {
    TicketMessageSourceType,
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
import {EqualityOperator} from '../../../../../../state/rules/types'
import {getStatsViewFilters} from '../../../utils'
import ViewLink from '../../../ViewLink'
import * as segmentTracker from '../../../../../../store/middlewares/segmentTracker.js'

import css from './TicketDetailsStat.less'

type Props = {
    agentName: string
    agentId: number
    openTickets: number
    channelsBreakdown: Record<TicketMessageSourceType, number>
}

export default function TicketDetailsStat({
    agentName,
    agentId,
    openTickets,
    channelsBreakdown,
}: Props) {
    const statsFilters = useSelector(getLiveAgentsStatsFilters)
    const filters = useMemo<ViewFilter[]>(() => {
        const periodFilterLeft = getTicketViewFieldPath(
            getTicketViewField(ViewField.Closed)
        )
        const assigneeFilterLeft = getTicketViewFieldPath(
            getTicketViewField(ViewField.Assignee)
        )
        const statsViewFilters = getStatsViewFilters(
            periodFilterLeft,
            statsFilters
        ).filter(
            (filter) =>
                filter.left !== periodFilterLeft &&
                filter.left !== assigneeFilterLeft
        )
        return [
            {
                left: assigneeFilterLeft,
                operator: EqualityOperator.Eq,
                right: agentId,
            },
            {
                left: getTicketViewFieldPath(
                    getTicketViewField(ViewField.Status)
                ),
                operator: EqualityOperator.Eq,
                right: JSON.stringify(TicketStatus.Open),
            },
            ...statsViewFilters,
        ]
    }, [agentId, statsFilters])

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
                    filters={filters}
                    onClick={() => {
                        segmentTracker.logEvent(
                            segmentTracker.EVENTS.STAT_VIEW_LINK_CLICKED,
                            {
                                stat: 'tickets-open-per-agent-live',
                            }
                        )
                    }}
                >
                    {openTickets}
                </ViewLink>
            </div>
            <div className={css.separator} />
            <div className={css.channelsBreakdown}>
                {(Object.keys(
                    channelsBreakdown
                ) as TicketMessageSourceType[]).map((key) => {
                    return channelsBreakdown[key] ? (
                        <div key={key} className={css.channel}>
                            <SourceIcon
                                type={key}
                                className={css.channelIcon}
                            />
                            {channelsBreakdown[key]}
                        </div>
                    ) : null
                })}
            </div>
        </div>
    )
}
