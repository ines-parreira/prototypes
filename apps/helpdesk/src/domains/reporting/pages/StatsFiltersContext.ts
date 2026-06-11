import { createContext } from 'react'

import type { LegacyStatsFilters } from 'domains/reporting/models/stat/types'
import { defaultStatsFilters } from 'domains/reporting/state/stats/statsSlice'

const DefaultExportStatsFiltersContext =
    createContext<LegacyStatsFilters>(defaultStatsFilters)

export { DefaultExportStatsFiltersContext }
