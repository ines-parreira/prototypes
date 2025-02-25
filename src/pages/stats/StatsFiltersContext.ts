import { createContext } from 'react'

import { LegacyStatsFilters } from 'models/stat/types'
import { defaultStatsFilters } from 'state/stats/statsSlice'

export default createContext<LegacyStatsFilters>(defaultStatsFilters)
