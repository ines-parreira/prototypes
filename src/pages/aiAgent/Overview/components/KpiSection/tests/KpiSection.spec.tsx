import {render, screen} from '@testing-library/react'
import React from 'react'

import {Provider} from 'react-redux'

import configureMockStore from 'redux-mock-store'

import {StatType} from 'models/stat/types'

import {
    AiAgentType,
    useAiAgentTypeForAccount,
} from 'pages/aiAgent/Overview/hooks/useAiAgentType'
import {useMixedKpis} from 'pages/aiAgent/Overview/hooks/useMixedKpis'
import {useSalesKpis} from 'pages/aiAgent/Overview/hooks/useSalesKpis'
import {useSupportKpis} from 'pages/aiAgent/Overview/hooks/useSupportKpis'
import {initialState as initialStatsFiltersState} from 'state/stats/statsSlice'
import {RootState, StoreDispatch, StoreState} from 'state/types'
import {initialState} from 'state/ui/stats/filtersSlice'

import {assumeMock} from 'utils/testing'

import {KpiSection} from '../KpiSection'

jest.mock('pages/aiAgent/Overview/hooks/useAiAgentType')
const useAiAgentTypeMock = assumeMock(useAiAgentTypeForAccount)

jest.mock('pages/aiAgent/Overview/hooks/useMixedKpis')
const useMixedKpisMock = assumeMock(useMixedKpis)
jest.mock('pages/aiAgent/Overview/hooks/useSalesKpis')
const useSalesKpisMock = assumeMock(useSalesKpis)
jest.mock('pages/aiAgent/Overview/hooks/useSupportKpis')
const useSupportKpisMock = assumeMock(useSupportKpis)

jest.mock(
    '@gorgias/merchant-ui-kit',
    () =>
        ({
            ...jest.requireActual('@gorgias/merchant-ui-kit'),
            Skeleton: () => <div data-testid="skeleton" />,
        }) as typeof import('@gorgias/merchant-ui-kit')
)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()

const defaultStore = {
    ui: {
        stats: {filters: initialState},
    },
    stats: initialStatsFiltersState,
} as StoreState

const renderComponent = () => {
    return render(
        <Provider store={mockStore(defaultStore)}>
            <KpiSection />
        </Provider>
    )
}

describe('KpiSection', () => {
    describe.each([
        ['sales' as AiAgentType, useSalesKpisMock],
        ['support' as AiAgentType, useSupportKpisMock],
        ['mixed' as AiAgentType, useMixedKpisMock],
    ])('when AI Agent type is %s', (aiAgentType, mockFn) => {
        beforeEach(() => {
            useAiAgentTypeMock.mockReturnValue({
                isLoading: false,
                aiAgentType,
            })
        })

        it('renders sales KPIs correctly when not loading', () => {
            mockFn.mockReturnValue({
                metrics: [
                    {
                        isLoading: true,
                        title: `My ${aiAgentType} metric`,
                        hint: `My ${aiAgentType} hint`,
                        metricType: StatType.Number,
                    },
                ],
            })

            renderComponent()
            expect(
                screen.queryByText(`My ${aiAgentType} metric`)
            ).toBeInTheDocument()
            expect(screen.getByTestId('skeleton')).toBeInTheDocument()
        })

        it('renders sales KPIs correctly when not loading', () => {
            mockFn.mockReturnValue({
                metrics: [
                    {
                        isLoading: false,
                        title: `My ${aiAgentType} metric`,
                        hint: `My ${aiAgentType} hint`,
                        value: 100,
                        prevValue: 90,
                        metricType: StatType.Number,
                    },
                ],
            })

            renderComponent()
            expect(
                screen.queryByText(`My ${aiAgentType} metric`)
            ).toBeInTheDocument()
            expect(screen.queryByText('100')).toBeInTheDocument()
        })
    })

    it('when AI Agent type is loading', () => {
        useAiAgentTypeMock.mockReturnValue({
            isLoading: true,
        })

        renderComponent()

        // 8 because 2 skeletons by KPIs (title + metric)
        expect(screen.queryAllByTestId('skeleton')).toHaveLength(8)
    })
})
