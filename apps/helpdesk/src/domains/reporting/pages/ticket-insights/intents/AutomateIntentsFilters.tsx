import { useCleanStatsFilters } from 'domains/reporting/hooks/useCleanStatsFilters'
import ChannelsStatsFilter from 'domains/reporting/pages/common/filters/DEPRECATED_ChannelsStatsFilter'
import PeriodStatsFilter from 'domains/reporting/pages/common/filters/DEPRECATED_PeriodStatsFilter'
import { AUTOMATION_INTENTS_CHANNELS } from 'domains/reporting/pages/constants'
import { getStatsFilters } from 'domains/reporting/state/stats/selectors'
import useAppSelector from 'hooks/useAppSelector'

export const AutomateIntentsFilters = () => {
    useCleanStatsFilters()
    const statsFilters = useAppSelector(getStatsFilters)

    return (
        <>
            <ChannelsStatsFilter
                value={statsFilters.channels}
                channelsFilter={AUTOMATION_INTENTS_CHANNELS}
            />
            <PeriodStatsFilter value={statsFilters.period} />
        </>
    )
}
