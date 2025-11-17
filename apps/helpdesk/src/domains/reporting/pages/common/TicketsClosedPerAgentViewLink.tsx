import type { ReactNode } from 'react'
import React, { useMemo } from 'react'

import { logEvent, SegmentEvent, StatViewLinkClickedStat } from '@repo/logging'
import type { List, Map } from 'immutable'

import { getTicketViewField, getTicketViewFieldPath } from 'config/views'
import { useStatsViewFilters } from 'domains/reporting/pages/common/utils'
import ViewLink from 'domains/reporting/pages/common/ViewLink'
import useAppSelector from 'hooks/useAppSelector'
import { ViewField } from 'models/view/types'
import { getHumanAgents } from 'state/agents/selectors'
import { CollectionOperator, EqualityOperator } from 'state/rules/types'
import type { ViewFilter } from 'state/views/types'

type Props = {
    agentName: string
    unassignedName?: string
    children: ReactNode
}

export default function TicketsClosedPerAgentViewLink({
    agentName,
    children,
    unassignedName = 'Unassigned',
}: Props) {
    const agents = useAppSelector(getHumanAgents) as List<Map<any, any>>
    const agent = agents.find(
        (agent) => (agent!.get('name') as string) === agentName,
    )
    const statsViewFilters = useStatsViewFilters(
        getTicketViewFieldPath(getTicketViewField(ViewField.Closed)),
    )
    const filters = useMemo<ViewFilter[]>(() => {
        const assigneeLeft = getTicketViewFieldPath(
            getTicketViewField(ViewField.Assignee),
        )
        const assigneeFilter: ViewFilter = agent
            ? {
                  left: assigneeLeft,
                  operator: EqualityOperator.Eq,
                  right: agent.get('id') as number,
              }
            : {
                  left: assigneeLeft,
                  operator: CollectionOperator.IsEmpty,
              }

        return [
            assigneeFilter,
            ...statsViewFilters.filter(
                (filter) => filter.left !== assigneeLeft,
            ),
        ]
    }, [agent, statsViewFilters])

    if (!agent && agentName !== unassignedName) {
        return <>{children}</>
    }

    return (
        <span
            onClick={() => {
                logEvent(SegmentEvent.StatViewLinkClicked, {
                    stat: StatViewLinkClickedStat.TicketsClosedPerAgentTotal,
                })
            }}
        >
            <ViewLink
                viewName={
                    agentName === unassignedName
                        ? 'Unassigned'
                        : `Assigned to: ${agentName}`
                }
                filters={filters}
            >
                {children}
            </ViewLink>
        </span>
    )
}
