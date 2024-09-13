import React from 'react'
import {getCurrentUser} from 'state/currentUser/selectors'
import useAppSelector from 'hooks/useAppSelector'
import {UserRole} from 'config/types/user'
import {hasRole} from 'utils'

import {AgentsEditColumns} from 'pages/stats/support-performance/agents/AgentsEditColumns'
import {AgentPerformanceHeatmapSwitch} from 'pages/stats/support-performance/agents/AgentPerformanceHeatmapSwitch'
import css from 'pages/stats/support-performance/agents/AgentsPerformanceCardExtra.less'

export const AgentsPerformanceCardExtra = () => {
    const currentUser = useAppSelector(getCurrentUser)

    return (
        <div className={css.wrapper}>
            {hasRole(currentUser, UserRole.Admin) && <AgentsEditColumns />}
            <AgentPerformanceHeatmapSwitch />
        </div>
    )
}
