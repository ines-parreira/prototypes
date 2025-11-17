import { useMemo } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'

import { useFlag } from 'core/flags'
import { useCleanStatsFilters } from 'domains/reporting/hooks/useCleanStatsFilters'
import type { StaticFilter } from 'domains/reporting/models/stat/types'
import {
    FilterComponentKey,
    FilterKey,
} from 'domains/reporting/models/stat/types'
import FiltersPanelWrapper from 'domains/reporting/pages/common/filters/FiltersPanelWrapper'
import DashboardGridCell from 'domains/reporting/pages/common/layout/DashboardGridCell'
import DashboardSection from 'domains/reporting/pages/common/layout/DashboardSection'

const LIVE_VOICE_PERSISTENT_FILTERS: StaticFilter[] = [
    FilterComponentKey.PhoneIntegrations,
    FilterKey.Agents,
    FilterKey.VoiceQueues,
]

export default function LiveVoiceFilters() {
    useCleanStatsFilters()

    const isDuringBusinessHoursEnabled = useFlag(
        FeatureFlagKey.VoiceCallDuringBusinessHours,
    )

    const persistentFilters = useMemo(() => {
        const filters = [...LIVE_VOICE_PERSISTENT_FILTERS]

        if (isDuringBusinessHoursEnabled) {
            filters.push(FilterKey.IsDuringBusinessHours)
        }

        return filters
    }, [isDuringBusinessHoursEnabled])

    return (
        <DashboardSection>
            <DashboardGridCell size={12}>
                <FiltersPanelWrapper persistentFilters={persistentFilters} />
            </DashboardGridCell>
        </DashboardSection>
    )
}
