import React from 'react'

import {UserRole} from 'config/types/user'
import useAppSelector from 'hooks/useAppSelector'

import {AgentPerformanceHeatmapSwitch} from 'pages/stats/support-performance/agents/AgentPerformanceHeatmapSwitch'
import {AgentsEditColumns} from 'pages/stats/support-performance/agents/AgentsEditColumns'
import css from 'pages/stats/support-performance/agents/AgentsPerformanceCardExtra.less'
import {getCurrentUser} from 'state/currentUser/selectors'
import {hasRole} from 'utils'

export const AgentsPerformanceCardExtra = () => {
    const currentUser = useAppSelector(getCurrentUser)

    return (
        <div className={css.wrapper}>
            {hasRole(currentUser, UserRole.Admin) && <AgentsEditColumns />}
            <AgentPerformanceHeatmapSwitch />
        </div>
    )
}
