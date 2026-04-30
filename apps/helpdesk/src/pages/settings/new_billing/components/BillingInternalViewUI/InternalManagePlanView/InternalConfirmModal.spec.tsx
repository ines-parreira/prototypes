import { payingWithCreditCard } from '@repo/billing/fixtures'
import { render } from '@repo/testing'
import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    basicMonthlyHelpdeskPlan,
    proMonthlyHelpdeskPlan,
    voicePlan0,
} from 'fixtures/plans'
import { ProductType } from 'models/billing/types'

import { InternalConfirmModal } from './InternalConfirmModal'
import type { ResolvedPlan } from './useInternalPlanEditor'

const ESTIMATE_URL = '*/api/billing/internal/estimates/subscription'

const server = setupServer()

function estimateSuccessHandler(
    body: { balance_due: number | null } = { balance_due: 0 },
) {
    return http.get(ESTIMATE_URL, () =>
        HttpResponse.json({ ...body, immediate_changes_summary: null }),
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
    const props = {
        isOpen: true,
        onClose: jest.fn(),
        resolvedPlans: defaultPlans,
        billingState: payingWithCreditCard,
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
        server.use(estimateSuccessHandler())
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
})
