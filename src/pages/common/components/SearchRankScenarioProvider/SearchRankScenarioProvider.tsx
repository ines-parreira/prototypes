import React, {ReactNode} from 'react'

import useSearchRankScenario, {
    SearchRankSource,
} from 'hooks/useSearchRankScenario'
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
