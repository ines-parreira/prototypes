import React from 'react'
import {ChannelsHeatmapSwitch} from 'pages/stats/support-performance/channels/ChannelsHeatmapSwitch'
import {getCurrentUser} from 'state/currentUser/selectors'
import useAppSelector from 'hooks/useAppSelector'
import {UserRole} from 'config/types/user'
import {hasRole} from 'utils'

import {ChannelsEditColumns} from 'pages/stats/support-performance/channels/ChannelsEditColumns'
import css from 'pages/stats/AgentsPerformanceCardExtra.less'

export const ChannelsCardExtra = () => {
    const currentUser = useAppSelector(getCurrentUser)

    return (
        <div className={css.wrapper}>
            {hasRole(currentUser, UserRole.Admin) && <ChannelsEditColumns />}
            <ChannelsHeatmapSwitch />
        </div>
    )
}
