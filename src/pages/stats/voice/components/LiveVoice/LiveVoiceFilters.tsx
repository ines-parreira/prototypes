import { useMemo } from 'react'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { useCleanStatsFilters } from 'hooks/reporting/useCleanStatsFilters'
import { FilterComponentKey, FilterKey, StaticFilter } from 'models/stat/types'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import DashboardGridCell from 'pages/stats/common/layout/DashboardGridCell'
import DashboardSection from 'pages/stats/common/layout/DashboardSection'

export default function LiveVoiceFilters() {
    useCleanStatsFilters()

    const isDuringBusinessHoursEnabled = useFlag(
        FeatureFlagKey.VoiceCallDuringBusinessHours,
    )

    const persistentFilters: StaticFilter[] = useMemo(() => {
        return isDuringBusinessHoursEnabled
            ? [
                  FilterComponentKey.PhoneIntegrations,
                  FilterKey.Agents,
                  FilterKey.VoiceQueues,
                  FilterKey.IsDuringBusinessHours,
              ]
            : [
                  FilterComponentKey.PhoneIntegrations,
                  FilterKey.Agents,
                  FilterKey.VoiceQueues,
              ]
    }, [isDuringBusinessHoursEnabled])

    return (
        <DashboardSection>
            <DashboardGridCell size={12}>
                <FiltersPanelWrapper persistentFilters={persistentFilters} />
            </DashboardGridCell>
        </DashboardSection>
    )
}
