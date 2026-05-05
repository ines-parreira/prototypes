import { useState } from 'react'
import type { ComponentProps } from 'react'

import type { ResponseBillingState } from '@repo/billing'
import { BILLING_BASE_PATH, useBillingState } from '@repo/billing'
import { logEvent, reportError, SegmentEvent } from '@repo/logging'
import { assumeMock, render } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { AxiosError, AxiosHeaders } from 'axios'
import { fromJS } from 'immutable'

import { queryKeys } from '@gorgias/helpdesk-queries'
import type {
    CustomerSummary,
    ScheduledChange,
    SubscriptionSummary,
} from '@gorgias/helpdesk-types'
import { ChangeType } from '@gorgias/helpdesk-types'

import { UserRole } from 'config/types/user'
import { account, automationSubscriptionProductPrices } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import {
    basicMonthlyAutomationPlan,
    basicYearlyInvoicedMonthlyHelpdeskPlan,
    HELPDESK_PRODUCT_ID,
} from 'fixtures/plans'
import { getSubscriptionQuery } from 'models/billing/queries'
import { ProductType } from 'models/billing/types'
import {
    updateSubscription,
    updateSubscriptionsForPlans,
} from 'state/currentAccount/actions'
import type { SubscriptionUpdateResponse } from 'state/currentAccount/actions'
import type { RootState } from 'state/types'

import AutomateSubscriptionModal from '../AutomateSubscriptionModal'

const defaultState: Partial<RootState> = {
    currentUser: fromJS({
        role: { name: UserRole.Admin },
    }),
    currentAccount: fromJS({
        ...account,
        current_subscription: {
            ...account.current_subscription,
            status: 'active',
        },
    }),
    billing: fromJS(billingState),
}

jest.mock('@repo/logging')
const logEventMock = assumeMock(logEvent)
const reportErrorMock = assumeMock(reportError)

const mockUseFlag = jest.fn()
jest.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: {
        MidCycleUpgradeBillingLogic: 'MidCycleUpgradeBillingLogic',
    },
    useFlag: (...args: unknown[]) => mockUseFlag(...args),
}))

jest.mock('@repo/billing', () => ({
    ...jest.requireActual('@repo/billing'),
    useBillingState: jest.fn(),
}))
const mockUseBillingState = assumeMock(useBillingState)

const mockInvalidateQueries = jest.fn()
jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual('@tanstack/react-query'),
    useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
}))

const mockHistoryPush = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-router-dom'),
    useHistory: () => ({
        push: mockHistoryPush,
        location: { pathname: '/' },
    }),
}))

jest.mock('pages/settings/new_billing/components/ConfirmChangesModal', () => ({
    ConfirmChangesModal: jest
        .requireActual(
            'pages/settings/new_billing/components/ConfirmChangesModal/tests/mockConfirmChangesModal',
        )
        .mockConfirmChangesModalComponent(),
}))

jest.mock('state/currentAccount/actions', () => ({
    ...jest.requireActual('state/currentAccount/actions'),
    updateSubscription: jest.fn(),
    updateSubscriptionsForPlans: jest.fn(),
}))
const mockUpdateSubscription = assumeMock(updateSubscription)
const mockUpdateSubscriptionsForPlans = assumeMock(updateSubscriptionsForPlans)

const idleBillingState = { data: undefined } as ResponseBillingState

function makeSubscriptionData(
    overrides: Partial<SubscriptionSummary> = {},
): SubscriptionSummary {
    return {
        resource_version: 7,
        schedule_resource_version: 3,
        current_billing_cycle_end_datetime: '2026-05-23T00:00:00+00:00',
        downgrades: [],
        scheduled_changes: [],
        is_paused: false,
        ...overrides,
    } as SubscriptionSummary
}

