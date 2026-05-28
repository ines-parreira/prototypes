import { payingWithCreditCard } from '@repo/billing/fixtures'
import { render } from '@repo/testing'
import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { InvoiceCadence } from '@gorgias/helpdesk-types'

import {
    basicMonthlyHelpdeskPlan,
    proMonthlyHelpdeskPlan,
    voicePlan0,
} from 'fixtures/plans'
import { Cadence, ProductType, SubscriptionStatus } from 'models/billing/types'

import { InternalConfirmModal } from './InternalConfirmModal'
import { derivePriceSummary } from './useInternalPlanEditor'
import type { ResolvedPlan } from './useInternalPlanEditor'

const ESTIMATE_URL = '*/api/billing/internal/estimates/subscription'
const BILLING_STATE_URL = '*/billing/state'

const server = setupServer()

function estimateSuccessHandler(
    body: {
        balance_due?: number | null
        immediate_changes_summary?: object | null
        estimated_prorated_credits_charges?: object | null
    } = { balance_due: 0 },
) {
    return http.get(ESTIMATE_URL, () =>
        HttpResponse.json({
            balance_due: 0,
            immediate_changes_summary: null,
            ...body,
        }),
    )
}

function estimateErrorHandler() {
    return http.get(
        ESTIMATE_URL,
        async () => new HttpResponse(null, { status: 500 }),
    )
}

function estimatePendingHandler() {
    return http.get(ESTIMATE_URL, () => new Promise<never>(() => {}))
}

function billingStateHandler(data = payingWithCreditCard) {
    return http.get(BILLING_STATE_URL, () => HttpResponse.json(data))
}

function makeResolved(
    overrides: Partial<ResolvedPlan> & { productType: ProductType },
): ResolvedPlan {
    return {
        plan: null,
        currentPlan: null,
        status: 'unchanged',
        action: null,
        ...overrides,
    }
}

const defaultPlans: ResolvedPlan[] = [
    makeResolved({
        productType: ProductType.Helpdesk,
        plan: proMonthlyHelpdeskPlan,
        currentPlan: basicMonthlyHelpdeskPlan,
        status: 'upgraded',
    }),
    makeResolved({
        productType: ProductType.Voice,
        plan: voicePlan0,
        currentPlan: voicePlan0,
    }),
]

const downgradeOnlyPlans: ResolvedPlan[] = [
    makeResolved({
        productType: ProductType.Helpdesk,
        plan: basicMonthlyHelpdeskPlan,
        currentPlan: proMonthlyHelpdeskPlan,
        status: 'downgraded',
    }),
    makeResolved({
        productType: ProductType.Voice,
        plan: voicePlan0,
        currentPlan: voicePlan0,
    }),
]

function renderComponent(
    overrides: Partial<Parameters<typeof InternalConfirmModal>[0]> = {},
) {
    const resolvedPlans = overrides.resolvedPlans ?? defaultPlans
    const props = {
        isOpen: true,
        onClose: jest.fn(),
        resolvedPlans,
        priceSummary: derivePriceSummary(resolvedPlans, undefined),
        billingState: payingWithCreditCard,
        contractCadence: Cadence.Month,
        invoiceCadence: InvoiceCadence.Month,
        onApply: jest.fn(),
        isSubmitting: false,
        ...overrides,
    }
    return {
        ...render(<InternalConfirmModal {...props} />),
        props,
    }
}

