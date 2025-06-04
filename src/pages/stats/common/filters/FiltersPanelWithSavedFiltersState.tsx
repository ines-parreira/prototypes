import { ComponentProps, useMemo } from 'react'

import { connect } from 'react-redux'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { FilterKey } from 'models/stat/types'
import { SAVEABLE_FILTERS } from 'pages/stats/common/filters/constants'
import { FiltersPanelComponent } from 'pages/stats/common/filters/FiltersPanel'
import { SavedFilterComponentMap } from 'pages/stats/common/filters/FiltersPanelConfig'
import { RootState } from 'state/types'
import { getStatsFiltersFromSavedFilters } from 'state/ui/stats/selectors'

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
