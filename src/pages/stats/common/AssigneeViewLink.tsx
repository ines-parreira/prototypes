import React, {ReactNode, useMemo} from 'react'
import {useSelector} from 'react-redux'
import {Map, List} from 'immutable'

import {getAgents} from '../../../state/agents/selectors'
import {getTicketViewField, getTicketViewFieldPath} from '../../../config/views'
import {ViewField} from '../../../models/view/types'
import {ViewFilter} from '../../../state/views/types'
import {CollectionOperator, EqualityOperator} from '../../../state/rules/types'

import ViewLink from './ViewLink'

type Props = {
    agentName: string
    filters: ViewFilter[]
    children: ReactNode
}

export default function AssigneeViewLink({
    agentName,
    children,
    filters,
}: Props) {
    const agents = useSelector(getAgents) as List<Map<any, any>>
    const agent = agents.find(
        (agent) => (agent!.get('name') as string) === agentName
    )
    const assigneeFilters = useMemo<ViewFilter[]>(() => {
        const left = getTicketViewFieldPath(
            getTicketViewField(ViewField.Assignee)
        )
        return agent
            ? [
                  {
                      left,
                      operator: EqualityOperator.Eq,
                      right: agent.get('id') as number,
                  },
              ]
            : [
                  {
                      left,
                      operator: CollectionOperator.IsEmpty,
                  },
              ]
    }, [agent])
    const viewLinkFilters = useMemo(() => {
        return assigneeFilters.concat(filters)
    }, [filters, assigneeFilters])

    if (!agent && agentName !== 'Unassigned') {
        return <>{children}</>
    }

    return (
        <ViewLink
            viewName={agent ? `Assigned to: ${agentName}` : 'Unassigned'}
            filters={viewLinkFilters}
        >
            {children}
        </ViewLink>
    )
}
