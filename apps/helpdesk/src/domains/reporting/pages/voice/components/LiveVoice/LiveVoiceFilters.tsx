import { useMemo } from 'react'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { useCleanStatsFilters } from 'domains/reporting/hooks/useCleanStatsFilters'
import {
    FilterComponentKey,
    FilterKey,
    StaticFilter,
} from 'domains/reporting/models/stat/types'
import FiltersPanelWrapper from 'domains/reporting/pages/common/filters/FiltersPanelWrapper'
import DashboardGridCell from 'domains/reporting/pages/common/layout/DashboardGridCell'
import DashboardSection from 'domains/reporting/pages/common/layout/DashboardSection'

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
