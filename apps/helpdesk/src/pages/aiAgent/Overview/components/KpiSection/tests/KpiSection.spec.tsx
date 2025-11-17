import { FeatureFlagKey } from '@repo/feature-flags'
import { assumeMock, userEvent } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import type { History } from 'history'
import { createMemoryHistory } from 'history'
import { Provider } from 'react-redux'
import { Router } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import { useFlag } from 'core/flags'
import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import { initialState as initialStatsFiltersState } from 'domains/reporting/state/stats/statsSlice'
import { initialState } from 'domains/reporting/state/ui/stats/filtersSlice'
import { useAiAgentTypeForAccount } from 'pages/aiAgent/Overview/hooks/useAiAgentType'
import { useKpis } from 'pages/aiAgent/Overview/hooks/useKpis'
import type { RootState, StoreDispatch, StoreState } from 'state/types'

import { KpiSection } from '../KpiSection'

jest.mock('pages/aiAgent/Overview/hooks/useAiAgentType')
const useAiAgentTypeMock = assumeMock(useAiAgentTypeForAccount)

jest.mock('domains/reporting/hooks/automate/useAIAgentUserId')
const useAIAgentUserIdMock = assumeMock(useAIAgentUserId)

jest.mock('pages/aiAgent/Overview/hooks/useKpis')
const useKpisMock = assumeMock(useKpis)

jest.mock(
    '@gorgias/axiom',
    () =>
        ({
            ...jest.requireActual('@gorgias/axiom'),
            Skeleton: () => <div data-testid="skeleton" />,
        }) as typeof import('@gorgias/axiom'),
)

jest.mock('core/flags')
const mockUseFlag = jest.mocked(useFlag)

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
                <KpiSection
                    isOnNewPlan
                    showEarlyAccessModal={() => {}}
                    showActivationModal={() => {}}
                />
            </Provider>
        </Router>,
    )
}

describe('KpiSection', () => {
    beforeEach(() => {
        useAIAgentUserIdMock.mockReturnValue(123)
    })

    describe.each([
        { aiAgentType: 'sales' as const },
        { aiAgentType: 'support' as const },
        { aiAgentType: 'mixed' as const },
    ])('when AI Agent type is %s', ({ aiAgentType }) => {
        beforeEach(() => {
            useAiAgentTypeMock.mockReturnValue({
                isLoading: false,
                aiAgentType,
            })
        })

        it('renders sales KPIs correctly when not loading', () => {
            useKpisMock.mockReturnValue({
                metrics: [
                    {
                        isLoading: true,
                        title: `My ${aiAgentType} metric`,
                        hint: { title: `My ${aiAgentType} hint` },
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
            useKpisMock.mockReturnValue({
                metrics: [
                    {
                        isLoading: false,
                        title: `My ${aiAgentType} metric`,
                        hint: { title: `My ${aiAgentType} hint` },
                        value: 100,
                        prevValue: 90,
                    },
                    {
                        hidden: true,
                        isLoading: false,
                        title: `My hidden ${aiAgentType} metric`,
                        hint: { title: `My hidden ${aiAgentType} hint` },
                        value: 100,
                        prevValue: 90,
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

        it('calls useKpis with correct filters', () => {
            jest.useFakeTimers().setSystemTime(new Date('2024-03-30T00:00:00Z'))

            useKpisMock.mockReturnValue({
                metrics: [
                    {
                        isLoading: true,
                        title: `My ${aiAgentType} metric`,
                        hint: { title: `My ${aiAgentType} hint` },
                    },
                ],
            })

            renderComponent()

            expect(useKpisMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    automationRateFilters: {
                        period: {
                            start_datetime: '2024-03-02T00:00:00Z',
                            end_datetime: '2024-03-27T23:59:59Z',
                        },
                    },
                    filters: {
                        period: {
                            start_datetime: '2024-03-02T00:00:00Z',
                            end_datetime: '2024-03-30T23:59:59Z',
                        },
                    },
                }),
            )
        })
    })

    describe('View Full Report button', () => {
        beforeEach(() => {
            useKpisMock.mockReturnValue({
                metrics: [],
            })
        })

        it('should not render view report button when given sales analytics feature flag is false', () => {
            useAiAgentTypeMock.mockReturnValue({
                isLoading: false,
                aiAgentType: 'sales' as const,
            })

            const { queryByRole } = renderComponent()

            expect(
                queryByRole('button', { name: 'View Full Report' }),
            ).toBeNull()
        })

        it('should render view report button when given sales analytics feature flag is true', () => {
            mockUseFlag.mockImplementation(
                (key) =>
                    key === FeatureFlagKey.AiShoppingAssistantEnabled || false,
            )

            useAiAgentTypeMock.mockReturnValue({
                isLoading: false,
                aiAgentType: 'sales' as const,
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
                mockUseFlag.mockImplementation(
                    (key) =>
                        key === FeatureFlagKey.AiShoppingAssistantEnabled ||
                        false,
                )

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

        it('should redirect to automate overview', () => {
            const history = createMemoryHistory()
            mockUseFlag.mockImplementation(
                (key) =>
                    key === FeatureFlagKey.AiShoppingAssistantEnabled || false,
            )

            useAiAgentTypeMock.mockReturnValue({
                isLoading: false,
                aiAgentType: 'support',
            })

            const { getByRole } = renderComponent(history)
            const reportButton = getByRole('button', {
                name: 'View Full Report',
            })

            // Check that the link has the correct href
            const link = reportButton.closest('a')
            expect(link).toHaveAttribute('href', '/app/stats/ai-agent-overview')
        })
    })
})
