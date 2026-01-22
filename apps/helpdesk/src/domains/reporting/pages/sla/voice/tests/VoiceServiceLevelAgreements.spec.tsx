import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockListSlaPoliciesHandler } from '@gorgias/helpdesk-mocks'

import { appQueryClient } from 'api/queryClient'
import { VoiceServiceLevelAgreements } from 'domains/reporting/pages/sla/voice/VoiceServiceLevelAgreements'
import { billingState } from 'fixtures/billing'
import type { RootState } from 'state/types'
import { renderWithStoreAndQueryClientAndRouter } from 'tests/renderWithStoreAndQueryClientAndRouter'

const server = setupServer()

const mockListSlaPolicies = mockListSlaPoliciesHandler()

const localHandlers = [mockListSlaPolicies.handler]

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'warn' })
})

beforeEach(() => {
    server.use(...localHandlers)
})

afterEach(() => {
    server.resetHandlers()
    appQueryClient.clear()
})

afterAll(() => {
    server.close()
})

jest.mock('domains/reporting/pages/common/filters/FiltersPanelWrapper', () => ({
    __esModule: true,
    default: () => <div>Filters Panel</div>,
}))

jest.mock('domains/reporting/pages/common/AnalyticsFooter', () => ({
    AnalyticsFooter: () => <div>Analytics Footer</div>,
}))

jest.mock('domains/reporting/pages/dashboards/DashboardComponent', () => ({
    DashboardComponent: () => <div>Voice Dashboard Chart</div>,
}))

jest.mock('domains/reporting/hooks/useCleanStatsFilters', () => ({
    useCleanStatsFilters: () => {},
}))

describe('<VoiceServiceLevelAgreements />', () => {
    const baseState: Partial<RootState> = {
        billing: fromJS({
            ...billingState,
            products: [],
        }),
        ui: {
            stats: {
                filters: {
                    cleanStatsFilters: {},
                },
            },
        } as any,
    }

    it('should render filters panel', async () => {
        renderWithStoreAndQueryClientAndRouter(
            <VoiceServiceLevelAgreements />,
            baseState,
        )

        expect(await screen.findByText('Filters Panel')).toBeInTheDocument()
    })

    it('should render overview section with dashboard chart', async () => {
        renderWithStoreAndQueryClientAndRouter(
            <VoiceServiceLevelAgreements />,
            baseState,
        )

        expect(
            await screen.findByText('Voice Dashboard Chart'),
        ).toBeInTheDocument()
    })

    it('should render analytics footer', async () => {
        renderWithStoreAndQueryClientAndRouter(
            <VoiceServiceLevelAgreements />,
            baseState,
        )

        expect(await screen.findByText('Analytics Footer')).toBeInTheDocument()
    })

    it('should show empty state when there are no SLA policies', async () => {
        server.use(
            mockListSlaPoliciesHandler(async () =>
                HttpResponse.json({
                    data: [],
                    meta: { next_cursor: null },
                } as any),
            ).handler,
        )

        renderWithStoreAndQueryClientAndRouter(
            <VoiceServiceLevelAgreements />,
            baseState,
        )

        expect(
            await screen.findByText(/set up your first sla/i),
        ).toBeInTheDocument()

        expect(screen.queryByText('Filters Panel')).not.toBeInTheDocument()
        expect(
            screen.queryByText('Voice Dashboard Chart'),
        ).not.toBeInTheDocument()
    })
})
