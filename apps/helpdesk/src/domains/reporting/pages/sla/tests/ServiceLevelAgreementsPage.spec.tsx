import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { history } from '@repo/routing'
import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockListSlaPoliciesHandler } from '@gorgias/helpdesk-mocks'

import { appQueryClient } from 'api/queryClient'
import { SLA_PAGE_TITLE } from 'domains/reporting/pages/sla/constants'
import { ServiceLevelAgreementsPage } from 'domains/reporting/pages/sla/ServiceLevelAgreementsPage'
import { VoiceServiceLevelAgreementsChart } from 'domains/reporting/pages/sla/voice/VoiceServiceLevelAgreementsReportConfig'
import { billingState } from 'fixtures/billing'
import { ProductType } from 'models/billing/types'
import * as billingSelectors from 'state/billing/selectors'
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

jest.mock('@repo/feature-flags')
const mockUseFlag = jest.mocked(useFlag)

jest.mock('domains/reporting/pages/common/filters/FiltersPanelWrapper', () => ({
    __esModule: true,
    default: () => <div>Filters Panel</div>,
}))

jest.mock('domains/reporting/pages/common/AnalyticsFooter', () => ({
    AnalyticsFooter: () => <div>Analytics Footer</div>,
}))

jest.mock('domains/reporting/pages/dashboards/DashboardComponent', () => ({
    DashboardComponent: ({ chart }: { chart: string }) => (
        <div data-testid={chart}>Dashboard Chart</div>
    ),
}))

jest.mock('domains/reporting/hooks/useCleanStatsFilters', () => ({
    useCleanStatsFilters: () => {},
}))

jest.mock(
    'domains/reporting/pages/sla/components/DownloadTicketsSLAsData',
    () => ({
        DownloadTicketsSLAsData: () => <button>Download tickets data</button>,
    }),
)
jest.mock(
    'domains/reporting/pages/sla/components/DownloadVoiceCallsSLAsData',
    () => ({
        DownloadVoiceCallsSLAsData: () => <button>Download calls data</button>,
    }),
)

jest.mock('domains/reporting/pages/common/drill-down/DrillDownModal', () => ({
    DrillDownModal: () => null,
}))

const currentAccountHasProductSpy = jest.spyOn(
    billingSelectors,
    'currentAccountHasProduct',
)

