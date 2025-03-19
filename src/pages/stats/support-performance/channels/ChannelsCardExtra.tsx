import { UserRole } from 'config/types/user'
import useAppSelector from 'hooks/useAppSelector'
import css from 'pages/stats/support-performance/agents/AgentsPerformanceCardExtra.less'
import { ChannelsEditColumns } from 'pages/stats/support-performance/channels/ChannelsEditColumns'
import { ChannelsHeatmapSwitch } from 'pages/stats/support-performance/channels/ChannelsHeatmapSwitch'
import { getCurrentUser } from 'state/currentUser/selectors'
import { hasRole } from 'utils'

export const ChannelsCardExtra = () => {
    const currentUser = useAppSelector(getCurrentUser)

    return (
        <div className={css.wrapper}>
            {hasRole(currentUser, UserRole.Admin) && <ChannelsEditColumns />}
            <ChannelsHeatmapSwitch />
        </div>
    )
}
