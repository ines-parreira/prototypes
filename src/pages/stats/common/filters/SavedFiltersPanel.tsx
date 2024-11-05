import {connect} from 'react-redux'

import {FilterKey} from 'models/stat/types'
import {FiltersPanelComponent} from 'pages/stats/common/filters/FiltersPanel'
import {SavedFilterComponentMap} from 'pages/stats/common/filters/FiltersPanelConfig'
import {RootState} from 'state/types'
import {getStatsFiltersFromSavedFilters} from 'state/ui/stats/selectors'

export const SAVABLE_FILTERS = [
    FilterKey.CustomFields,
    FilterKey.Channels,
    FilterKey.Integrations,
    FilterKey.Agents,
    FilterKey.Tags,
    FilterKey.Score,
    FilterKey.Campaigns,
    FilterKey.CampaignStatuses,
]

export const SavedFiltersPanel = connect((state: RootState) => ({
    cleanStatsFilters: getStatsFiltersFromSavedFilters(state),
    optionalFilters: SAVABLE_FILTERS,
    persistentFilters: undefined,
    filterSettingsOverrides: undefined,
    filterComponentMap: SavedFilterComponentMap,
}))(FiltersPanelComponent)
