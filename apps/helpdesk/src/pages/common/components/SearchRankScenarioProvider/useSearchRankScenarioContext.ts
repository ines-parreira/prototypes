import { useContext } from 'react'

import { DefaultExportSearchRankScenarioContext as SearchRankScenarioContext } from './SearchRankScenarioContext'

export function useSearchRankScenarioContext() {
    const context = useContext(SearchRankScenarioContext)
    if (!context) {
        throw new Error(
            'useSearchRankContext should be used inside SearchRankScenarioProvider',
        )
    }
    return context
}
