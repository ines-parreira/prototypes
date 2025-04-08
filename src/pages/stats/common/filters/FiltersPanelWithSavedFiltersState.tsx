import React, { ComponentProps } from 'react'

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
    const exposeQueues = useFlag(FeatureFlagKey.ExposeVoiceQueues)

    return (
        <FiltersPanelComponent
            {...props}
            optionalFilters={
                exposeQueues
                    ? SAVEABLE_FILTERS
                    : SAVEABLE_FILTERS.filter(
                          (filter) => filter !== FilterKey.VoiceQueues,
                      )
            }
        />
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
