import { combineReducers } from 'redux'

import {
    busiestTimesSlice,
    BusiestTimesState,
} from 'domains/reporting/state/ui/stats/busiestTimesSlice'
import {
    ChannelsSlice,
    channelsSlice,
} from 'domains/reporting/state/ui/stats/channelsSlice'
import {
    drillDownSlice,
    DrillDownState,
} from 'domains/reporting/state/ui/stats/drillDownSlice'
import {
    fetchingMapSlice,
    FetchingMapSliceState,
} from 'domains/reporting/state/ui/stats/fetchingMapSlice'
import {
    filtersSlice,
    FiltersSliceState,
} from 'domains/reporting/state/ui/stats/filtersSlice'
import {
    qualityManagementSlice,
    QualityManagementState,
} from 'domains/reporting/state/ui/stats/qualityManagementSlice'
import {
    sidePanelSlice,
    SidePanelState,
} from 'domains/reporting/state/ui/stats/sidePanelSlice'
import { statsTablesReducer } from 'domains/reporting/state/ui/stats/statsTablesReducer'
import {
    tagsReportSlice,
    TagsReportState,
} from 'domains/reporting/state/ui/stats/tagsReportSlice'
import {
    ticketInsightsSlice,
    TicketInsightsState,
} from 'domains/reporting/state/ui/stats/ticketInsightsSlice'
import { StatsTablesState } from 'domains/reporting/state/ui/stats/types'

export type StatsState = {
    [fetchingMapSlice.name]: FetchingMapSliceState
    [filtersSlice.name]: FiltersSliceState
    statsTables: StatsTablesState
    [channelsSlice.name]: ChannelsSlice
    [tagsReportSlice.name]: TagsReportState
    [ticketInsightsSlice.name]: TicketInsightsState
    [drillDownSlice.name]: DrillDownState
    [sidePanelSlice.name]: SidePanelState
    [busiestTimesSlice.name]: BusiestTimesState
    [qualityManagementSlice.name]: QualityManagementState
}

const statsReducer = combineReducers({
    [busiestTimesSlice.name]: busiestTimesSlice.reducer,
    [channelsSlice.name]: channelsSlice.reducer,
    [drillDownSlice.name]: drillDownSlice.reducer,
    [sidePanelSlice.name]: sidePanelSlice.reducer,
    [fetchingMapSlice.name]: fetchingMapSlice.reducer,
    [filtersSlice.name]: filtersSlice.reducer,
    [tagsReportSlice.name]: tagsReportSlice.reducer,
    [ticketInsightsSlice.name]: ticketInsightsSlice.reducer,
    statsTables: statsTablesReducer,
    [qualityManagementSlice.name]: qualityManagementSlice.reducer,
})

export default statsReducer