describe('InternalConfirmModal', () => {
    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    beforeEach(() => {
        server.use(estimateSuccessHandler(), billingStateHandler())
        window.USER_IMPERSONATED_AUTHORIZED_FOR_BILLING_WRITE_OPS = true
    })

    afterEach(() => {
        server.resetHandlers()
    })

    afterAll(() => {
        server.close()
    })

    it('renders the modal with title and description', () => {
        renderComponent()

        expect(screen.getByText('Confirm changes')).toBeInTheDocument()
        expect(
            screen.getByText(
                'Once you confirm, your changes will take effect immediately.',
            ),
        ).toBeInTheDocument()
    })

    it('renders product rows from resolved plans', () => {
        renderComponent()

        expect(screen.getByText('Helpdesk')).toBeInTheDocument()
        expect(screen.getByText('Upgraded')).toBeInTheDocument()
        expect(screen.getByText('Voice')).toBeInTheDocument()
    })

    it('renders total and balance due rows', async () => {
        renderComponent()

        expect(screen.getByText('Total')).toBeInTheDocument()
        expect(await screen.findByText('Balance due today')).toBeInTheDocument()
    })

    it('renders both action buttons', () => {
        renderComponent()

        expect(
            screen.getByRole('button', { name: /apply without invoice/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /apply with invoice/i }),
        ).toBeInTheDocument()
    })

    it('calls onApply(true) when "Apply with invoice" is clicked', async () => {
        const user = userEvent.setup()
        const { props } = renderComponent()

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /apply with invoice/i }),
            ).toBeEnabled()
        })
        await act(() =>
            user.click(
                screen.getByRole('button', { name: /apply with invoice/i }),
            ),
        )

        expect(props.onApply).toHaveBeenCalledWith(true)
    })

    it('calls onApply(false) when "Apply without invoice" is clicked', async () => {
        const user = userEvent.setup()
        const { props } = renderComponent()

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /apply without invoice/i }),
            ).toBeEnabled()
        })
        await act(() =>
            user.click(
                screen.getByRole('button', { name: /apply without invoice/i }),
            ),
        )

        expect(props.onApply).toHaveBeenCalledWith(false)
    })

    it('disables both buttons when isSubmitting is true', () => {
        renderComponent({ isSubmitting: true })

        expect(
            screen.getByRole('button', { name: /apply without invoice/i }),
        ).toBeDisabled()
        expect(
            screen.getByRole('button', { name: /apply with invoice/i }),
        ).toBeDisabled()
    })

    describe('when there is no upgrade (downgrade/removal only)', () => {
        it('renders a single "Apply" button instead of invoice options', () => {
            renderComponent({ resolvedPlans: downgradeOnlyPlans })

            expect(
                screen.getByRole('button', { name: /^Apply$/i }),
            ).toBeInTheDocument()
            expect(
                screen.queryByRole('button', {
                    name: /apply with invoice/i,
                }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('button', {
                    name: /apply without invoice/i,
                }),
            ).not.toBeInTheDocument()
        })

        it('calls onApply(false) when "Apply" is clicked', async () => {
            const user = userEvent.setup()
            const { props } = renderComponent({
                resolvedPlans: downgradeOnlyPlans,
            })

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /^Apply$/i }),
                ).toBeEnabled()
            })
            await act(() =>
                user.click(screen.getByRole('button', { name: /^Apply$/i })),
            )

            expect(props.onApply).toHaveBeenCalledWith(false)
        })

        it('shows loading state when isSubmitting is true', () => {
            renderComponent({
                resolvedPlans: downgradeOnlyPlans,
                isSubmitting: true,
            })

            const applyButton = screen.getByRole('button', {
                name: /Apply/i,
            })
            expect(applyButton).toHaveAttribute('aria-disabled', 'true')
        })

        it('disables the Apply button while estimate is loading', () => {
            server.use(estimatePendingHandler())
            renderComponent({ resolvedPlans: downgradeOnlyPlans })

            expect(
                screen.getByRole('button', { name: /^Apply$/i }),
            ).toBeDisabled()
        })

        it('disables the Apply button while estimate is errored', async () => {
            server.use(estimateErrorHandler())
            renderComponent({ resolvedPlans: downgradeOnlyPlans })

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /^Apply$/i }),
                ).toBeDisabled()
            })
        })
    })

    describe('when user is not authorized for billing write operations', () => {
        beforeEach(() => {
            window.USER_IMPERSONATED_AUTHORIZED_FOR_BILLING_WRITE_OPS = false
        })

        it('disables both invoice buttons and shows tooltip on hover', async () => {
            const user = userEvent.setup()
            renderComponent()

            expect(
                screen.getByRole('button', { name: /apply without invoice/i }),
            ).toBeDisabled()
            expect(
                screen.getByRole('button', { name: /apply with invoice/i }),
            ).toBeDisabled()

            await user.hover(
                screen.getByRole('button', { name: /apply without invoice/i }),
            )
            expect(
                await screen.findByText(
                    /not authorized to perform this action/i,
                ),
            ).toBeInTheDocument()
        })

        it('does not call onApply when invoice buttons are clicked', async () => {
            const user = userEvent.setup()
            const { props } = renderComponent()

            await user.click(
                screen.getByRole('button', { name: /apply without invoice/i }),
            )
            await user.click(
                screen.getByRole('button', { name: /apply with invoice/i }),
            )

            expect(props.onApply).not.toHaveBeenCalled()
        })

        it('disables the Apply button and shows tooltip on hover when there is no upgrade', async () => {
            const user = userEvent.setup()
            renderComponent({ resolvedPlans: downgradeOnlyPlans })

            const applyButton = screen.getByRole('button', { name: /^Apply$/i })
            expect(applyButton).toBeDisabled()

            await user.hover(applyButton)
            expect(
                await screen.findByText(
                    /not authorized to perform this action/i,
                ),
            ).toBeInTheDocument()
        })

        it('does not call onApply when the Apply button is clicked', async () => {
            const user = userEvent.setup()
            const { props } = renderComponent({
                resolvedPlans: downgradeOnlyPlans,
            })

            await user.click(screen.getByRole('button', { name: /^Apply$/i }))

            expect(props.onApply).not.toHaveBeenCalled()
        })
    })

    it('renders "Prices exclusive of sales tax" text', () => {
        renderComponent()

        expect(
            screen.getByText('Prices exclusive of sales tax'),
        ).toBeInTheDocument()
    })

    describe('when balance due is negative', () => {
        beforeEach(() => {
            server.use(estimateSuccessHandler({ balance_due: -2550 }))
        })

        it('disables "Apply with invoice" but keeps "Apply without invoice" enabled', async () => {
            renderComponent()

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /apply with invoice/i }),
                ).toBeDisabled()
                expect(
                    screen.getByRole('button', {
                        name: /apply without invoice/i,
                    }),
                ).toBeEnabled()
            })
        })

        it('shows a tooltip on "Apply with invoice" explaining the negative balance', async () => {
            const user = userEvent.setup()
            renderComponent()

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /apply with invoice/i }),
                ).toBeDisabled()
            })

            await user.hover(
                screen.getByRole('button', { name: /apply with invoice/i }),
            )

            expect(
                await screen.findByText(/Use 'Apply without invoice' instead/i),
            ).toBeInTheDocument()
        })

        it('shows the negative balance disclaimer in the summary table', async () => {
            renderComponent()

            expect(
                await screen.findByText(
                    /A negative balance cannot be charged via invoice/i,
                ),
            ).toBeInTheDocument()
        })

        it('does not call onApply when "Apply with invoice" is clicked while disabled', async () => {
            const user = userEvent.setup()
            const { props } = renderComponent()

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /apply with invoice/i }),
                ).toBeDisabled()
            })

            await user.click(
                screen.getByRole('button', { name: /apply with invoice/i }),
            )

            expect(props.onApply).not.toHaveBeenCalled()
        })
    })

    describe('when subscription is paused', () => {
        const pausedBillingState = {
            ...payingWithCreditCard,
            subscription: {
                ...payingWithCreditCard.subscription,
                is_paused: true,
            },
        }

        it('disables invoice buttons and shows paused tooltip on hover (upgrade path)', async () => {
            const user = userEvent.setup()
            renderComponent({ billingState: pausedBillingState })

            expect(
                screen.getByRole('button', { name: /apply without invoice/i }),
            ).toBeDisabled()
            expect(
                screen.getByRole('button', { name: /apply with invoice/i }),
            ).toBeDisabled()

            await user.hover(
                screen.getByRole('button', { name: /apply without invoice/i }),
            )
            expect(await screen.findByText(/paused/i)).toBeInTheDocument()
        })

        it('disables Apply button and shows paused tooltip on hover (no-upgrade path)', async () => {
            const user = userEvent.setup()
            renderComponent({
                billingState: pausedBillingState,
                resolvedPlans: downgradeOnlyPlans,
            })

            const applyButton = screen.getByRole('button', { name: /^Apply$/i })
            expect(applyButton).toBeDisabled()

            await user.hover(applyButton)
            expect(await screen.findByText(/paused/i)).toBeInTheDocument()
        })

        it('shows write-blocked tooltip instead of paused tooltip when both conditions apply', async () => {
            const user = userEvent.setup()
            window.USER_IMPERSONATED_AUTHORIZED_FOR_BILLING_WRITE_OPS = false
            renderComponent({ billingState: pausedBillingState })

            await user.hover(
                screen.getByRole('button', { name: /apply without invoice/i }),
            )

            expect(
                await screen.findByText(
                    /not authorized to perform this action/i,
                ),
            ).toBeInTheDocument()
            expect(screen.queryByText(/paused/i)).not.toBeInTheDocument()
        })
    })

    describe('when subscription is trialing', () => {
        const trialingBillingState = {
            ...payingWithCreditCard,
            subscription: {
                ...payingWithCreditCard.subscription,
                is_trialing: true,
            },
        }

        it('renders only "Apply" button, no "Apply with invoice" or "Apply without invoice"', () => {
            renderComponent({ billingState: trialingBillingState })

            expect(
                screen.getByRole('button', { name: /^Apply$/i }),
            ).toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: /apply with invoice/i }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('button', {
                    name: /apply without invoice/i,
                }),
            ).not.toBeInTheDocument()
        })

        it('clicking "Apply" calls onApply(false)', async () => {
            const user = userEvent.setup()
            const { props } = renderComponent({
                billingState: trialingBillingState,
            })

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /^Apply$/i }),
                ).toBeEnabled()
            })
            await act(() =>
                user.click(screen.getByRole('button', { name: /^Apply$/i })),
            )

            expect(props.onApply).toHaveBeenCalledWith(false)
        })
    })

    describe('when subscription is canceled', () => {
        const canceledBillingState = {
            ...payingWithCreditCard,
            subscription: {
                ...payingWithCreditCard.subscription,
                status: SubscriptionStatus.CANCELED,
            },
        }

        it('renders "Reactivate" button instead of Apply buttons', () => {
            renderComponent({ billingState: canceledBillingState })

            expect(
                screen.getByRole('button', { name: /reactivate/i }),
            ).toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: /apply with invoice/i }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('button', {
                    name: /apply without invoice/i,
                }),
            ).not.toBeInTheDocument()
        })

        it('clicking "Reactivate" calls onApply(true, true)', async () => {
            const user = userEvent.setup()
            const { props } = renderComponent({
                billingState: canceledBillingState,
            })

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /reactivate/i }),
                ).toBeEnabled()
            })
            await act(() =>
                user.click(screen.getByRole('button', { name: /reactivate/i })),
            )

            expect(props.onApply).toHaveBeenCalledWith(true, true)
        })

        it('disables the Reactivate button while estimate is loading', () => {
            server.use(estimatePendingHandler())
            renderComponent({ billingState: canceledBillingState })

            expect(
                screen.getByRole('button', { name: /reactivate/i }),
            ).toBeDisabled()
        })

        it('enables the Reactivate button once estimate succeeds', async () => {
            renderComponent({ billingState: canceledBillingState })

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /reactivate/i }),
                ).toBeEnabled()
            })
        })

        it('disables the Reactivate button when estimate errors', async () => {
            server.use(estimateErrorHandler())
            renderComponent({ billingState: canceledBillingState })

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /reactivate/i }),
                ).toBeDisabled()
            })
        })

        it('shows balance due from the estimate', async () => {
            server.use(estimateSuccessHandler({ balance_due: 2550 }))
            renderComponent({ billingState: canceledBillingState })

            expect(
                await screen.findByText('$25.50 due today'),
            ).toBeInTheDocument()
        })

        it('sends reactivate=true as a query param', async () => {
            const requestUrls: string[] = []
            server.use(
                http.get(ESTIMATE_URL, ({ request }) => {
                    requestUrls.push(request.url)
                    return HttpResponse.json({
                        balance_due: 0,
                        immediate_changes_summary: null,
                    })
                }),
            )
            renderComponent({ billingState: canceledBillingState })

            await waitFor(() => expect(requestUrls.length).toBeGreaterThan(0))

            const url = new URL(requestUrls[0])
            expect(url.searchParams.get('reactivate')).toBe('true')
        })

        it('shows term disclaimer when balance due is positive and estimate has immediate_changes_summary', async () => {
            server.use(
                estimateSuccessHandler({
                    balance_due: 2550,
                    immediate_changes_summary: {
                        new_term_start: 1704067200,
                        new_term_end: 1735689600,
                        contract_cadence_change: null,
                        invoice_cadence_change: null,
                        is_ramp: false,
                        product_changes: {},
                    },
                }),
            )
            renderComponent({ billingState: canceledBillingState })

            expect(
                await screen.findByText(
                    /A new term for the subscription will start:/i,
                ),
            ).toBeInTheDocument()
        })

        it('shows invoices to pay when estimate returns current_invoices_to_pay', async () => {
            server.use(
                estimateSuccessHandler({
                    balance_due: 0,
                    // @ts-expect-error SDK type not yet updated
                    current_invoices_to_pay: [
                        {
                            id: 'inv_001',
                            invoice_pdf: 'https://example.com/inv_001.pdf',
                            total: 5100,
                            amount_paid: 1275,
                            amount_due: 3825,
                            paid: false,
                        },
                    ],
                }),
            )
            renderComponent({ billingState: canceledBillingState })

            expect(
                await screen.findByText('Invoices to pay'),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('link', { name: 'inv_001' }),
            ).toHaveAttribute('href', 'https://example.com/inv_001.pdf')
            expect(screen.getByText('$51')).toBeInTheDocument()
            expect(screen.getByText('$12.75')).toBeInTheDocument()
            expect(screen.getByText('$38.25')).toBeInTheDocument()
            expect(screen.getByText('Unpaid')).toBeInTheDocument()
        })

        it('does not show invoices section when current_invoices_to_pay is null', async () => {
            server.use(
                estimateSuccessHandler({
                    balance_due: 2550,
                    // @ts-expect-error SDK type not yet updated
                    current_invoices_to_pay: null,
                }),
            )
            renderComponent({ billingState: canceledBillingState })

            await waitFor(() => {
                expect(
                    screen.queryByText('Invoices to pay'),
                ).not.toBeInTheDocument()
            })
        })

        it('does not show invoices section when current_invoices_to_pay is an empty array', async () => {
            server.use(
                estimateSuccessHandler({
                    balance_due: 0,
                    // @ts-expect-error SDK type not yet updated
                    current_invoices_to_pay: [],
                }),
            )
            renderComponent({ billingState: canceledBillingState })

            await waitFor(() => {
                expect(
                    screen.queryByText('Invoices to pay'),
                ).not.toBeInTheDocument()
            })
        })

        it('renders multiple invoices when estimate returns several', async () => {
            server.use(
                estimateSuccessHandler({
                    balance_due: 0,
                    // @ts-expect-error SDK type not yet updated
                    current_invoices_to_pay: [
                        {
                            id: 'inv_001',
                            invoice_pdf: 'https://example.com/inv_001.pdf',
                            total: 5100,
                            amount_paid: 1275,
                            amount_due: 3825,
                            paid: false,
                        },
                        {
                            id: 'inv_002',
                            invoice_pdf: 'https://example.com/inv_002.pdf',
                            total: 2550,
                            amount_paid: 2550,
                            amount_due: 0,
                            paid: true,
                        },
                    ],
                }),
            )
            renderComponent({ billingState: canceledBillingState })

            expect(
                await screen.findByRole('link', { name: 'inv_001' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('link', { name: 'inv_002' }),
            ).toBeInTheDocument()
            expect(screen.getByText('Unpaid')).toBeInTheDocument()
            expect(screen.getByText('Paid')).toBeInTheDocument()
        })

        it('does not show term disclaimer when balance due is zero', async () => {
            server.use(
                estimateSuccessHandler({
                    balance_due: 0,
                    immediate_changes_summary: {
                        new_term_start: 1704067200,
                        new_term_end: 1735689600,
                        contract_cadence_change: null,
                        invoice_cadence_change: null,
                        is_ramp: false,
                        product_changes: {},
                    },
                }),
            )
            renderComponent({ billingState: canceledBillingState })

            await waitFor(() => {
                expect(
                    screen.queryByText(
                        /A new term for the subscription will start:/i,
                    ),
                ).not.toBeInTheDocument()
            })
        })
    })

    it('does not show invoices section for a non-cancelled subscription even if estimate returns invoices', async () => {
        server.use(
            http.get(ESTIMATE_URL, () =>
                HttpResponse.json({
                    balance_due: 0,
                    immediate_changes_summary: null,
                    current_invoices_to_pay: [
                        {
                            id: 'inv_001',
                            invoice_pdf: 'https://example.com/inv_001.pdf',
                            total: 5100,
                            amount_paid: 0,
                            amount_due: 5100,
                            paid: false,
                        },
                    ],
                }),
            ),
        )
        renderComponent()

        await waitFor(() => {
            expect(
                screen.queryByText('Invoices to pay'),
            ).not.toBeInTheDocument()
        })
    })

    describe('estimate integration', () => {
        it('disables apply buttons while estimate is loading', () => {
            server.use(estimatePendingHandler())
            renderComponent()

            expect(
                screen.getByRole('button', { name: /apply without invoice/i }),
            ).toBeDisabled()
            expect(
                screen.getByRole('button', { name: /apply with invoice/i }),
            ).toBeDisabled()
        })

        it('renders a fallback error and retry button in the balance due row when estimate fails without a BE error payload', async () => {
            server.use(estimateErrorHandler())
            renderComponent()

            expect(
                await screen.findByText('Failed to load estimate.'),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /retry/i }),
            ).toBeInTheDocument()
        })

        it('renders the backend error message in the balance due row when the API returns one', async () => {
            server.use(
                http.get(
                    ESTIMATE_URL,
                    async () =>
                        new HttpResponse(
                            JSON.stringify({
                                error: {
                                    msg: 'Scheduled change conflicts with current subscription',
                                    data: null,
                                },
                            }),
                            {
                                status: 400,
                                headers: { 'Content-Type': 'application/json' },
                            },
                        ),
                ),
            )
            renderComponent()

            expect(
                await screen.findByText(
                    'Scheduled change conflicts with current subscription',
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /retry/i }),
            ).toBeInTheDocument()
        })

        it('disables apply buttons while estimate is errored', async () => {
            server.use(estimateErrorHandler())
            renderComponent()

            await waitFor(() => {
                expect(
                    screen.getByRole('button', {
                        name: /apply without invoice/i,
                    }),
                ).toBeDisabled()
            })
            expect(
                screen.getByRole('button', { name: /apply with invoice/i }),
            ).toBeDisabled()
        })

        it('does not render a dash for balance due when estimate is errored', async () => {
            server.use(estimateErrorHandler())
            renderComponent()

            await screen.findByRole('button', { name: /retry/i })

            expect(screen.queryByText('—')).not.toBeInTheDocument()
        })

        it('refetches estimate when retry button is clicked', async () => {
            const user = userEvent.setup()
            let requestCount = 0
            server.use(
                http.get(ESTIMATE_URL, async () => {
                    requestCount++
                    return new HttpResponse(null, { status: 500 })
                }),
            )
            renderComponent()

            const retryButton = await screen.findByRole('button', {
                name: /retry/i,
            })
            const countBefore = requestCount

            await user.click(retryButton)

            await waitFor(() => {
                expect(requestCount).toBeGreaterThan(countBefore)
            })
        })

        it('shows loading state while retry estimate request is in flight', async () => {
            const user = userEvent.setup()
            let requestCount = 0
            server.use(
                http.get(ESTIMATE_URL, async () => {
                    requestCount++
                    if (requestCount === 1) {
                        return new HttpResponse(null, { status: 500 })
                    }

                    return new Promise<never>(() => {})
                }),
            )
            renderComponent()

            const retryButton = await screen.findByRole('button', {
                name: /retry/i,
            })

            await act(() => user.click(retryButton))

            await waitFor(() => {
                expect(
                    screen.queryByRole('button', { name: /retry/i }),
                ).not.toBeInTheDocument()
            })
        })

        it('renders the balance due returned by the estimate, converted from cents', async () => {
            server.use(estimateSuccessHandler({ balance_due: 2550 }))
            renderComponent()

            expect(
                await screen.findByText('$25.50 due today'),
            ).toBeInTheDocument()
        })

        it('sends the subscription resource versions as query params', async () => {
            const requestUrls: string[] = []
            server.use(
                http.get(ESTIMATE_URL, ({ request }) => {
                    requestUrls.push(request.url)
                    return HttpResponse.json({
                        balance_due: 0,
                        immediate_changes_summary: null,
                    })
                }),
            )
            renderComponent()

            await waitFor(() => expect(requestUrls.length).toBeGreaterThan(0))

            const url = new URL(requestUrls[0])
            expect(url.searchParams.get('subscription_resource_version')).toBe(
                String(payingWithCreditCard.subscription.resource_version),
            )
            expect(
                url.searchParams.get(
                    'subscription_renewal_ramp_resource_version',
                ),
            ).toBe(
                payingWithCreditCard.subscription.schedule_resource_version ==
                    null
                    ? null
                    : String(
                          payingWithCreditCard.subscription
                              .schedule_resource_version,
                      ),
            )
        })
    })

    describe('when contract cadence changes', () => {
        const yearlyContractCadence = Cadence.Year

        it('renders "Apply with prorated credits" and "Apply without prorated credits" buttons when there is an upgrade', () => {
            renderComponent({ contractCadence: yearlyContractCadence })

            expect(
                screen.getByRole('button', {
                    name: /apply without prorated credits/i,
                }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', {
                    name: /apply with prorated credits/i,
                }),
            ).toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: /apply with invoice/i }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('button', {
                    name: /apply without invoice/i,
                }),
            ).not.toBeInTheDocument()
        })

        it('renders prorated credits buttons even for downgrade-only plans', () => {
            renderComponent({
                contractCadence: yearlyContractCadence,
                resolvedPlans: downgradeOnlyPlans,
            })

            expect(
                screen.getByRole('button', {
                    name: /apply without prorated credits/i,
                }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', {
                    name: /apply with prorated credits/i,
                }),
            ).toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: /^Apply$/i }),
            ).not.toBeInTheDocument()
        })

        it('calls onApply(false) when "Apply without prorated credits" is clicked', async () => {
            const user = userEvent.setup()
            const { props } = renderComponent({
                contractCadence: yearlyContractCadence,
            })

            await waitFor(() => {
                expect(
                    screen.getByRole('button', {
                        name: /apply without prorated credits/i,
                    }),
                ).toBeEnabled()
            })
            await act(() =>
                user.click(
                    screen.getByRole('button', {
                        name: /apply without prorated credits/i,
                    }),
                ),
            )

            expect(props.onApply).toHaveBeenCalledWith(false)
        })

        it('calls onApply(true) when "Apply with prorated credits" is clicked', async () => {
            const user = userEvent.setup()
            const { props } = renderComponent({
                contractCadence: yearlyContractCadence,
            })

            await waitFor(() => {
                expect(
                    screen.getByRole('button', {
                        name: /apply with prorated credits/i,
                    }),
                ).toBeEnabled()
            })
            await act(() =>
                user.click(
                    screen.getByRole('button', {
                        name: /apply with prorated credits/i,
                    }),
                ),
            )

            expect(props.onApply).toHaveBeenCalledWith(true)
        })

        it('shows term change disclaimer when estimate has immediate_changes_summary', async () => {
            server.use(
                estimateSuccessHandler({
                    immediate_changes_summary: {
                        new_term_start: 1704067200,
                        new_term_end: 1735689600,
                        contract_cadence_change: null,
                        invoice_cadence_change: null,
                        is_ramp: false,
                        product_changes: {},
                    },
                }),
            )
            renderComponent({ contractCadence: yearlyContractCadence })

            expect(
                await screen.findByText(
                    /A new term for the subscription will start:/i,
                ),
            ).toBeInTheDocument()
        })

        it('does not show term change disclaimer when immediate_changes_summary is null', async () => {
            server.use(
                estimateSuccessHandler({ immediate_changes_summary: null }),
            )
            renderComponent({ contractCadence: yearlyContractCadence })

            await waitFor(() => {
                expect(
                    screen.queryByText(
                        /A new term for the subscription will start:/i,
                    ),
                ).not.toBeInTheDocument()
            })
        })

        it('does not show term change disclaimer when cadence has not changed', async () => {
            server.use(
                estimateSuccessHandler({
                    immediate_changes_summary: {
                        new_term_start: 1704067200,
                        new_term_end: 1735689600,
                        contract_cadence_change: null,
                        invoice_cadence_change: null,
                        is_ramp: false,
                        product_changes: {},
                    },
                }),
            )
            renderComponent({ contractCadence: Cadence.Month })

            await waitFor(() => {
                expect(
                    screen.queryByText(
                        /A new term for the subscription will start:/i,
                    ),
                ).not.toBeInTheDocument()
            })
        })
    })

    describe('balance breakdown button', () => {
        it('does not show the button when estimated_prorated_credits_charges is absent', async () => {
            server.use(estimateSuccessHandler({ balance_due: 0 }))
            renderComponent()

            await waitFor(() => {
                expect(
                    screen.queryByRole('button', {
                        name: /view balance breakdown/i,
                    }),
                ).not.toBeInTheDocument()
            })
        })

        it('shows the button when estimated_prorated_credits_charges is present', async () => {
            server.use(
                estimateSuccessHandler({
                    estimated_prorated_credits_charges: { amount: 1000 },
                }),
            )
            renderComponent()

            expect(
                await screen.findByRole('button', {
                    name: /view balance breakdown/i,
                }),
            ).toBeInTheDocument()
        })

        it('toggles the raw JSON on click', async () => {
            const user = userEvent.setup()
            server.use(
                estimateSuccessHandler({
                    estimated_prorated_credits_charges: { amount: 1000 },
                }),
            )
            renderComponent()

            const toggleButton = await screen.findByRole('button', {
                name: /view balance breakdown/i,
            })

            await user.click(toggleButton)
            expect(screen.getByText(/"amount": 1000/)).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /hide balance breakdown/i }),
            ).toBeInTheDocument()

            await user.click(
                screen.getByRole('button', { name: /hide balance breakdown/i }),
            )
            expect(screen.queryByText(/"amount": 1000/)).not.toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /view balance breakdown/i }),
            ).toBeInTheDocument()
        })
    })

    describe('immediate changes summary button', () => {
        it('does not show the button when immediate_changes_summary is null', async () => {
            server.use(
                estimateSuccessHandler({ immediate_changes_summary: null }),
            )
            renderComponent()

            await waitFor(() => {
                expect(
                    screen.queryByRole('button', {
                        name: /view immediate changes summary/i,
                    }),
                ).not.toBeInTheDocument()
            })
        })

        it('shows the button when immediate_changes_summary is present', async () => {
            server.use(
                estimateSuccessHandler({
                    immediate_changes_summary: {
                        new_term_start: 1704067200,
                        new_term_end: 1735689600,
                        contract_cadence_change: null,
                        invoice_cadence_change: null,
                        is_ramp: false,
                        product_changes: {},
                    },
                }),
            )
            renderComponent()

            expect(
                await screen.findByRole('button', {
                    name: /view immediate changes summary/i,
                }),
            ).toBeInTheDocument()
        })

        it('toggles the raw JSON on click', async () => {
            const user = userEvent.setup()
            server.use(
                estimateSuccessHandler({
                    immediate_changes_summary: {
                        new_term_start: 1704067200,
                        new_term_end: 1735689600,
                        contract_cadence_change: null,
                        invoice_cadence_change: null,
                        is_ramp: false,
                        product_changes: {},
                    },
                }),
            )
            renderComponent()

            const toggleButton = await screen.findByRole('button', {
                name: /view immediate changes summary/i,
            })

            await user.click(toggleButton)
            expect(
                screen.getByText(/"new_term_start": 1704067200/),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', {
                    name: /hide immediate changes summary/i,
                }),
            ).toBeInTheDocument()

            await user.click(
                screen.getByRole('button', {
                    name: /hide immediate changes summary/i,
                }),
            )
            expect(
                screen.queryByText(/"new_term_start": 1704067200/),
            ).not.toBeInTheDocument()
            expect(
                screen.getByRole('button', {
                    name: /view immediate changes summary/i,
                }),
            ).toBeInTheDocument()
        })
    })
})
