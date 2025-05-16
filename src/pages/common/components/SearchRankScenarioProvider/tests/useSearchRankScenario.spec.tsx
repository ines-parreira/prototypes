import React, { ComponentType } from 'react'

import { SearchRank } from 'hooks/useSearchRankScenario'
import SearchRankScenarioContext from 'pages/common/components/SearchRankScenarioProvider/SearchRankScenarioContext'
import { renderHook } from 'utils/testing/renderHook'

import useSearchRankScenarioContext from '../useSearchRankScenarioContext'

describe('useSearchRankScenario', () => {
    it('should throw when used outside the provider', () => {
        const { result } = renderHook(() => useSearchRankScenarioContext())
        expect(result.error?.message).toBe(
            'useSearchRankContext should be used inside SearchRankScenarioProvider',
        )
    })

    it('should return the context', () => {
        const contextValue = {} as SearchRank

        const { result } = renderHook(() => useSearchRankScenarioContext(), {
            wrapper: (({ children }: { children: React.ReactNode }) => (
                <SearchRankScenarioContext.Provider value={contextValue}>
                    {children}
                </SearchRankScenarioContext.Provider>
            )) as ComponentType,
        })

        expect(result.current).toBe(contextValue)
    })
})
