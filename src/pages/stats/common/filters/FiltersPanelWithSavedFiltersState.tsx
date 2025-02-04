import React, {ComponentProps} from 'react'
import {connect} from 'react-redux'

import {useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters} from 'hooks/reporting/common/useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters'
import {SAVEABLE_FILTERS} from 'pages/stats/common/filters/constants'
import {FiltersPanelComponent} from 'pages/stats/common/filters/FiltersPanel'
import {SavedFilterComponentMap} from 'pages/stats/common/filters/FiltersPanelConfig'
import {RootState} from 'state/types'
import {getStatsFiltersFromSavedFilters} from 'state/ui/stats/selectors'

export const FiltersPanelWithCustomFilters = (
    props: ComponentProps<typeof FiltersPanelComponent>
) => {
    const optionalFilters =
        useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters(
            SAVEABLE_FILTERS
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
    })
)(FiltersPanelWithCustomFilters)
