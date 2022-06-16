import {createContext} from 'react'
import useSearchRankScenario from 'hooks/useSearchRankScenario'

export default createContext<ReturnType<typeof useSearchRankScenario> | null>(
    null
)
