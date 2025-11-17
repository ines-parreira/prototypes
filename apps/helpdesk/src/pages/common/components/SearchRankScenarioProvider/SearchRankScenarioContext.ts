import { createContext } from 'react'

import type { SearchRank } from 'hooks/useSearchRankScenario'

export default createContext<SearchRank | null>(null)
