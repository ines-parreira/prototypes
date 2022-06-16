import {useContext} from 'react'
import SearchRankScenarioContext from './SearchRankScenarioContext'

export default function useSearchRankScenarioContext() {
    const context = useContext(SearchRankScenarioContext)
    if (!context) {
        throw new Error(
            'useSearchRankContext should be used inside SearchRankScenarioProvider'
        )
    }
    return context
}
