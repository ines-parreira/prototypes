import { createContext } from 'react'

import type { SearchRank } from '@repo/logging'

const DefaultExportSearchRankScenarioContext = createContext<SearchRank | null>(
    null,
)

export { DefaultExportSearchRankScenarioContext }
