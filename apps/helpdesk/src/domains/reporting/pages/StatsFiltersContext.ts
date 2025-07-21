import { createContext } from 'react'

import { LegacyStatsFilters } from 'domains/reporting/models/stat/types'
import { defaultStatsFilters } from 'domains/reporting/state/stats/statsSlice'

export default createContext<LegacyStatsFilters>(defaultStatsFilters)
