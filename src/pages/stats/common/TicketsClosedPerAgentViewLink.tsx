import React, {ReactNode, useMemo} from 'react'
import {useSelector} from 'react-redux'

import {getSupportPerformanceAgentsStatsFilters} from '../../../state/stats/selectors'
import {getTicketViewField, getTicketViewFieldPath} from '../../../config/views'
import {ViewField} from '../../../models/view/types'
import * as segmentTracker from '../../../store/middlewares/segmentTracker.js'

import AssigneeViewLink from './AssigneeViewLink'
import {getStatsViewFilters} from './utils'

type Props = {
    agentName: string
    children: ReactNode
}

export default function TicketsClosedPerAgentViewLink({
    agentName,
    children,
}: Props) {
    const statsFilters = useSelector(getSupportPerformanceAgentsStatsFilters)
    const filters = useMemo(() => {
        const periodFilterLeft = getTicketViewFieldPath(
            getTicketViewField(ViewField.Closed)
        )
        return getStatsViewFilters(periodFilterLeft, statsFilters)
    }, [statsFilters])
    return (
        <span
            onClick={() => {
                segmentTracker.logEvent(
                    segmentTracker.EVENTS.STAT_VIEW_LINK_CLICKED,
                    {
                        stat: 'tickets-closed-per-agent-total',
                    }
                )
            }}
        >
            <AssigneeViewLink agentName={agentName} filters={filters}>
                {children}
            </AssigneeViewLink>
        </span>
    )
}