describe('ServiceLevelAgreementsPage', () => {
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

    const stateWithVoice: Partial<RootState> = {
        ...baseState,
        billing: fromJS({
            ...billingState,
            products: [
                {
                    type: ProductType.Voice,
                    prices: [1],
                },
            ],
        }),
        currentAccount: fromJS({
            current_subscription: {
                products: {
                    [ProductType.Voice]: 'voice-plan-id',
                },
            },
        }),
    }

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseFlag.mockImplementation((flag: string) => {
            if (flag === FeatureFlagKey.VoiceSLA) return true
        })
    })

    describe('when VoiceSLA feature flag is disabled', () => {
        beforeEach(() => {
            mockUseFlag.mockImplementation((flag: string) => {
                if (flag === FeatureFlagKey.VoiceSLA) return false
            })

            currentAccountHasProductSpy.mockReturnValue((() => true) as any)
        })

        it('should render page title', async () => {
            renderWithStoreAndQueryClientAndRouter(
                <ServiceLevelAgreementsPage />,
                stateWithVoice,
                {
                    route: '/app/reporting/stats/slas',
                    path: '/app/reporting/stats/slas',
                },
            )

            await waitFor(() => {
                expect(screen.getByText(SLA_PAGE_TITLE)).toBeInTheDocument()
            })
        })

        it('should render only tickets SLA without tabs', async () => {
            renderWithStoreAndQueryClientAndRouter(
                <ServiceLevelAgreementsPage />,
                stateWithVoice,
                {
                    route: '/app/reporting/stats/slas',
                    path: '/app/reporting/stats/slas',
                },
            )

            await waitFor(() => {
                expect(screen.getByText('Filters Panel')).toBeInTheDocument()
            })

            expect(screen.getAllByText('Dashboard Chart')).toHaveLength(3)
            expect(screen.queryByText('Tickets')).not.toBeInTheDocument()
            expect(screen.queryByText('Calls')).not.toBeInTheDocument()
        })

        it('should show "Download tickets data" button', async () => {
            renderWithStoreAndQueryClientAndRouter(
                <ServiceLevelAgreementsPage />,
                baseState,
                {
                    route: '/app/reporting/stats/slas',
                    path: '/app/reporting/stats/slas',
                },
            )

            await waitFor(() => {
                expect(
                    screen.getByRole('button', {
                        name: /download tickets data/i,
                    }),
                ).toBeInTheDocument()
            })

            expect(
                screen.queryByRole('button', { name: /download calls data/i }),
            ).not.toBeInTheDocument()
        })
    })

    describe('without voice product subscription', () => {
        beforeEach(() => {
            currentAccountHasProductSpy.mockReturnValue((() => false) as any)

            mockUseFlag.mockImplementation((flag: string) => {
                if (flag === FeatureFlagKey.VoiceSLA) return true
            })
        })

        it('should render only tickets SLA without tabs', async () => {
            renderWithStoreAndQueryClientAndRouter(
                <ServiceLevelAgreementsPage />,
                baseState,
                {
                    route: '/app/reporting/stats/slas',
                    path: '/app/reporting/stats/slas',
                },
            )

            await waitFor(() => {
                expect(screen.getByText('Filters Panel')).toBeInTheDocument()
            })

            expect(screen.getAllByText('Dashboard Chart')).toHaveLength(3)
            expect(screen.queryByText('Tickets')).not.toBeInTheDocument()
            expect(screen.queryByText('Calls')).not.toBeInTheDocument()
        })
    })

    describe('with voice product subscription', () => {
        beforeEach(() => {
            currentAccountHasProductSpy.mockReturnValue((() => true) as any)

            mockUseFlag.mockImplementation((flag: string) => {
                if (flag === FeatureFlagKey.VoiceSLA) return true
            })
        })

        it('should render tickets SLA content by default and both Ticket and Calls tabs', async () => {
            renderWithStoreAndQueryClientAndRouter(
                <ServiceLevelAgreementsPage />,
                stateWithVoice,
                {
                    route: '/app/reporting/stats/slas',
                    path: '/app/reporting/stats/slas',
                },
            )

            await waitFor(() => {
                expect(screen.getByText('Filters Panel')).toBeInTheDocument()
            })

            expect(screen.getAllByText('Dashboard Chart')).toHaveLength(3)

            expect(
                screen.getByRole('tab', {
                    name: /Tickets/i,
                }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('tab', {
                    name: /Calls/i,
                }),
            ).toBeInTheDocument()
        })

        it('should show "Download tickets data" button on tickets route', async () => {
            renderWithStoreAndQueryClientAndRouter(
                <ServiceLevelAgreementsPage />,
                stateWithVoice,
                {
                    route: '/app/reporting/stats/slas',
                    path: '/app/reporting/stats/slas',
                },
            )

            await waitFor(() => {
                expect(
                    screen.getByRole('button', {
                        name: /download tickets data/i,
                    }),
                ).toBeInTheDocument()
            })

            expect(
                screen.queryByRole('button', { name: /download calls data/i }),
            ).not.toBeInTheDocument()
        })

        it('should render voice SLA content on calls route', async () => {
            renderWithStoreAndQueryClientAndRouter(
                <ServiceLevelAgreementsPage />,
                stateWithVoice,
                {
                    route: '/app/reporting/stats/slas/calls',
                    path: '/app/reporting/stats/slas',
                },
            )

            expect(
                screen.getByRole('tab', {
                    name: /Calls/i,
                }),
            ).toBeInTheDocument()

            expect(
                await screen.findByTestId(
                    VoiceServiceLevelAgreementsChart.AchievedAndBreachedVoiceCallsChart,
                ),
            ).toBeInTheDocument()
        })

        it('should switch to voice SLA when clicking on Calls tab', async () => {
            const user = userEvent.setup()

            renderWithStoreAndQueryClientAndRouter(
                <ServiceLevelAgreementsPage />,
                stateWithVoice,
                {
                    route: '/app/reporting/stats/slas',
                    path: '/app/reporting/stats/slas',
                },
            )

            expect(
                screen.getByRole('tab', {
                    name: /Calls/i,
                }),
            ).toBeInTheDocument()

            await act(() =>
                user.click(screen.getByRole('tab', { name: /Calls/i })),
            )

            await waitFor(() =>
                expect(history.push).toHaveBeenCalledWith(
                    '/app/reporting/stats/slas/calls',
                ),
            )
        })

        it('should show "Download calls data" button on calls route', async () => {
            renderWithStoreAndQueryClientAndRouter(
                <ServiceLevelAgreementsPage />,
                stateWithVoice,
                {
                    route: '/app/reporting/stats/slas/calls',
                    path: '/app/reporting/stats/slas',
                },
            )

            await waitFor(() => {
                expect(
                    screen.getByRole('button', {
                        name: /download calls data/i,
                    }),
                ).toBeInTheDocument()
            })

            expect(
                screen.queryByRole('button', {
                    name: /download tickets data/i,
                }),
            ).not.toBeInTheDocument()
        })
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
            <ServiceLevelAgreementsPage />,
            baseState,
            {
                route: '/app/reporting/stats/slas',
                path: '/app/reporting/stats/slas',
            },
        )

        await waitFor(() => {
            expect(
                screen.getByText(/set up your first sla/i),
            ).toBeInTheDocument()
        })

        expect(screen.queryByText('Filters Panel')).not.toBeInTheDocument()
        expect(screen.queryByText('Dashboard Chart')).not.toBeInTheDocument()
    })
})