function billingStateWithSubscription({
    customer = { credit_card: { last4: '4242' } } as CustomerSummary,
    subscriptionOverrides = {},
    isLoading = false,
}: {
    customer?: Partial<CustomerSummary>
    subscriptionOverrides?: Partial<SubscriptionSummary>
    isLoading?: boolean
} = {}): ResponseBillingState {
    return {
        data: {
            subscription: makeSubscriptionData(subscriptionOverrides),
            customer: customer as CustomerSummary,
        } as ResponseBillingState['data'],
        isLoading,
    } as ResponseBillingState
}

const subscriptionLevelScheduledChange: ScheduledChange = {
    current_plan_id: null,
    scheduled_change_types: [ChangeType.ContractCadenceChange],
    scheduled_plan: null,
}

const automationScheduledChange: ScheduledChange = {
    current_plan_id: basicMonthlyAutomationPlan.plan_id,
    scheduled_change_types: [ChangeType.Unsubscription],
    scheduled_plan: null,
}

const plannedAutomationScheduledChange: ScheduledChange = {
    current_plan_id: null,
    scheduled_change_types: [ChangeType.Upgrade],
    scheduled_plan: {
        product: ProductType.Automation,
    } as ScheduledChange['scheduled_plan'],
}

const unrelatedProductScheduledChange: ScheduledChange = {
    current_plan_id: 'voice-monthly-usd-1',
    scheduled_change_types: [ChangeType.Upgrade],
    scheduled_plan: {
        product: ProductType.Voice,
    } as ScheduledChange['scheduled_plan'],
}

function makeGorgiasApiError(msg: string) {
    const headers = new AxiosHeaders()
    const error = new AxiosError(
        'Request failed with status code 400',
        'ERR_BAD_REQUEST',
    )
    error.response = {
        data: { error: { msg, data: null } },
        status: 400,
        statusText: 'Bad Request',
        headers: headers.toJSON() as never,
        config: { headers } as never,
    }
    return error
}

beforeEach(() => {
    mockUseFlag.mockReturnValue(false)
    mockUseBillingState.mockReturnValue(idleBillingState)
    mockUpdateSubscription.mockClear()
    mockUpdateSubscriptionsForPlans.mockClear()
    mockUpdateSubscription.mockImplementation(() => async () => {})
    mockUpdateSubscriptionsForPlans.mockImplementation(
        () => async (): Promise<SubscriptionUpdateResponse> => ({
            products: {},
        }),
    )
    mockHistoryPush.mockClear()
    mockInvalidateQueries.mockClear()
    reportErrorMock.mockClear()
})

const minProps: ComponentProps<typeof AutomateSubscriptionModal> = {
    confirmLabel: 'I am sure',
    isOpen: false,
    onClose: jest.fn(),
}

const automationSubscribedState: Partial<RootState> = {
    ...defaultState,
    currentAccount: fromJS({
        ...account,
        current_subscription: {
            ...account.current_subscription,
            products: automationSubscriptionProductPrices,
            status: 'active',
        },
    }),
}

// Test-only footer: DefaultFooter gates the subscribe button on a terms
// checkbox that only renders once useIsPaymentEnabled returns true, which in
// turn depends on billing queries outside the scope of these tests. This
// footer lets us exercise onConfirm directly and keep tests focused on the
// modal routing / mid-cycle preview logic.
const TestFooter = ({
    confirmLabel,
    onConfirm,
    isDisabled,
}: {
    confirmLabel: string
    onConfirm: () => void
    isDisabled?: boolean
}) => (
    <button
        type="button"
        onClick={onConfirm}
        aria-disabled={isDisabled || undefined}
    >
        {confirmLabel}
    </button>
)

