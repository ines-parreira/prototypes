import {createContext} from 'react'
import {SearchRank} from 'hooks/useSearchRankScenario'

export default createContext<SearchRank | null>(null)
