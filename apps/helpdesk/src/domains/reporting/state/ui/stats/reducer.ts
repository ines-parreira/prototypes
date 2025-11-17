import { combineReducers } from 'redux'

import type { BusiestTimesState } from 'domains/reporting/state/ui/stats/busiestTimesSlice'
import { busiestTimesSlice } from 'domains/reporting/state/ui/stats/busiestTimesSlice'
import type { ChannelsSlice } from 'domains/reporting/state/ui/stats/channelsSlice'
import { channelsSlice } from 'domains/reporting/state/ui/stats/channelsSlice'
import type { DrillDownState } from 'domains/reporting/state/ui/stats/drillDownSlice'
import { drillDownSlice } from 'domains/reporting/state/ui/stats/drillDownSlice'
import type { FetchingMapSliceState } from 'domains/reporting/state/ui/stats/fetchingMapSlice'
import { fetchingMapSlice } from 'domains/reporting/state/ui/stats/fetchingMapSlice'
import type { FiltersSliceState } from 'domains/reporting/state/ui/stats/filtersSlice'
import { filtersSlice } from 'domains/reporting/state/ui/stats/filtersSlice'
import type { QualityManagementState } from 'domains/reporting/state/ui/stats/qualityManagementSlice'
import { qualityManagementSlice } from 'domains/reporting/state/ui/stats/qualityManagementSlice'
import type { SidePanelState } from 'domains/reporting/state/ui/stats/sidePanelSlice'
import { sidePanelSlice } from 'domains/reporting/state/ui/stats/sidePanelSlice'
import { statsTablesReducer } from 'domains/reporting/state/ui/stats/statsTablesReducer'
import type { TagsReportState } from 'domains/reporting/state/ui/stats/tagsReportSlice'
import { tagsReportSlice } from 'domains/reporting/state/ui/stats/tagsReportSlice'
import type { TicketInsightsState } from 'domains/reporting/state/ui/stats/ticketInsightsSlice'
import { ticketInsightsSlice } from 'domains/reporting/state/ui/stats/ticketInsightsSlice'
import type { StatsTablesState } from 'domains/reporting/state/ui/stats/types'

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
