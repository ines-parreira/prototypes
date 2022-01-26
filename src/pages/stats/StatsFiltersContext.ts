import {createContext} from 'react'

import {StatsFilters} from 'state/stats/types'

export default createContext<StatsFilters | null>(null)
