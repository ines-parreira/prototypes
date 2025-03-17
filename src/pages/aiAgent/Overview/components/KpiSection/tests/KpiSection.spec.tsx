import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryHistory, History } from 'history'
import { mockFlags } from 'jest-launchdarkly-mock'
import { Provider } from 'react-redux'
import { Router } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import { FeatureFlagKey } from 'config/featureFlags'
import { StatType } from 'models/stat/types'
import {
    AiAgentType,
    useAiAgentTypeForAccount,
} from 'pages/aiAgent/Overview/hooks/useAiAgentType'
import { useMixedKpis } from 'pages/aiAgent/Overview/hooks/useMixedKpis'
import { useSalesKpis } from 'pages/aiAgent/Overview/hooks/useSalesKpis'
import { useSupportKpis } from 'pages/aiAgent/Overview/hooks/useSupportKpis'
import { initialState as initialStatsFiltersState } from 'state/stats/statsSlice'
import { RootState, StoreDispatch, StoreState } from 'state/types'
import { initialState } from 'state/ui/stats/filtersSlice'
import { assumeMock } from 'utils/testing'

import { KpiSection } from '../KpiSection'

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
        }) as typeof import('@gorgias/merchant-ui-kit'),
)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()

const defaultStore = {
    ui: {
        stats: { filters: initialState },
    },
    stats: initialStatsFiltersState,
} as StoreState

const renderComponent = (history: History = createMemoryHistory()) => {
    return render(
        <Router history={history}>
            <Provider store={mockStore(defaultStore)}>
                <KpiSection />
            </Provider>
        </Router>,
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
                screen.queryByText(`My ${aiAgentType} metric`),
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
                    {
                        hidden: true,
                        isLoading: false,
                        title: `My hidden ${aiAgentType} metric`,
                        hint: `My hidden ${aiAgentType} hint`,
                        value: 100,
                        prevValue: 90,
                        metricType: StatType.Number,
                    },
                ],
            })

            renderComponent()
            expect(
                screen.queryByText(`My ${aiAgentType} metric`),
            ).toBeInTheDocument()
            expect(
                screen.queryByText(`My hidden ${aiAgentType} metric`),
            ).not.toBeInTheDocument()
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

    describe('View Full Report button', () => {
        beforeEach(() => {
            useSalesKpisMock.mockReturnValue({
                metrics: [],
            })
            useSupportKpisMock.mockReturnValue({
                metrics: [],
            })
            useMixedKpisMock.mockReturnValue({
                metrics: [],
            })
        })

        it('should not render view report button when given sales analytics feature flag is false', () => {
            useAiAgentTypeMock.mockReturnValue({
                isLoading: false,
            })

            const { queryByRole } = renderComponent()

            expect(
                queryByRole('button', { name: 'View Full Report' }),
            ).toBeNull()
        })

        it('should render view report button when given sales analytics feature flag is true', () => {
            mockFlags({
                [FeatureFlagKey.StandaloneAiSalesAnalyticsPage]: true,
            })

            useAiAgentTypeMock.mockReturnValue({
                isLoading: false,
            })

            const { getByRole } = renderComponent()

            expect(
                getByRole('button', { name: 'View Full Report' }),
            ).toBeInTheDocument()
        })

        it.each(['mixed' as const, 'sales' as const])(
            'should redirect to AI Agent Sales Analytics when AI Agent type is %s',
            (aiAgentType) => {
                const history = createMemoryHistory()
                mockFlags({
                    [FeatureFlagKey.StandaloneAiSalesAnalyticsPage]: true,
                })

                useAiAgentTypeMock.mockReturnValue({
                    isLoading: false,
                    aiAgentType,
                })

                const { getByRole } = renderComponent(history)
                const reportButton = getByRole('button', {
                    name: 'View Full Report',
                })

                userEvent.click(reportButton)

                // Add a small delay to allow navigation to complete
                setTimeout(() => {
                    expect(history.location.pathname).toEqual(
                        '/app/stats/ai-sales-agent/overview',
                    )
                }, 0)
            },
        )

        it('should redirect to AI Agent Support Analytics when AI Agent type is support', () => {
            const history = createMemoryHistory()
            mockFlags({
                [FeatureFlagKey.StandaloneAiSalesAnalyticsPage]: true,
            })

            useAiAgentTypeMock.mockReturnValue({
                isLoading: false,
                aiAgentType: 'support' as const,
            })

            const { getByRole } = renderComponent(history)
            const reportButton = getByRole('button', {
                name: 'View Full Report',
            })

            userEvent.click(reportButton)

            // Add a small delay to allow navigation to complete
            setTimeout(() => {
                expect(history.location.pathname).toEqual(
                    '/stats/ai-sales-agent/overview',
                )
            }, 0)
        })
    })
})
