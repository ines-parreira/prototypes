import {connect} from 'react-redux'

import {SAVABLE_FILTERS} from 'models/reporting/types'

import {FiltersPanelComponent} from 'pages/stats/common/filters/FiltersPanel'
import {SavedFilterComponentMap} from 'pages/stats/common/filters/FiltersPanelConfig'
import {RootState} from 'state/types'
import {getStatsFiltersFromSavedFilters} from 'state/ui/stats/selectors'

export const FiltersPanelWithSavedFiltersState = connect(
    (state: RootState) => ({
        cleanStatsFilters: getStatsFiltersFromSavedFilters(state),
        optionalFilters: SAVABLE_FILTERS,
        persistentFilters: undefined,
        filterSettingsOverrides: undefined,
        filterComponentMap: SavedFilterComponentMap,
    })
)(FiltersPanelComponent)
