import { payingWithCreditCard } from '@repo/billing/fixtures'
import { assumeMock, render } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockGetBillingInternalEstimatesSubscriptionHandler } from '@gorgias/helpdesk-mocks'

import {
    basicMonthlyHelpdeskPlan,
    proMonthlyHelpdeskPlan,
} from 'fixtures/plans'
import {
    useBillingState,
    useInternalProductCatalogPlans,
    useUpdateInternalSubscription,
} from 'models/billing/queries'
import type { InternalProductCatalogPlans } from 'models/billing/types'
import { ProductType, SubscriptionStatus } from 'models/billing/types'

import { InternalManagePlanView } from './InternalManagePlanView'

jest.mock('models/billing/queries')
jest.mock('hooks/useAppDispatch', () => ({ useAppDispatch: () => jest.fn() }))
jest.mock('pages/common/components/Loader/Loader', () => ({
    __esModule: true,
    Loader: () => <div role="progressbar" aria-label="Loading" />,
}))
jest.mock(
    'pages/settings/new_billing/components/BillingScheduledUpdates/BillingScheduledUpdates',
    () => ({
        __esModule: true,
        BillingScheduledUpdates: () => (
            <div data-testid="billing-scheduled-updates">Scheduled Updates</div>
        ),
    }),
)

const mockUseBillingState = assumeMock(useBillingState)
const mockUseInternalProductCatalogPlans = assumeMock(
    useInternalProductCatalogPlans,
)
const mockUseUpdateInternalSubscription = assumeMock(
    useUpdateInternalSubscription,
)

const server = setupServer(
    mockGetBillingInternalEstimatesSubscriptionHandler(async () =>
        HttpResponse.json({
            balance_due: 0,
            immediate_changes_summary: null,
        }),
    ).handler,
)

const catalogPlans: InternalProductCatalogPlans = {
    [ProductType.Helpdesk]: {
        [basicMonthlyHelpdeskPlan.plan_id]: basicMonthlyHelpdeskPlan,
        [proMonthlyHelpdeskPlan.plan_id]: proMonthlyHelpdeskPlan,
    },
}

function mockMutationHook() {
    mockUseUpdateInternalSubscription.mockReturnValue({
        mutateAsync: jest.fn().mockResolvedValue({ products: {} }),
        isLoading: false,
    } as any)
}

function mockLoadingState() {
    mockMutationHook()
    mockUseBillingState.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
    } as any)
    mockUseInternalProductCatalogPlans.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
    } as any)
}

function mockDataReady() {
    mockMutationHook()
    mockUseBillingState.mockReturnValue({
        data: payingWithCreditCard,
        isLoading: false,
        isError: false,
    } as any)
    mockUseInternalProductCatalogPlans.mockReturnValue({
        data: { plans: catalogPlans },
        isLoading: false,
        isError: false,
    } as any)
}

function mockErrorState() {
    mockMutationHook()
    mockUseBillingState.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
    } as any)
    mockUseInternalProductCatalogPlans.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
    } as any)
}

function renderComponent() {
    return render(<InternalManagePlanView />)
}

