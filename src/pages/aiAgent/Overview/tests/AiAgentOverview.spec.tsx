import {QueryClientProvider} from '@tanstack/react-query'
import {render} from '@testing-library/react'

import React from 'react'
import {Provider} from 'react-redux'
import {useLocation} from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import {logEvent, SegmentEvent} from 'common/segment'
import {initialState as initialStatsFiltersState} from 'state/stats/statsSlice'
import {RootState, StoreDispatch, StoreState} from 'state/types'
import {initialState} from 'state/ui/stats/filtersSlice'

import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {assumeMock} from 'utils/testing'

import {AiAgentOverview} from '../AiAgentOverview'

import {AiAgentOverviewRootStateFixture} from './AiAgentOverviewRootState.fixture'

jest.mock('react-router')
jest.mock('common/segment', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {AiAgentOverviewPageView: 'ai-agent-overview-page-view'},
}))

const defaultLocation = {
    pathname: '',
    search: '',
    state: '',
    hash: '',
}

const useLocationMock = assumeMock(useLocation)
useLocationMock.mockReturnValue(defaultLocation)

const rootState = AiAgentOverviewRootStateFixture.start()
    .with2ShopifyIntegrations()
    .build()
const queryClient = mockQueryClient()
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()

const defaultStore = {
    ...rootState,
    ui: {
        stats: {filters: initialState},
    },
    stats: initialStatsFiltersState,
} as StoreState

const renderComponent = () => {
    return render(
        <Provider store={mockStore(defaultStore)}>
            <QueryClientProvider client={queryClient}>
                <AiAgentOverview />
            </QueryClientProvider>
        </Provider>
    )
}

describe('useAiAgentOverview', () => {
    it('should render', () => {
        const {queryByText} = renderComponent()

        expect(queryByText(/Welcome,.*/)).toBeTruthy()
        expect(queryByText('AI Agent Performance')).toBeTruthy()
        expect(queryByText('Complete AI Agent Setup')).toBeTruthy()
        expect(queryByText('Resources')).toBeTruthy()
    })

    it('should not renders the Thank You modal', () => {
        const {queryByText} = renderComponent()
        expect(queryByText('Your account is ready')).toBeNull()
    })

    it('should call the segment log', () => {
        renderComponent()
        expect(logEvent).toHaveBeenCalledTimes(1)
        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.AiAgentOverviewPageView
        )
    })

    describe('when coming from onboarding', () => {
        it('should renders the Thank You modal', async () => {
            useLocationMock.mockReturnValue({
                ...defaultLocation,
                state: {from: '/app/ai-agent/onboarding'},
            })

            const {findByText} = renderComponent()

            expect(await findByText('Your account is ready!')).toBeVisible()
        })
    })

    describe('when coming from another page', () => {
        it('should renders the Thank You modal', () => {
            useLocationMock.mockReturnValue({
                ...defaultLocation,
                state: {from: '/app/ai-agent/test'},
            })

            const {queryByText} = renderComponent()

            expect(queryByText('Your account is ready')).toBeNull()
        })
    })
})
