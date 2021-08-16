import React, {ReactNode} from 'react'
import {useSelector} from 'react-redux'
import {Map, List} from 'immutable'
import {useParams} from 'react-router-dom'
import moment from 'moment'

import {getAgents} from '../../../state/agents/selectors'
import {getTicketViewField, getTicketViewFieldPath} from '../../../config/views'
import {ViewField} from '../../../models/view/types'
import {getViewFilters} from '../../../state/stats/selectors'
import {ViewFilter} from '../../../state/views/types'

import StatViewLink from './StatViewLink'

type Props = {
    agentName: string
    children: ReactNode
}

export default function AssigneeStatViewLink({agentName, children}: Props) {
    const {view} = useParams<{view: string}>()
    const viewFilters = useSelector(getViewFilters(view))
    const agents = useSelector(getAgents) as List<Map<any, any>>
    const agent = agents.find(
        (agent) => (agent!.get('name') as string) === agentName
    )
    const assigneeField = getTicketViewField(ViewField.Assignee)
    let viewName = ''
    const filters: ViewFilter[] = []

    if (!agent && agentName !== 'Unassigned') {
        return <>{children}</>
    }

    if (agent) {
        viewName = `Assigned to: ${agentName}`
        filters.push({
            left: getTicketViewFieldPath(assigneeField),
            operator: 'eq',
            right: agent.get('id') as number,
        })
    } else {
        viewName = 'Unassigned'
        filters.push({
            left: getTicketViewFieldPath(assigneeField),
            operator: 'isEmpty',
        })
    }

    if (viewFilters?.has('period')) {
        const closedField = getTicketViewField(ViewField.Closed)
        filters.push({
            left: getTicketViewFieldPath(closedField),
            operator: 'gte',
            // TODO: remove .utc() after https://linear.app/gorgias/issue/COR-529/display-view-date-filters-in-the-user-timezone
            right: `'${moment(viewFilters.getIn(['period', 'start_datetime']))
                .utc()
                .format()}'`,
        })
        filters.push({
            left: getTicketViewFieldPath(closedField),
            operator: 'lte',
            // TODO: remove .utc() after https://linear.app/gorgias/issue/COR-529/display-view-date-filters-in-the-user-timezone
            right: `'${moment(viewFilters.getIn(['period', 'end_datetime']))
                .utc()
                .format()}'`,
        })
    }

    if (viewFilters?.has('channels')) {
        const filtersList = viewFilters?.get('channels') as List<any>
        filters.push({
            left: getTicketViewFieldPath(getTicketViewField(ViewField.Channel)),
            operator: filtersList.size > 1 ? 'containsAny' : 'eq',
            right: JSON.stringify(
                filtersList.size > 1 ? filtersList.toJS() : filtersList.first()
            ),
        })
    }

    if (viewFilters?.has('integrations')) {
        const filtersList = viewFilters?.get('integrations') as List<any>
        filters.push({
            left: getTicketViewFieldPath(
                getTicketViewField(ViewField.Integrations)
            ),
            operator: filtersList.size > 1 ? 'containsAny' : 'eq',
            right: JSON.stringify(
                filtersList.size > 1 ? filtersList.toJS() : filtersList.first()
            ),
        })
    }

    return (
        <StatViewLink viewName={viewName} filters={filters}>
            {children}
        </StatViewLink>
    )
}
