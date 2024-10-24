import {combineReducers} from 'redux'

import {
    busiestTimesSlice,
    BusiestTimesState,
} from 'state/ui/stats/busiestTimesSlice'
import {ChannelsSlice, channelsSlice} from 'state/ui/stats/channelsSlice'
import {drillDownSlice, DrillDownState} from 'state/ui/stats/drillDownSlice'
import {
    fetchingMapSlice,
    FetchingMapSliceState,
} from 'state/ui/stats/fetchingMapSlice'
import {filtersSlice, FiltersSliceState} from 'state/ui/stats/filtersSlice'
import {statsTablesReducer} from 'state/ui/stats/statsTablesReducer'
import {tagsReportSlice, TagsReportState} from 'state/ui/stats/tagsReportSlice'
import {
    ticketInsightsSlice,
    TicketInsightsState,
} from 'state/ui/stats/ticketInsightsSlice'
import {StatsTablesState} from 'state/ui/stats/types'

export type StatsState = {
    [fetchingMapSlice.name]: FetchingMapSliceState
    [filtersSlice.name]: FiltersSliceState
    statsTables: StatsTablesState
    [channelsSlice.name]: ChannelsSlice
    [tagsReportSlice.name]: TagsReportState
    [ticketInsightsSlice.name]: TicketInsightsState
    [drillDownSlice.name]: DrillDownState
    [busiestTimesSlice.name]: BusiestTimesState
}

const statsReducer = combineReducers({
    [busiestTimesSlice.name]: busiestTimesSlice.reducer,
    [channelsSlice.name]: channelsSlice.reducer,
    [drillDownSlice.name]: drillDownSlice.reducer,
    [fetchingMapSlice.name]: fetchingMapSlice.reducer,
    [filtersSlice.name]: filtersSlice.reducer,
    [tagsReportSlice.name]: tagsReportSlice.reducer,
    [ticketInsightsSlice.name]: ticketInsightsSlice.reducer,
    statsTables: statsTablesReducer,
})

export default statsReducer
