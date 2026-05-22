import type { SelectedPlans } from '@repo/billing'
import { render } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockGetBillingEstimatesSubscriptionHandler,
    mockGetBillingEstimatesSubscriptionResponse,
} from '@gorgias/helpdesk-mocks'

import {
    basicMonthlyAutomationPlan,
    basicMonthlyHelpdeskPlan,
    convertPlan1,
    proMonthlyHelpdeskPlan,
    smsPlan1,
    voicePlan1,
} from 'fixtures/plans'
import { Cadence, ProductType } from 'models/billing/types'

import type { ConfirmChangesModalProps } from '../ConfirmChangesModal'
import { ConfirmChangesModal } from '../ConfirmChangesModal'

jest.mock('hooks/useGetDateAndTimeFormat', () => jest.fn(() => 'MMMM D, YYYY'))

jest.mock('../../BillingSummaryBreakdown', () => ({
    BillingSummaryBreakdown: jest.fn(
        ({
            estimateErrorMessage,
            onRetryEstimate,
        }: {
            estimateErrorMessage?: string
            onRetryEstimate?: () => void
        }) =>
            estimateErrorMessage ? (
                <div>
                    <span>{estimateErrorMessage}</span>
                    {onRetryEstimate && (
                        <button type="button" onClick={onRetryEstimate}>
                            Retry
                        </button>
                    )}
                </div>
            ) : null,
    ),
}))

const mockUseFlag = jest.fn()
jest.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: {
        MidCycleUpgradeBillingLogic: 'MidCycleUpgradeBillingLogic',
    },
    useFlag: (...args: unknown[]) => mockUseFlag(...args),
}))

const server = setupServer()

const selectedPlans: SelectedPlans = {
    [ProductType.Helpdesk]: {
        plan: basicMonthlyHelpdeskPlan,
        isSelected: true,
    },
    [ProductType.Automation]: { isSelected: false },
    [ProductType.Voice]: { isSelected: false },
    [ProductType.SMS]: { isSelected: false },
    [ProductType.Convert]: { isSelected: false },
}

const plansByProduct: ConfirmChangesModalProps['plansByProduct'] = {
    [ProductType.Helpdesk]: {
        current: basicMonthlyHelpdeskPlan,
        available: [basicMonthlyHelpdeskPlan, proMonthlyHelpdeskPlan],
    },
    [ProductType.Automation]: {
        available: [basicMonthlyAutomationPlan],
    },
    [ProductType.Voice]: { available: [voicePlan1] },
    [ProductType.SMS]: { available: [smsPlan1] },
    [ProductType.Convert]: { available: [convertPlan1] },
}

const defaultProps: ConfirmChangesModalProps = {
    isOpen: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    isConfirming: false,
    selectedPlans,
    cadence: Cadence.Month,
    periodEnd: '2026-12-31',
    plansByProduct,
    totalProductAmount: basicMonthlyHelpdeskPlan.amount,
    totalCancelledAmount: 0,
    cancelledProducts: [],
    currency: 'USD',
    cancellationDates: {},
    subscriptionResourceVersion: 12345,
}

function renderModal(overrides: Partial<ConfirmChangesModalProps> = {}) {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false, retryDelay: 0 },
        },
    })
    return render(
        <QueryClientProvider client={queryClient}>
            <ConfirmChangesModal {...defaultProps} {...overrides} />
        </QueryClientProvider>,
    )
}

const immediateOnlySummary = {
    changes_will_apply_at: null,
    contract_cadence_change: null,
    invoice_cadence_change: null,
    is_ramp: false,
    new_term_end: 1735689600,
    new_term_start: 1704067200,
    product_changes: {},
}

const scheduledOnlySummary = {
    changes_will_apply_at: 1735689600,
    contract_cadence_change: null,
    invoice_cadence_change: null,
    is_ramp: false,
    new_term_end: 1767225600,
    new_term_start: 1735689600,
    product_changes: {},
}

function useSuccessHandler(
    overrides: Partial<
        ReturnType<typeof mockGetBillingEstimatesSubscriptionResponse>
    > = {},
) {
    server.use(
        mockGetBillingEstimatesSubscriptionHandler(async () =>
            HttpResponse.json(
                mockGetBillingEstimatesSubscriptionResponse({
                    balance_due: null,
                    immediate_changes_summary: immediateOnlySummary,
                    scheduled_changes_summary: null,
                    ...overrides,
                }),
            ),
        ).handler,
    )
}