describe('InternalManagePlanView', () => {
    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    afterEach(() => {
        server.resetHandlers()
    })

    afterAll(() => {
        server.close()
    })

    it('shows loader when data is fetching', () => {
        mockLoadingState()
        renderComponent()

        expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })

    it('shows error message when fetching fails', () => {
        mockErrorState()
        renderComponent()

        expect(
            screen.getByText(
                'An error has occurred: could not fetch billing data',
            ),
        ).toBeInTheDocument()
    })

    it('renders Go Back button, Select Plans heading, and Summary heading when data loads', () => {
        mockDataReady()
        renderComponent()

        expect(
            screen.getByRole('button', { name: /go back/i }),
        ).toBeInTheDocument()
        expect(screen.getByText('Select Plans')).toBeInTheDocument()
        expect(screen.getByText('Summary')).toBeInTheDocument()
    })

    it('updates summary when selecting a different plan from dropdown', async () => {
        const user = userEvent.setup()
        mockDataReady()
        renderComponent()

        const trigger = screen.getByRole('button', { name: /300/ })
        await user.click(trigger)

        const option = await screen.findByText(proMonthlyHelpdeskPlan.plan_id)
        await user.click(option)

        await waitFor(() => {
            expect(screen.getByText('Upgraded')).toBeInTheDocument()
        })
        expect(
            screen.getByRole('button', { name: /preview changes/i }),
        ).toBeEnabled()
    })

    describe('subscription status badge', () => {
        function mockBillingStateWith(
            subscriptionOverrides: Partial<
                typeof payingWithCreditCard.subscription
            >,
        ) {
            mockMutationHook()
            mockUseBillingState.mockReturnValue({
                data: {
                    ...payingWithCreditCard,
                    subscription: {
                        ...payingWithCreditCard.subscription,
                        ...subscriptionOverrides,
                    },
                },
                isLoading: false,
                isError: false,
            } as any)
            mockUseInternalProductCatalogPlans.mockReturnValue({
                data: { plans: catalogPlans },
                isLoading: false,
                isError: false,
            } as any)
        }

        it('shows ACTIVE badge for an active subscription', () => {
            mockDataReady()
            renderComponent()

            expect(screen.getByText('ACTIVE')).toBeInTheDocument()
        })

        it('shows PAUSED badge when subscription is paused', () => {
            mockBillingStateWith({ is_paused: true })
            renderComponent()

            expect(screen.getByText('PAUSED')).toBeInTheDocument()
        })

        it('shows TRIALING badge when is_trialing is true', () => {
            mockBillingStateWith({ is_trialing: true })
            renderComponent()

            expect(screen.getByText('TRIALING')).toBeInTheDocument()
        })

        it('shows NON RENEWING badge when subscription has a scheduled cancellation date', () => {
            mockBillingStateWith({
                scheduled_to_cancel_at: '2025-12-01T00:00:00+00:00',
            })
            renderComponent()

            expect(screen.getByText('NON RENEWING')).toBeInTheDocument()
        })

        it('shows CANCELED badge for a canceled subscription', () => {
            mockBillingStateWith({ status: SubscriptionStatus.CANCELED })
            renderComponent()

            expect(screen.getByText('CANCELED')).toBeInTheDocument()
        })

        it('shows PAST DUE badge for a past-due subscription', () => {
            mockBillingStateWith({ status: SubscriptionStatus.PAST_DUE })
            renderComponent()

            expect(screen.getByText('PAST DUE')).toBeInTheDocument()
        })

        it('shows TRIALING badge when status is TRIALING enum (is_trialing false)', () => {
            mockBillingStateWith({
                status: SubscriptionStatus.TRIALING,
                is_trialing: false,
                scheduled_to_cancel_at: null,
            })
            renderComponent()

            expect(screen.getByText('TRIALING')).toBeInTheDocument()
        })

        it('PAUSED takes priority over is_trialing', () => {
            mockBillingStateWith({ is_paused: true, is_trialing: true })
            renderComponent()

            expect(screen.getByText('PAUSED')).toBeInTheDocument()
            expect(screen.queryByText('TRIALING')).not.toBeInTheDocument()
        })

        it('TRIALING takes priority over NON RENEWING', () => {
            mockBillingStateWith({
                is_trialing: true,
                scheduled_to_cancel_at: '2025-12-01T00:00:00+00:00',
            })
            renderComponent()

            expect(screen.getByText('TRIALING')).toBeInTheDocument()
            expect(screen.queryByText('NON RENEWING')).not.toBeInTheDocument()
        })
    })

    describe('BillingScheduledUpdates visibility', () => {
        function mockBillingStateWith(
            subscriptionOverrides: Partial<
                typeof payingWithCreditCard.subscription
            >,
        ) {
            mockMutationHook()
            mockUseBillingState.mockReturnValue({
                data: {
                    ...payingWithCreditCard,
                    subscription: {
                        ...payingWithCreditCard.subscription,
                        ...subscriptionOverrides,
                    },
                },
                isLoading: false,
                isError: false,
            } as any)
            mockUseInternalProductCatalogPlans.mockReturnValue({
                data: { plans: catalogPlans },
                isLoading: false,
                isError: false,
            } as any)
        }

        it('shows BillingScheduledUpdates for an active subscription', () => {
            mockDataReady()
            renderComponent()

            expect(
                screen.getByTestId('billing-scheduled-updates'),
            ).toBeInTheDocument()
        })

        it('shows BillingScheduledUpdates for a past-due subscription', () => {
            mockBillingStateWith({ status: SubscriptionStatus.PAST_DUE })
            renderComponent()

            expect(
                screen.getByTestId('billing-scheduled-updates'),
            ).toBeInTheDocument()
        })

        it('does not show BillingScheduledUpdates for a canceled subscription', () => {
            mockBillingStateWith({ status: SubscriptionStatus.CANCELED })
            renderComponent()

            expect(
                screen.queryByTestId('billing-scheduled-updates'),
            ).not.toBeInTheDocument()
        })

        it('does not show BillingScheduledUpdates for a trialing subscription', () => {
            mockBillingStateWith({
                status: SubscriptionStatus.TRIALING,
                is_trialing: false,
                scheduled_to_cancel_at: null,
            })
            renderComponent()

            expect(
                screen.queryByTestId('billing-scheduled-updates'),
            ).not.toBeInTheDocument()
        })

        it('shows BillingScheduledUpdates for a paused subscription (status remains ACTIVE)', () => {
            mockBillingStateWith({ is_paused: true })
            renderComponent()

            expect(
                screen.getByTestId('billing-scheduled-updates'),
            ).toBeInTheDocument()
        })
    })

    it('opens confirm modal when Preview changes is clicked after selecting a plan', async () => {
        const user = userEvent.setup()
        mockDataReady()
        renderComponent()

        const trigger = screen.getByRole('button', { name: /300/ })
        await user.click(trigger)

        const option = await screen.findByText(proMonthlyHelpdeskPlan.plan_id)
        await user.click(option)

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /preview changes/i }),
            ).toBeEnabled()
        })

        await user.click(
            screen.getByRole('button', { name: /preview changes/i }),
        )

        await waitFor(() => {
            expect(screen.getByText('Confirm changes')).toBeInTheDocument()
        })
        expect(
            screen.getByRole('button', { name: /apply with invoice/i }),
        ).toBeInTheDocument()
    })
})
