import { UserRole } from 'config/types/user'
import css from 'domains/reporting/pages/support-performance/agents/AgentsPerformanceCardExtra.less'
import { ChannelsEditColumns } from 'domains/reporting/pages/support-performance/channels/ChannelsEditColumns'
import { ChannelsHeatmapSwitch } from 'domains/reporting/pages/support-performance/channels/ChannelsHeatmapSwitch'
import useAppSelector from 'hooks/useAppSelector'
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
