import React from 'react'

import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import AutomateStatsPaywall from 'domains/reporting/pages/automate/AutomateStatsPaywall'
import { AutomateOverview } from 'domains/reporting/pages/automate/overview/AutomateOverview'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { TrialPaywallMiddleware } from 'pages/aiAgent/Overview/middlewares/TrialPaywallMiddleware'
import { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

jest.mock('hooks/aiAgent/useAiAgentAccess')
const useAiAgentAccessMock = assumeMock(useAiAgentAccess)

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

        useAiAgentAccessMock.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })

        AutomateOverviewMock.mockImplementation(() => (
            <div data-testid="automate-overview">AutomateOverview</div>
        ))
        TrialPaywallMiddlewareMock.mockImplementation(() => (
            <div data-testid="trial-paywall">TrialPaywallMiddleware</div>
        ))
    })

    it('should render loading spinner when isLoading is true', () => {
        useAiAgentAccessMock.mockReturnValue({
            hasAccess: false,
            isLoading: true,
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
        useAiAgentAccessMock.mockReturnValue({
            hasAccess: true,
            isLoading: false,
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

    it('should render AutomateOverview when user has an active trial', () => {
        useAiAgentAccessMock.mockReturnValue({
            hasAccess: true,
            isLoading: false,
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
        useAiAgentAccessMock.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })

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