describe('ConfirmChangesModal', () => {
    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseFlag.mockReturnValue(true)
        useSuccessHandler()
    })

    afterEach(() => {
        server.resetHandlers()
    })

    afterAll(() => {
        server.close()
    })

    it('renders the modal with title and buttons', () => {
        renderModal()

        expect(
            screen.getByRole('dialog', { name: /confirm changes/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /go back/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /confirm/i }),
        ).toBeInTheDocument()
    })

    describe('description text (fallback, no estimates)', () => {
        beforeEach(() => {
            mockUseFlag.mockReturnValue(false)
        })

        it('shows upgrade-only description when plan is upgraded', () => {
            const upgradePlans: SelectedPlans = {
                ...selectedPlans,
                [ProductType.Helpdesk]: {
                    plan: proMonthlyHelpdeskPlan,
                    isSelected: true,
                },
            }
            renderModal({ selectedPlans: upgradePlans })

            expect(
                screen.getByText(
                    'Once you confirm, your changes will take effect immediately.',
                ),
            ).toBeInTheDocument()
        })

        it('shows downgrade-only description when plan is downgraded', () => {
            const downgradeByProduct: ConfirmChangesModalProps['plansByProduct'] =
                {
                    ...plansByProduct,
                    [ProductType.Helpdesk]: {
                        current: proMonthlyHelpdeskPlan,
                        available: [
                            basicMonthlyHelpdeskPlan,
                            proMonthlyHelpdeskPlan,
                        ],
                    },
                }
            renderModal({ plansByProduct: downgradeByProduct })

            expect(
                screen.getByText(
                    /your changes will take effect at the end of your billing cycle on 2026-12-31/,
                ),
            ).toBeInTheDocument()
        })

        it('shows mixed description when both upgrades and downgrades exist', () => {
            const mixedPlans: SelectedPlans = {
                ...selectedPlans,
                [ProductType.Helpdesk]: {
                    plan: proMonthlyHelpdeskPlan,
                    isSelected: true,
                },
                [ProductType.Automation]: {
                    plan: basicMonthlyAutomationPlan,
                    isSelected: true,
                },
            }
            const mixedByProduct: ConfirmChangesModalProps['plansByProduct'] = {
                ...plansByProduct,
                [ProductType.Automation]: {
                    current: basicMonthlyAutomationPlan,
                    available: [basicMonthlyAutomationPlan],
                },
            }
            renderModal({
                selectedPlans: mixedPlans,
                plansByProduct: mixedByProduct,
                cancelledProducts: [ProductType.Voice],
            })

            expect(
                screen.getByText(
                    /upgraded and added products will take effect immediately.*downgraded products will take effect at the end of your billing cycle on 2026-12-31/,
                ),
            ).toBeInTheDocument()
        })
    })

    describe('estimates integration', () => {
        it('keeps Confirm enabled while estimates are loading', async () => {
            server.use(
                mockGetBillingEstimatesSubscriptionHandler(
                    () => new Promise(() => {}),
                ).handler,
            )
            renderModal()

            expect(
                screen.getByRole('button', { name: /confirm/i }),
            ).toBeEnabled()
        })

        it('shows error state with retry button but keeps Confirm enabled', async () => {
            server.use(
                mockGetBillingEstimatesSubscriptionHandler(
                    async () => new HttpResponse(null, { status: 500 }),
                ).handler,
            )
            renderModal()

            expect(
                await screen.findByText(/failed to load estimate/i),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /retry/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /confirm/i }),
            ).toBeEnabled()
        })

        it('refetches estimate when retry button is clicked', async () => {
            const user = userEvent.setup()
            let requestCount = 0
            server.use(
                mockGetBillingEstimatesSubscriptionHandler(async () => {
                    requestCount++
                    return new HttpResponse(null, { status: 500 })
                }).handler,
            )
            renderModal()

            const retryButton = await screen.findByRole('button', {
                name: /retry/i,
            })
            const countBefore = requestCount

            await user.click(retryButton)

            await waitFor(() => {
                expect(requestCount).toBeGreaterThan(countBefore)
            })
        })

        it('sends reactivate=true as a query param when reactivate prop is true', async () => {
            const requestUrls: string[] = []
            server.use(
                mockGetBillingEstimatesSubscriptionHandler(
                    async ({ request }) => {
                        requestUrls.push(request.url)
                        return HttpResponse.json(
                            mockGetBillingEstimatesSubscriptionResponse({
                                balance_due: null,
                                immediate_changes_summary: immediateOnlySummary,
                                scheduled_changes_summary: null,
                            }),
                        )
                    },
                ).handler,
            )
            renderModal({ reactivate: true })

            await waitFor(() => expect(requestUrls.length).toBeGreaterThan(0))

            const url = new URL(requestUrls[0])
            expect(url.searchParams.get('reactivate')).toBe('true')
        })

        it('omits reactivate query param when reactivate prop is not set', async () => {
            const requestUrls: string[] = []
            server.use(
                mockGetBillingEstimatesSubscriptionHandler(
                    async ({ request }) => {
                        requestUrls.push(request.url)
                        return HttpResponse.json(
                            mockGetBillingEstimatesSubscriptionResponse({
                                balance_due: null,
                                immediate_changes_summary: immediateOnlySummary,
                                scheduled_changes_summary: null,
                            }),
                        )
                    },
                ).handler,
            )
            renderModal()

            await waitFor(() => expect(requestUrls.length).toBeGreaterThan(0))

            const url = new URL(requestUrls[0])
            expect(url.searchParams.get('reactivate')).toBeNull()
        })

        it('passes balanceDue to BillingSummaryBreakdown when estimate has balance_due', async () => {
            const { BillingSummaryBreakdown } = jest.requireMock(
                '../../BillingSummaryBreakdown',
            )
            useSuccessHandler({ balance_due: 5000 })
            renderModal()

            await waitFor(() => {
                expect(BillingSummaryBreakdown).toHaveBeenCalledWith(
                    expect.objectContaining({ balanceDue: 5000 }),
                    expect.anything(),
                )
            })
        })

        it('uses immediate-only description when only immediate changes exist', async () => {
            useSuccessHandler({
                immediate_changes_summary: immediateOnlySummary,
                scheduled_changes_summary: null,
            })
            renderModal()

            expect(
                await screen.findByText(
                    'Once you confirm, your changes will take effect immediately.',
                ),
            ).toBeInTheDocument()
        })

        it('uses scheduled-only description with formatted date when only scheduled changes exist', async () => {
            useSuccessHandler({
                immediate_changes_summary: null,
                scheduled_changes_summary: scheduledOnlySummary,
            })
            renderModal()

            expect(
                await screen.findByText(
                    /your changes will take effect at the end of your billing cycle on January 1, 2025/,
                ),
            ).toBeInTheDocument()
        })

        it('uses mixed description when both immediate and scheduled changes exist', async () => {
            useSuccessHandler({
                immediate_changes_summary: immediateOnlySummary,
                scheduled_changes_summary: scheduledOnlySummary,
            })
            renderModal()

            expect(
                await screen.findByText(
                    /upgraded and added products will take effect immediately.*downgraded products will take effect at the end of your billing cycle on January 1, 2025/,
                ),
            ).toBeInTheDocument()
        })

        it('falls back to local detection when estimate has no summaries', async () => {
            const { BillingSummaryBreakdown } = jest.requireMock(
                '../../BillingSummaryBreakdown',
            )
            useSuccessHandler({
                balance_due: 42,
                immediate_changes_summary: null,
                scheduled_changes_summary: null,
            })
            const upgradePlans: SelectedPlans = {
                ...selectedPlans,
                [ProductType.Helpdesk]: {
                    plan: proMonthlyHelpdeskPlan,
                    isSelected: true,
                },
            }
            renderModal({ selectedPlans: upgradePlans })

            await waitFor(() => {
                expect(BillingSummaryBreakdown).toHaveBeenCalledWith(
                    expect.objectContaining({ balanceDue: 42 }),
                    expect.anything(),
                )
            })

            expect(
                screen.getByText(
                    'Once you confirm, your changes will take effect immediately.',
                ),
            ).toBeInTheDocument()
        })
    })

    describe('button interactions', () => {
        it('calls onConfirm when Confirm button is clicked', async () => {
            const user = userEvent.setup()
            const onConfirm = jest.fn()
            renderModal({ onConfirm })

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /confirm/i }),
                ).toBeEnabled()
            })

            await user.click(screen.getByRole('button', { name: /confirm/i }))

            expect(onConfirm).toHaveBeenCalledTimes(1)
        })

        it('calls onClose when Go back button is clicked', async () => {
            const user = userEvent.setup()
            const onClose = jest.fn()
            renderModal({ onClose })

            await user.click(screen.getByRole('button', { name: /go back/i }))

            expect(onClose).toHaveBeenCalledTimes(1)
        })
    })

    it('calls onClose when dismissed via Escape while not confirming', async () => {
        const user = userEvent.setup()
        const onClose = jest.fn()
        renderModal({ onClose })

        await act(() => user.keyboard('{Escape}'))

        expect(onClose).toHaveBeenCalledTimes(1)
    })

    describe('while confirming', () => {
        it('disables Go back button', () => {
            renderModal({ isConfirming: true })

            expect(
                screen.getByRole('button', { name: /go back/i }),
            ).toBeDisabled()
        })

        it('does not call onClose on overlay dismiss via Escape', async () => {
            const user = userEvent.setup()
            const onClose = jest.fn()
            renderModal({ isConfirming: true, onClose })

            await act(() => user.keyboard('{Escape}'))

            expect(onClose).not.toHaveBeenCalled()
        })
    })

    it('does not render when isOpen is false', () => {
        renderModal({ isOpen: false })

        expect(
            screen.queryByRole('dialog', { name: /confirm changes/i }),
        ).not.toBeInTheDocument()
    })

    describe('blocking states', () => {
        it('renders pending invoice banner and disables Confirm when pendingInvoiceError is true', async () => {
            renderModal({ pendingInvoiceError: true })

            expect(
                await screen.findByText(/pending invoice must be resolved/i),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    /proration cannot be performed until all pending invoices are resolved/i,
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /confirm/i }),
            ).toBeDisabled()
        })

        it('renders payment-method banner and disables Confirm when isPaymentMethodMissing is true', async () => {
            renderModal({ isPaymentMethodMissing: true })

            expect(
                await screen.findByText(/add a payment method to continue/i),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /confirm/i }),
            ).toBeDisabled()
        })

        it('shows the pending invoice banner and hides the payment-method banner when both are set', async () => {
            renderModal({
                pendingInvoiceError: true,
                isPaymentMethodMissing: true,
            })

            expect(
                await screen.findByText(/pending invoice must be resolved/i),
            ).toBeInTheDocument()
            expect(
                screen.queryByText(/add a payment method to continue/i),
            ).not.toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /confirm/i }),
            ).toBeDisabled()
        })

        it('keeps Confirm enabled when neither blocking state is set', async () => {
            renderModal()

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /confirm/i }),
                ).toBeEnabled()
            })
            expect(
                screen.queryByText(/pending invoice must be resolved/i),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText(/add a payment method to continue/i),
            ).not.toBeInTheDocument()
        })

        it('surfaces the pending invoice banner when the estimate endpoint returns the typed error', async () => {
            server.use(
                mockGetBillingEstimatesSubscriptionHandler(async () =>
                    HttpResponse.json(
                        {
                            error: {
                                msg: "We couldn't get billing estimates because Proration cannot be performed until all pending invoices are resolved.",
                                data: null,
                            },
                        } as never,
                        { status: 400 },
                    ),
                ).handler,
            )
            renderModal()

            expect(
                await screen.findByText(/pending invoice must be resolved/i),
            ).toBeInTheDocument()
            expect(
                screen.queryByText(/failed to load estimate/i),
            ).not.toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /confirm/i }),
            ).toBeDisabled()
        })

        it.each([
            [
                'SubscriptionVersionConflict',
                "We couldn't get billing estimates because subscription has been modified since it was last retrieved, please refresh and try again",
            ],
            [
                'SubscriptionRenewalRampVersionInconsistent',
                "We couldn't get billing estimates because subscription scheduled changes at renewal has been updated",
            ],
            [
                'SubscriptionChangesInconsistentWithRamps',
                "We couldn't get billing estimates because subscription changes are inconsistent with existing scheduled changes",
            ],
        ])(
            'surfaces the refresh banner and disables Confirm when the estimate endpoint returns a %s error',
            async (_label, msg) => {
                server.use(
                    mockGetBillingEstimatesSubscriptionHandler(async () =>
                        HttpResponse.json(
                            {
                                error: { msg, data: null },
                            } as never,
                            { status: 400 },
                        ),
                    ).handler,
                )
                renderModal()

                expect(
                    await screen.findByText(/refresh to continue/i),
                ).toBeInTheDocument()
                expect(
                    screen.getByText(
                        /this subscription was modified since you loaded this page/i,
                    ),
                ).toBeInTheDocument()
                expect(
                    screen.queryByText(/failed to load estimate/i),
                ).not.toBeInTheDocument()
                expect(
                    screen.queryByRole('button', { name: /retry/i }),
                ).not.toBeInTheDocument()
                expect(
                    screen.getByRole('button', { name: /confirm/i }),
                ).toBeDisabled()
            },
        )

        it('hides the refresh banner when a pending invoice banner is also applicable', async () => {
            server.use(
                mockGetBillingEstimatesSubscriptionHandler(async () =>
                    HttpResponse.json(
                        {
                            error: {
                                msg: 'subscription has been modified since it was last retrieved, please refresh and try again',
                                data: null,
                            },
                        } as never,
                        { status: 400 },
                    ),
                ).handler,
            )
            renderModal({ pendingInvoiceError: true })

            expect(
                await screen.findByText(/pending invoice must be resolved/i),
            ).toBeInTheDocument()
            expect(
                screen.queryByText(/refresh to continue/i),
            ).not.toBeInTheDocument()
        })
    })
})
