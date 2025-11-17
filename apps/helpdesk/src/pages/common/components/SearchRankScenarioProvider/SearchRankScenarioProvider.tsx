import type { ReactNode } from 'react'
import React from 'react'

import type { SearchRankSource } from 'hooks/useSearchRankScenario'
import useSearchRankScenario from 'hooks/useSearchRankScenario'

import SearchRankScenarioContext from './SearchRankScenarioContext'

type Props = {
    source: SearchRankSource
    scenarioTimeout?: number
    children?: ReactNode
}

export default function SearchRankScenarioProvider({
    source,
    scenarioTimeout,
    children,
}: Props) {
    const searchRank = useSearchRankScenario(source, scenarioTimeout)
    return (
        <SearchRankScenarioContext.Provider value={searchRank}>
            {children}
        </SearchRankScenarioContext.Provider>
    )
}
