import { useCleanStatsFilters } from 'domains/reporting/hooks/useCleanStatsFilters'
import DEPRECATED_AgentsStatsFilter from 'domains/reporting/pages/common/filters/DEPRECATED_AgentsStatsFilter'
import ChannelsStatsFilter from 'domains/reporting/pages/common/filters/DEPRECATED_ChannelsStatsFilter'
import { getStatsFilters } from 'domains/reporting/state/stats/selectors'
import useAppSelector from 'hooks/useAppSelector'

export const LiveAgentsFilters = () => {
    useCleanStatsFilters()
    const statsFilters = useAppSelector(getStatsFilters)

    return (
        <>
            <ChannelsStatsFilter value={statsFilters.channels} />
            <DEPRECATED_AgentsStatsFilter value={statsFilters.agents} />
        </>
    )
}
