import {createContext} from 'react'

import {StatsFilters} from 'models/stat/types'
import {defaultStatsFilters} from 'state/stats/statsSlice'

export default createContext<StatsFilters>(defaultStatsFilters)
