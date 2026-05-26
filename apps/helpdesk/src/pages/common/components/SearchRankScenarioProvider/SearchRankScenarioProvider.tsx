import type { ReactNode } from 'react'
import React from 'react'

import { useSearchRankScenario } from '@repo/logging'
import type { SearchRankSource } from '@repo/logging'

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
    const searchRank = useSearchRankScenario(source, { scenarioTimeout })
    return (
        <SearchRankScenarioContext.Provider value={searchRank}>
            {children}
        </SearchRankScenarioContext.Provider>
    )
}
