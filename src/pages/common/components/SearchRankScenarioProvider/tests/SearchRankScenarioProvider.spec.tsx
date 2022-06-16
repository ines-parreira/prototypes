import React from 'react'
import {render} from '@testing-library/react'
import useSearchRankScenario, {
    SearchRankSource,
} from 'hooks/useSearchRankScenario'
import {createContextConsumer} from 'utils/testing'
import SearchRankScenarioContext from '../SearchRankScenarioContext'
import SearchRankScenarioProvider from '../SearchRankScenarioProvider'

jest.mock('hooks/useSearchRankScenario')
const useSearchRankScenarioMock = useSearchRankScenario as jest.MockedFunction<
    typeof useSearchRankScenario
>

const SearchRankScenarioConsumer = createContextConsumer(
    SearchRankScenarioContext
)

describe('SearchRankScenarioProvider', () => {
    const defaultSearchRankScenario = {} as ReturnType<
        typeof useSearchRankScenario
    >

    beforeEach(() => {
        jest.clearAllMocks()
        useSearchRankScenarioMock.mockReturnValue(defaultSearchRankScenario)
    })

    it('should provide call useSearchRankScenario with provider props', () => {
        render(
            <SearchRankScenarioProvider
                source={SearchRankSource.CustomerProfile}
                scenarioTimeout={10}
            >
                <SearchRankScenarioConsumer />
            </SearchRankScenarioProvider>
        )

        expect(useSearchRankScenarioMock).toHaveBeenCalledWith(
            SearchRankSource.CustomerProfile,
            10
        )
    })

    it('should provide useSearchRankScenario api', () => {
        render(
            <SearchRankScenarioProvider
                source={SearchRankSource.CustomerProfile}
            >
                <SearchRankScenarioConsumer />
            </SearchRankScenarioProvider>
        )

        expect(SearchRankScenarioConsumer.getLastContextValue()).toBe(
            defaultSearchRankScenario
        )
    })
})