describe('<AutomateSubscriptionModal />', () => {
    it('renders the subscribe modal with the confirm button disabled until a plan is configured', async () => {
        render(<AutomateSubscriptionModal {...minProps} isOpen />, {
            storeState: defaultState,
        })
        const button = await screen.findByRole('button', {
            name: /i am sure/i,
        })
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.AutomatePaywallModalUpsell,
            { location: '/' },
        )
        expect(
            screen.getByRole('heading', { name: /subscribe to ai agent/i }),
        ).toBeInTheDocument()
        expect(button).toHaveAttribute('aria-disabled', 'true')
    })

    it('renders the upgrade prompt copy in the subscribe modal', async () => {
        render(<AutomateSubscriptionModal {...minProps} isOpen />, {
            storeState: defaultState,
        })

        expect(
            await screen.findByText('Ready to upgrade with AI Agent?'),
        ).toBeInTheDocument()
    })

    it('renders the supplied image inside the modal body', async () => {
        render(
            <AutomateSubscriptionModal {...minProps} isOpen image="foo.png" />,
            { storeState: defaultState },
        )

        const img = await screen.findByAltText(/automation features/i)
        expect(img).toHaveAttribute('src', 'foo.png')
    })

    it('uses the headerDescription prop as the modal heading when provided', async () => {
        render(
            <AutomateSubscriptionModal
                {...minProps}
                isOpen
                headerDescription="Custom Header Text"
            />,
            { storeState: defaultState },
        )

        expect(
            await screen.findByRole('heading', { name: 'Custom Header Text' }),
        ).toBeInTheDocument()
    })

    it('shows the "Manage AI Agent" header when the user already has access', async () => {
        render(<AutomateSubscriptionModal {...minProps} isOpen />, {
            storeState: {
                ...defaultState,
                currentAccount: fromJS({
                    ...account,
                    current_subscription: {
                        ...account.current_subscription,
                        products: automationSubscriptionProductPrices,
                    },
                }),
            },
        })

        await waitFor(() => {
            expect(
                screen.getByRole('heading', { name: /manage ai agent/i }),
            ).toBeInTheDocument()
        })
    })

    it('shows the custom plan message and Contact Us button for yearly contract plans', async () => {
        const yearlyPlanState: Partial<RootState> = {
            ...defaultState,
            currentAccount: fromJS({
                ...account,
                current_subscription: {
                    ...account.current_subscription,
                    products: {
                        [HELPDESK_PRODUCT_ID]:
                            basicYearlyInvoicedMonthlyHelpdeskPlan.plan_id,
                    },
                    status: 'active',
                },
            }),
            billing: fromJS({
                ...billingState,
                products: billingState.products.map((product) =>
                    product.type === 'helpdesk'
                        ? {
                              ...product,
                              prices: [
                                  ...product.prices,
                                  basicYearlyInvoicedMonthlyHelpdeskPlan,
                              ],
                          }
                        : product,
                ),
            }),
        }

        render(<AutomateSubscriptionModal {...minProps} isOpen />, {
            storeState: yearlyPlanState,
        })

        await waitFor(() => {
            expect(
                screen.getByText(
                    'Contact our team to subscribe to a custom plan.',
                ),
            ).toBeInTheDocument()
        })

        expect(
            screen.getByRole('button', { name: /contact us/i }),
        ).toBeInTheDocument()
    })

    it('keeps the Contact Us modal open after closing the subscription modal', async () => {
        const user = userEvent.setup()
        const yearlyPlanState: Partial<RootState> = {
            ...defaultState,
            currentAccount: fromJS({
                ...account,
                current_subscription: {
                    ...account.current_subscription,
                    products: {
                        [HELPDESK_PRODUCT_ID]:
                            basicYearlyInvoicedMonthlyHelpdeskPlan.plan_id,
                    },
                    status: 'active',
                },
            }),
            billing: fromJS({
                ...billingState,
                products: billingState.products.map((product) =>
                    product.type === 'helpdesk'
                        ? {
                              ...product,
                              prices: [
                                  ...product.prices,
                                  basicYearlyInvoicedMonthlyHelpdeskPlan,
                              ],
                          }
                        : product,
                ),
            }),
        }

        const ContactSupportHarness = () => {
            const [isOpen, setIsOpen] = useState(true)

            return (
                <AutomateSubscriptionModal
                    {...minProps}
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                />
            )
        }

        render(<ContactSupportHarness />, { storeState: yearlyPlanState })

        await user.click(
            await screen.findByRole('button', { name: /contact us/i }),
        )

        expect(
            screen.queryByText(
                'Contact our team to subscribe to a custom plan.',
            ),
        ).not.toBeInTheDocument()
        expect(
            screen.getByRole('dialog', { name: /contact us/i }),
        ).toBeInTheDocument()
    })

    describe('legacy subscription update', () => {
        it('cancels the subscription via updateSubscription when clicking Cancel subscription', async () => {
            const user = userEvent.setup()

            render(<AutomateSubscriptionModal {...minProps} isOpen />, {
                storeState: automationSubscribedState,
            })

            await user.click(
                await screen.findByRole('button', {
                    name: /cancel subscription/i,
                }),
            )

            await waitFor(() => {
                expect(mockUpdateSubscription).toHaveBeenCalled()
            })
            const [submittedArgs] = mockUpdateSubscription.mock.calls[0]
            expect(submittedArgs.prices).not.toContain(
                basicMonthlyAutomationPlan.plan_id,
            )
        })

        it('reports the error and skips navigation when the legacy update dispatches UPDATE_SUBSCRIPTION_ERROR', async () => {
            const user = userEvent.setup()
            const apiError = makeGorgiasApiError(
                "We couldn't update your subscription.",
            )
            mockUpdateSubscription.mockImplementation(() => async () => ({
                type: 'UPDATE_SUBSCRIPTION_ERROR',
                error: apiError,
                reason: 'Failed to update the current subscription.',
            }))

            render(
                <AutomateSubscriptionModal
                    {...minProps}
                    isOpen
                    footer={TestFooter}
                />,
                { storeState: defaultState },
            )

            await user.click(
                await screen.findByRole('button', { name: /i am sure/i }),
            )

            await waitFor(() => {
                expect(reportErrorMock).toHaveBeenCalledWith(apiError)
            })
            expect(mockHistoryPush).not.toHaveBeenCalledWith(BILLING_BASE_PATH)
        })

        it('navigates to billing root after a successful legacy subscription update', async () => {
            const user = userEvent.setup()
            mockUseBillingState.mockReturnValue(billingStateWithSubscription())

            render(
                <AutomateSubscriptionModal
                    {...minProps}
                    isOpen
                    footer={TestFooter}
                />,
                { storeState: defaultState },
            )

            await user.click(
                await screen.findByRole('button', { name: /i am sure/i }),
            )

            await waitFor(() => {
                expect(mockHistoryPush).toHaveBeenCalledWith(BILLING_BASE_PATH)
            })
            expect(mockUpdateSubscription).toHaveBeenCalled()
            expect(mockUpdateSubscriptionsForPlans).not.toHaveBeenCalled()
        })
    })

    describe('scheduled-change blocking', () => {
        it('blocks the plan selector from opening when mid-cycle flag is on and a scheduled change exists', async () => {
            const user = userEvent.setup()
            mockUseFlag.mockReturnValue(true)
            mockUseBillingState.mockReturnValue(
                billingStateWithSubscription({
                    subscriptionOverrides: {
                        scheduled_changes: [plannedAutomationScheduledChange],
                    },
                }),
            )

            render(<AutomateSubscriptionModal {...minProps} isOpen />, {
                storeState: defaultState,
            })

            const selector = await screen.findByLabelText('Plan')
            await user.click(selector)

            expect(screen.queryAllByRole('menuitem')).toHaveLength(0)
        })

        it('opens the plan selector when a scheduled change exists but the flag is off', async () => {
            const user = userEvent.setup()
            mockUseBillingState.mockReturnValue(
                billingStateWithSubscription({
                    subscriptionOverrides: {
                        scheduled_changes: [subscriptionLevelScheduledChange],
                    },
                }),
            )

            render(<AutomateSubscriptionModal {...minProps} isOpen />, {
                storeState: defaultState,
            })

            const selector = await screen.findByLabelText('Plan')
            await user.click(selector)

            expect(screen.getAllByRole('menuitem').length).toBeGreaterThan(0)
        })

        it('opens the plan selector when the scheduled change is for an unrelated product', async () => {
            const user = userEvent.setup()
            mockUseFlag.mockReturnValue(true)
            mockUseBillingState.mockReturnValue(
                billingStateWithSubscription({
                    subscriptionOverrides: {
                        scheduled_changes: [unrelatedProductScheduledChange],
                    },
                }),
            )

            render(<AutomateSubscriptionModal {...minProps} isOpen />, {
                storeState: defaultState,
            })

            const selector = await screen.findByLabelText('Plan')
            await user.click(selector)

            expect(screen.getAllByRole('menuitem').length).toBeGreaterThan(0)
        })

        it('disables the Subscribe CTA when scheduledChangesBlocking is true', async () => {
            mockUseFlag.mockReturnValue(true)
            mockUseBillingState.mockReturnValue(
                billingStateWithSubscription({
                    subscriptionOverrides: {
                        scheduled_changes: [subscriptionLevelScheduledChange],
                    },
                }),
            )

            render(<AutomateSubscriptionModal {...minProps} isOpen />, {
                storeState: defaultState,
            })

            const subscribeButton = await screen.findByRole('button', {
                name: /i am sure/i,
            })
            expect(subscribeButton).toHaveAttribute('aria-disabled', 'true')
        })

        it('disables the cancel subscription CTA while billing state is still loading scheduled changes', async () => {
            mockUseFlag.mockReturnValue(true)
            mockUseBillingState.mockReturnValue(
                billingStateWithSubscription({ isLoading: true }),
            )

            render(<AutomateSubscriptionModal {...minProps} isOpen />, {
                storeState: automationSubscribedState,
            })

            const cancelButton = await screen.findByRole('button', {
                name: /cancel subscription/i,
            })
            expect(cancelButton).toHaveAttribute('aria-disabled', 'true')
        })

        it('disables the cancel subscription CTA when the automation subscription has a scheduled change', async () => {
            mockUseFlag.mockReturnValue(true)
            mockUseBillingState.mockReturnValue(
                billingStateWithSubscription({
                    subscriptionOverrides: {
                        scheduled_changes: [automationScheduledChange],
                    },
                }),
            )

            render(<AutomateSubscriptionModal {...minProps} isOpen />, {
                storeState: automationSubscribedState,
            })

            const cancelButton = await screen.findByRole('button', {
                name: /cancel subscription/i,
            })
            expect(cancelButton).toHaveAttribute('aria-disabled', 'true')
        })

        it('shows the scheduled-change tooltip when hovering the disabled Cancel subscription CTA', async () => {
            const user = userEvent.setup()
            mockUseFlag.mockReturnValue(true)
            mockUseBillingState.mockReturnValue(
                billingStateWithSubscription({
                    subscriptionOverrides: {
                        scheduled_changes: [automationScheduledChange],
                    },
                }),
            )

            render(<AutomateSubscriptionModal {...minProps} isOpen />, {
                storeState: automationSubscribedState,
            })

            const cancelButton = await screen.findByRole('button', {
                name: /cancel subscription/i,
            })
            await user.hover(cancelButton.parentElement as HTMLElement)

            expect(await screen.findByRole('tooltip')).toHaveTextContent(
                /A subscription change is already scheduled/i,
            )
        })

        it('shows the scheduled-change tooltip when hovering the disabled Subscribe CTA', async () => {
            const user = userEvent.setup()
            mockUseFlag.mockReturnValue(true)
            mockUseBillingState.mockReturnValue(
                billingStateWithSubscription({
                    subscriptionOverrides: {
                        scheduled_changes: [subscriptionLevelScheduledChange],
                    },
                }),
            )

            render(<AutomateSubscriptionModal {...minProps} isOpen />, {
                storeState: defaultState,
            })

            const subscribeButton = await screen.findByRole('button', {
                name: /i am sure/i,
            })
            // Hover the wrapping div — disabled buttons don't fire pointer
            // events so the Tooltip listens on the wrapper.
            await user.hover(subscribeButton.parentElement as HTMLElement)

            expect(await screen.findByRole('tooltip')).toHaveTextContent(
                /A subscription change is already scheduled/i,
            )
        })

        it('prefers the scheduled-change tooltip over the admin tooltip for non-admins', async () => {
            const user = userEvent.setup()
            mockUseFlag.mockReturnValue(true)
            mockUseBillingState.mockReturnValue(
                billingStateWithSubscription({
                    subscriptionOverrides: {
                        scheduled_changes: [subscriptionLevelScheduledChange],
                    },
                }),
            )

            const nonAdminState: Partial<RootState> = {
                ...defaultState,
                currentUser: fromJS({
                    role: { name: UserRole.Agent },
                }),
            }

            render(<AutomateSubscriptionModal {...minProps} isOpen />, {
                storeState: nonAdminState,
            })

            const subscribeButton = await screen.findByRole('button', {
                name: /i am sure/i,
            })
            await user.hover(subscribeButton.parentElement as HTMLElement)

            const tooltip = await screen.findByRole('tooltip')
            expect(tooltip).toHaveTextContent(
                /A subscription change is already scheduled/i,
            )
            expect(tooltip).not.toHaveTextContent(/reach out to an admin/i)
        })
    })

    describe('mid-cycle confirm changes modal', () => {
        const trialingSubscriptionState: Partial<RootState> = {
            ...defaultState,
            currentAccount: fromJS({
                ...account,
                current_subscription: {
                    ...account.current_subscription,
                    status: 'trialing',
                },
            }),
        }

        it('opens the confirm changes modal on subscribe when flag is on and subscription is active', async () => {
            const user = userEvent.setup()
            mockUseFlag.mockReturnValue(true)
            mockUseBillingState.mockReturnValue(billingStateWithSubscription())

            render(
                <AutomateSubscriptionModal
                    {...minProps}
                    isOpen
                    footer={TestFooter}
                />,
                { storeState: defaultState },
            )

            expect(screen.getByText('confirm modal closed')).toBeInTheDocument()

            await user.click(
                await screen.findByRole('button', { name: /i am sure/i }),
            )

            expect(
                await screen.findByText('confirm modal open'),
            ).toBeInTheDocument()
        })

        it('does not open the confirm changes modal for trialing subscriptions', async () => {
            const user = userEvent.setup()
            mockUseFlag.mockReturnValue(true)
            mockUseBillingState.mockReturnValue(billingStateWithSubscription())

            render(
                <AutomateSubscriptionModal
                    {...minProps}
                    isOpen
                    footer={TestFooter}
                />,
                { storeState: trialingSubscriptionState },
            )

            await user.click(
                await screen.findByRole('button', { name: /i am sure/i }),
            )

            await waitFor(() => {
                expect(mockUpdateSubscription).toHaveBeenCalled()
            })
            expect(screen.queryByText(/confirm modal/)).not.toBeInTheDocument()
        })

        it('does not open the confirm changes modal when flag is off', async () => {
            const user = userEvent.setup()
            mockUseBillingState.mockReturnValue(billingStateWithSubscription())

            render(
                <AutomateSubscriptionModal
                    {...minProps}
                    isOpen
                    footer={TestFooter}
                />,
                { storeState: defaultState },
            )

            await user.click(
                await screen.findByRole('button', { name: /i am sure/i }),
            )

            await waitFor(() => {
                expect(mockUpdateSubscription).toHaveBeenCalled()
            })
            expect(
                screen.queryByText('confirm modal open'),
            ).not.toBeInTheDocument()
        })

        it('disables Subscribe while billing state is still loading mid-cycle preview data', async () => {
            mockUseFlag.mockReturnValue(true)
            mockUseBillingState.mockReturnValue(
                billingStateWithSubscription({ isLoading: true }),
            )

            render(<AutomateSubscriptionModal {...minProps} isOpen />, {
                storeState: defaultState,
            })

            const subscribeButton = await screen.findByRole('button', {
                name: /i am sure/i,
            })
            expect(subscribeButton).toHaveAttribute('aria-disabled', 'true')
        })

        it('disables Subscribe and does not fall back to legacy update when active subscription data is missing', async () => {
            const user = userEvent.setup()
            mockUseFlag.mockReturnValue(true)
            mockUseBillingState.mockReturnValue(idleBillingState)

            render(
                <AutomateSubscriptionModal
                    {...minProps}
                    isOpen
                    footer={TestFooter}
                />,
                { storeState: defaultState },
            )

            const subscribeButton = await screen.findByRole('button', {
                name: /i am sure/i,
            })
            expect(subscribeButton).toHaveAttribute('aria-disabled', 'true')

            await user.click(subscribeButton)

            expect(reportErrorMock).not.toHaveBeenCalled()
            expect(mockUpdateSubscription).not.toHaveBeenCalled()
            expect(mockHistoryPush).not.toHaveBeenCalled()
            expect(screen.queryByText(/confirm modal/)).not.toBeInTheDocument()
        })

        it('opens the confirm changes modal with the payment-method-missing banner when active subscription lacks a card', async () => {
            const user = userEvent.setup()
            mockUseFlag.mockReturnValue(true)
            mockUseBillingState.mockReturnValue(
                billingStateWithSubscription({ customer: {} }),
            )

            render(<AutomateSubscriptionModal {...minProps} isOpen />, {
                storeState: defaultState,
            })

            const subscribeButton = await screen.findByRole('button', {
                name: /i am sure/i,
            })
            expect(subscribeButton).not.toHaveAttribute('aria-disabled', 'true')
            await user.click(subscribeButton)

            expect(
                await screen.findByText('confirm modal open'),
            ).toBeInTheDocument()
            expect(
                await screen.findByText('payment method missing'),
            ).toBeInTheDocument()
        })

        it('invalidates billing queries after confirming a mid-cycle subscription update', async () => {
            const user = userEvent.setup()
            mockUseFlag.mockReturnValue(true)
            mockUseBillingState.mockReturnValue(billingStateWithSubscription())

            render(
                <AutomateSubscriptionModal
                    {...minProps}
                    isOpen
                    footer={TestFooter}
                />,
                { storeState: defaultState },
            )

            await user.click(
                await screen.findByRole('button', { name: /i am sure/i }),
            )
            await user.click(
                await screen.findByRole('button', {
                    name: /confirm changes/i,
                }),
            )

            await waitFor(() => {
                expect(mockUpdateSubscriptionsForPlans).toHaveBeenCalled()
            })
            expect(mockInvalidateQueries).toHaveBeenCalledWith({
                queryKey: getSubscriptionQuery.queryKey,
            })
            expect(mockInvalidateQueries).toHaveBeenCalledWith({
                queryKey: queryKeys.billing.getBillingState(),
            })
        })

        it('does not surface payment-method-missing banner when a card is on file', async () => {
            mockUseFlag.mockReturnValue(true)
            mockUseBillingState.mockReturnValue(billingStateWithSubscription())

            render(<AutomateSubscriptionModal {...minProps} isOpen />, {
                storeState: defaultState,
            })

            await screen.findByText('confirm modal closed')
            expect(
                screen.queryByText('payment method missing'),
            ).not.toBeInTheDocument()
        })

        it('shows pending-invoice banner when submit fails with a pending-invoice error', async () => {
            const user = userEvent.setup()
            mockUseFlag.mockReturnValue(true)
            mockUseBillingState.mockReturnValue(billingStateWithSubscription())
            mockUpdateSubscriptionsForPlans.mockImplementation(
                () => async (): Promise<never> => {
                    throw makeGorgiasApiError(
                        'Proration cannot be performed until all pending invoices are resolved.',
                    )
                },
            )

            render(
                <AutomateSubscriptionModal
                    {...minProps}
                    isOpen
                    footer={TestFooter}
                />,
                { storeState: defaultState },
            )

            await user.click(
                await screen.findByRole('button', { name: /i am sure/i }),
            )
            await user.click(
                await screen.findByRole('button', { name: /confirm changes/i }),
            )

            expect(
                await screen.findByText('pending invoice error'),
            ).toBeInTheDocument()
        })

        it('shows version-conflict banner when submit fails with a version-conflict error', async () => {
            const user = userEvent.setup()
            mockUseFlag.mockReturnValue(true)
            mockUseBillingState.mockReturnValue(billingStateWithSubscription())
            mockUpdateSubscriptionsForPlans.mockImplementation(
                () => async (): Promise<never> => {
                    throw makeGorgiasApiError(
                        'subscription has been modified since it was last retrieved',
                    )
                },
            )

            render(
                <AutomateSubscriptionModal
                    {...minProps}
                    isOpen
                    footer={TestFooter}
                />,
                { storeState: defaultState },
            )

            await user.click(
                await screen.findByRole('button', { name: /i am sure/i }),
            )
            await user.click(
                await screen.findByRole('button', { name: /confirm changes/i }),
            )

            expect(
                await screen.findByText('version conflict error'),
            ).toBeInTheDocument()
        })

        it('clears the pending-invoice banner when the confirm modal is closed', async () => {
            const user = userEvent.setup()
            mockUseFlag.mockReturnValue(true)
            mockUseBillingState.mockReturnValue(billingStateWithSubscription())
            mockUpdateSubscriptionsForPlans.mockImplementation(
                () => async (): Promise<never> => {
                    throw makeGorgiasApiError(
                        'Proration cannot be performed until all pending invoices are resolved.',
                    )
                },
            )

            render(
                <AutomateSubscriptionModal
                    {...minProps}
                    isOpen
                    footer={TestFooter}
                />,
                { storeState: defaultState },
            )

            await user.click(
                await screen.findByRole('button', { name: /i am sure/i }),
            )
            await user.click(
                await screen.findByRole('button', { name: /confirm changes/i }),
            )

            expect(
                await screen.findByText('pending invoice error'),
            ).toBeInTheDocument()

            await user.click(
                await screen.findByRole('button', { name: /close modal/i }),
            )

            await waitFor(() => {
                expect(
                    screen.queryByText('pending invoice error'),
                ).not.toBeInTheDocument()
            })
        })

        it('reports unexpected confirm-flow errors to error tracking', async () => {
            const user = userEvent.setup()
            mockUseFlag.mockReturnValue(true)
            mockUseBillingState.mockReturnValue(billingStateWithSubscription())
            const unexpectedError = new Error('boom')
            mockUpdateSubscriptionsForPlans.mockImplementation(
                () => async () => {
                    throw unexpectedError
                },
            )

            render(
                <AutomateSubscriptionModal
                    {...minProps}
                    isOpen
                    footer={TestFooter}
                />,
                { storeState: defaultState },
            )

            await user.click(
                await screen.findByRole('button', { name: /i am sure/i }),
            )
            await user.click(
                await screen.findByRole('button', { name: /confirm changes/i }),
            )

            await waitFor(() => {
                expect(reportErrorMock).toHaveBeenCalledWith(unexpectedError)
            })
            expect(
                screen.queryByText('pending invoice error'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText('version conflict error'),
            ).not.toBeInTheDocument()
        })
    })
})
