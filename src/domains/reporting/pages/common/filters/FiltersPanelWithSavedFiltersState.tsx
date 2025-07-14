import { ComponentProps, useMemo } from 'react'

import { connect } from 'react-redux'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { SAVEABLE_FILTERS } from 'domains/reporting/pages/common/filters/constants'
import { FiltersPanelComponent } from 'domains/reporting/pages/common/filters/FiltersPanel'
import { SavedFilterComponentMap } from 'domains/reporting/pages/common/filters/FiltersPanelConfig'
import { getStatsFiltersFromSavedFilters } from 'domains/reporting/state/ui/stats/selectors'
import { RootState } from 'state/types'

export const FiltersPanelWithCustomFilters = (
    props: ComponentProps<typeof FiltersPanelComponent>,
) => {
    const isDuringBusinessHoursEnabled = useFlag(
        FeatureFlagKey.VoiceCallDuringBusinessHours,
    )
    const optionalFilters = useMemo(
        () =>
            isDuringBusinessHoursEnabled
                ? SAVEABLE_FILTERS
                : SAVEABLE_FILTERS.filter(
                      (filter) => filter !== FilterKey.IsDuringBusinessHours,
                  ),
        [isDuringBusinessHoursEnabled],
    )

    return (
        <FiltersPanelComponent {...props} optionalFilters={optionalFilters} />
    )
}

export const FiltersPanelWithSavedFiltersState = connect(
    (state: RootState) => ({
        cleanStatsFilters: getStatsFiltersFromSavedFilters(state),
        persistentFilters: undefined,
        filterSettingsOverrides: undefined,
        filterComponentMap: SavedFilterComponentMap,
    }),
)(FiltersPanelWithCustomFilters)
