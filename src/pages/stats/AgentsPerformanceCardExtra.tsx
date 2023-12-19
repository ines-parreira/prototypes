import React from 'react'
import {getCurrentUser} from 'state/currentUser/selectors'
import useAppSelector from 'hooks/useAppSelector'
import {UserRole} from 'config/types/user'
import {hasRole} from 'utils'

import {AgentsEditColumns} from './AgentsEditColumns'
import {AgentPerformanceHeatmapSwitch} from './AgentPerformanceHeatmapSwitch'
import css from './AgentsPerformanceCardExtra.less'

export const AgentsPerformanceCardExtra = () => {
    const currentUser = useAppSelector(getCurrentUser)

    return (
        <div className={css.wrapper}>
            {hasRole(currentUser, UserRole.Admin) && <AgentsEditColumns />}
            <AgentPerformanceHeatmapSwitch />
        </div>
    )
}
