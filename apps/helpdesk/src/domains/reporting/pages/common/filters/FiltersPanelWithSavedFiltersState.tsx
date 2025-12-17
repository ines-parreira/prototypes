import type { ComponentProps } from 'react'
import { useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { connect } from 'react-redux'

import { FilterKey } from 'domains/reporting/models/stat/types'
import { SAVEABLE_FILTERS } from 'domains/reporting/pages/common/filters/constants'
import { FiltersPanelComponent } from 'domains/reporting/pages/common/filters/FiltersPanel'
import { SavedFilterComponentMap } from 'domains/reporting/pages/common/filters/FiltersPanelConfig'
import { getStatsFiltersFromSavedFilters } from 'domains/reporting/state/ui/stats/selectors'
import type { RootState } from 'state/types'

export const FiltersPanelWithCustomFilters = (
    props: ComponentProps<typeof FiltersPanelComponent>,
) => {
    const isDuringBusinessHoursEnabled = useFlag(
        FeatureFlagKey.VoiceCallDuringBusinessHours,
    )

    const optionalFilters = useMemo(() => {
        let filters = [...SAVEABLE_FILTERS]

        if (!isDuringBusinessHoursEnabled) {
            filters = filters.filter(
                (filter) => filter !== FilterKey.IsDuringBusinessHours,
            )
        }
        return filters
    }, [isDuringBusinessHoursEnabled])

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
