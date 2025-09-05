import React from 'react'

import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import AutomateStatsPaywall from 'domains/reporting/pages/automate/AutomateStatsPaywall'
import { AutomateOverview } from 'domains/reporting/pages/automate/overview/AutomateOverview'
import { useCanUseAiAgent } from 'hooks/aiAgent/useCanUseAiAgent'
import { TrialPaywallMiddleware } from 'pages/aiAgent/Overview/middlewares/TrialPaywallMiddleware'
import { getHasAutomate } from 'state/billing/selectors'
import { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

jest.mock('hooks/aiAgent/useCanUseAiAgent')
const useCanUseAiAgentMock = assumeMock(useCanUseAiAgent)

jest.mock('state/billing/selectors', () => ({ getHasAutomate: jest.fn() }))
const getHasAutomateMock = assumeMock(getHasAutomate)

jest.mock('domains/reporting/pages/automate/overview/AutomateOverview')
const AutomateOverviewMock = assumeMock(AutomateOverview)

jest.mock('pages/aiAgent/Overview/middlewares/TrialPaywallMiddleware')
const TrialPaywallMiddlewareMock = assumeMock(TrialPaywallMiddleware)

jest.mock('pages/ErrorBoundary', () => ({
    ErrorBoundary: ({
        children,
        sentryTags,
    }: {
        children: React.ReactNode
        sentryTags?: any
    }) => (
        <div
            data-testid="error-boundary"
            data-sentry-tags={JSON.stringify(sentryTags)}
        >
            {children}
        </div>
    ),
}))

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const queryClient = mockQueryClient()

describe('AutomateStatsPaywall', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        useCanUseAiAgentMock.mockReturnValue({
            storeIntegration: undefined,
            isCurrentStoreDuringTrial: false,
            hasAnyActiveTrial: false,
            isLoading: false,
            isError: false,
        })

        getHasAutomateMock.mockReturnValue(false)

        AutomateOverviewMock.mockImplementation(() => (
            <div data-testid="automate-overview">AutomateOverview</div>
        ))
        TrialPaywallMiddlewareMock.mockImplementation(() => (
            <div data-testid="trial-paywall">TrialPaywallMiddleware</div>
        ))
    })

    it('should render loading spinner when isLoading is true', () => {
        useCanUseAiAgentMock.mockReturnValue({
            storeIntegration: undefined,
            isCurrentStoreDuringTrial: false,
            hasAnyActiveTrial: false,
            isLoading: true,
            isError: false,
        })

        render(
            <Provider store={mockStore({})}>
                <QueryClientProvider client={queryClient}>
                    <AutomateStatsPaywall />
                </QueryClientProvider>
            </Provider>,
        )

        expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('should render AutomateOverview when user has Automate subscription', () => {
        getHasAutomateMock.mockReturnValue(true)

        render(
            <Provider store={mockStore({})}>
                <QueryClientProvider client={queryClient}>
                    <AutomateStatsPaywall />
                </QueryClientProvider>
            </Provider>,
        )

        expect(screen.getByTestId('error-boundary')).toBeInTheDocument()
        expect(screen.getByTestId('automate-overview')).toBeInTheDocument()
        expect(screen.queryByTestId('trial-paywall')).not.toBeInTheDocument()
    })

    it('should render AutomateOverview when user has an active trial', () => {
        useCanUseAiAgentMock.mockReturnValue({
            storeIntegration: undefined,
            isCurrentStoreDuringTrial: false,
            hasAnyActiveTrial: true,
            isLoading: false,
            isError: false,
        })

        render(
            <Provider store={mockStore({})}>
                <QueryClientProvider client={queryClient}>
                    <AutomateStatsPaywall />
                </QueryClientProvider>
            </Provider>,
        )

        expect(screen.getByTestId('error-boundary')).toBeInTheDocument()
        expect(screen.getByTestId('automate-overview')).toBeInTheDocument()
        expect(screen.queryByTestId('trial-paywall')).not.toBeInTheDocument()
    })

    it('should render TrialPaywallMiddleware when user has no Automate subscription and no active trial', () => {
        useCanUseAiAgentMock.mockReturnValue({
            storeIntegration: undefined,
            isCurrentStoreDuringTrial: false,
            hasAnyActiveTrial: false,
            isLoading: false,
            isError: false,
        })
        getHasAutomateMock.mockReturnValue(false)

        render(
            <Provider store={mockStore({})}>
                <QueryClientProvider client={queryClient}>
                    <AutomateStatsPaywall />
                </QueryClientProvider>
            </Provider>,
        )

        expect(screen.getByTestId('error-boundary')).toBeInTheDocument()
        expect(
            screen.queryByTestId('automate-overview'),
        ).not.toBeInTheDocument()
        expect(screen.getByTestId('trial-paywall')).toBeInTheDocument()
    })
})
