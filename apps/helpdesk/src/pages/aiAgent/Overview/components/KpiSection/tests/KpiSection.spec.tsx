import { assumeMock, render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import { initialState as initialStatsFiltersState } from 'domains/reporting/state/stats/statsSlice'
import { initialState } from 'domains/reporting/state/ui/stats/filtersSlice'
import { useAiAgentTypeForAccount } from 'pages/aiAgent/Overview/hooks/useAiAgentType'
import { useKpis } from 'pages/aiAgent/Overview/hooks/useKpis'
import type { StoreState } from 'state/types'

import { KpiSection } from '../KpiSection'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlagWithLoading: jest.fn(() => ({ value: false, isLoading: false })),
}))

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
const defaultStore = {
    ui: {
        stats: { filters: initialState },
    },
    stats: initialStatsFiltersState,
} as StoreState
const renderComponent = () => {
    return render(
        <KpiSection
            isOnNewPlan
            showEarlyAccessModal={() => {}}
            showActivationModal={() => {}}
        />,
        {
            storeState: defaultStore,
        },
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
                            start_datetime: '2024-02-27T00:00:00Z',
                            end_datetime: '2024-03-27T23:59:59Z',
                        },
                    },
                    filters: {
                        period: {
                            start_datetime: '2024-02-27T00:00:00Z',
                            end_datetime: '2024-03-27T23:59:59Z',
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
        it('should render view report button', () => {
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
                useAiAgentTypeMock.mockReturnValue({
                    isLoading: false,
                    aiAgentType,
                })
                const { getByRole } = renderComponent()
                const reportButton = getByRole('button', {
                    name: 'View Full Report',
                })
                expect(reportButton.closest('a')).toHaveAttribute(
                    'href',
                    '/app/stats/ai-sales-agent/overview',
                )
            },
        )
        it('should redirect to automate overview', () => {
            useAiAgentTypeMock.mockReturnValue({
                isLoading: false,
                aiAgentType: 'support',
            })
            const { getByRole } = renderComponent()
            const reportButton = getByRole('button', {
                name: 'View Full Report',
            })
            // Check that the link has the correct href
            const link = reportButton.closest('a')
            expect(link).toHaveAttribute('href', '/app/stats/ai-agent-overview')
        })
        it.each(['support' as const, 'sales' as const, 'mixed' as const])(
            'should redirect to All Agents tab when AiAgentAnalyticsDashboardsNewScreens flag is on (aiAgentType: %s)',
            (aiAgentType) => {
                const { useFlagWithLoading } = jest.requireMock(
                    '@repo/feature-flags',
                )
                useFlagWithLoading.mockReturnValue({
                    value: true,
                    isLoading: false,
                })
                useAiAgentTypeMock.mockReturnValue({
                    isLoading: false,
                    aiAgentType,
                })
                const { getByRole } = renderComponent()
                const reportButton = getByRole('button', {
                    name: 'View Full Report',
                })
                expect(reportButton.closest('a')).toHaveAttribute(
                    'href',
                    '/app/stats/ai-agent',
                )
            },
        )
    })
})
