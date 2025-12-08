import { FeatureFlagKey } from '@repo/feature-flags'

import { useFlag } from 'core/flags'
import { FilterKey } from 'domains/reporting/models/stat/types'
import type { OptionalFilter } from 'domains/reporting/pages/common/filters/FiltersPanel'

export const usePermittedFilters = (optionalFilters: OptionalFilter[]) => {
    const isAssignedTeamFilterEnabled = useFlag(
        FeatureFlagKey.ReportingAssignedTeamFilter,
    )

    if (!isAssignedTeamFilterEnabled) {
        return optionalFilters.filter(
            (filter: OptionalFilter) => filter !== FilterKey.AssignedTeam,
        )
    }

    return optionalFilters
}
