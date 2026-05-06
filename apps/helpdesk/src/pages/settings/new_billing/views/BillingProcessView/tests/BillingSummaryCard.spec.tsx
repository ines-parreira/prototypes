import type { PlansByProduct } from '@repo/billing'
import { ACTIVATE_PAYMENT_WITH_SHOPIFY_URL } from '@repo/billing'
import { useFlag } from '@repo/feature-flags'
import { logEvent, reportError, SegmentEvent } from '@repo/logging'
import { render } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AxiosError, AxiosHeaders } from 'axios'

import { toast } from '@gorgias/axiom'

import {
    basicMonthlyHelpdeskPlan,
    convertPlan1,
    smsPlan1,
    voicePlan1,
} from 'fixtures/plans'
import useAppSelector from 'hooks/useAppSelector'
import { Cadence, ProductType } from 'models/billing/types'
import {
    getShopifyBillingStatus,
    shouldPayWithShopify,
} from 'state/currentAccount/selectors'
import { ShopifyBillingStatus } from 'state/currentAccount/types'

import { BillingSummaryCard } from '../BillingSummaryCard'

jest.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: {
        MidCycleUpgradeBillingLogic: 'mid-cycle-upgrade-billing-logic',
    },
    useFlag: jest.fn(),
}))
jest.mock('@repo/logging', () => ({
    logEvent: jest.fn(),
    reportError: jest.fn(),
    SegmentEvent: {
        BillingUsageAndPlansUpdateSubscriptionClicked:
            'billing-usage-and-plans-update-subscription-click',
    },
}))
jest.mock('hooks/useAppSelector')
jest.mock('state/currentAccount/selectors', () => ({
    shouldPayWithShopify: jest.fn(),
    getShopifyBillingStatus: jest.fn(),
}))
jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    toast: {
        error: jest.fn(),
        success: jest.fn(),
    },
}))

jest.mock('../../../components/Card', () =>
    jest.fn(({ children }) => <div>{children}</div>),
)

jest.mock('../../../components/BillingSummaryBreakdown', () => ({
    BillingSummaryBreakdown: jest.fn(() => null),
}))

jest.mock('../../../components/SummaryFooter', () =>
    jest.fn(({ onOpenConfirmationModal, updateSubscription }) => (
        <>
            {onOpenConfirmationModal && (
                <button onClick={onOpenConfirmationModal} type="button">
                    open modal
                </button>
            )}
            {!onOpenConfirmationModal && updateSubscription && (
                <button onClick={() => void updateSubscription()} type="button">
                    legacy submit
                </button>
            )}
        </>
    )),
)

jest.mock('../../../components/ConfirmChangesModal', () => ({
    ConfirmChangesModal: jest.fn(
        ({
            isOpen,
            onClose,
            onConfirm,
            pendingInvoiceError,
            versionConflictError,
            isPaymentMethodMissing,
        }) => (
            <div>
                <span>{isOpen ? 'open' : 'closed'}</span>
                {pendingInvoiceError && <span>pending invoice error</span>}
                {versionConflictError && <span>version conflict error</span>}
                {isPaymentMethodMissing && <span>payment method missing</span>}
                {isOpen && (
                    <>
                        <button onClick={onConfirm} type="button">
                            confirm modal
                        </button>
                        <button onClick={onClose} type="button">
                            close modal
                        </button>
                    </>
                )}
            </div>
        ),
    ),
}))

jest.mock(
    'pages/settings/new_billing/components/SummaryPaymentSection/NewSummaryPaymentSection',
    () => ({
        NewSummaryPaymentSection: jest.fn(() => null),
    }),
)

const mockHistoryPush = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    ...jest.requireActual<Record<string, unknown>>('react-router-dom'),
    useHistory: () => ({
        push: mockHistoryPush,
    }),
}))

const mockUseAppSelector = jest.mocked(useAppSelector)
const mockShouldPayWithShopify = jest.mocked(shouldPayWithShopify)
const mockGetShopifyBillingStatus = jest.mocked(getShopifyBillingStatus)
const mockReportError = jest.mocked(reportError)
const mockUseFlag = jest.mocked(useFlag)
const mockToastError = jest.mocked(toast.error)
const mockToastSuccess = jest.mocked(toast.success)

const plansByProduct: PlansByProduct = {
    [ProductType.Helpdesk]: {
        current: basicMonthlyHelpdeskPlan,
        available: [basicMonthlyHelpdeskPlan],
    },
    [ProductType.Automation]: { available: [] },
    [ProductType.Voice]: { available: [voicePlan1] },
    [ProductType.SMS]: { available: [smsPlan1] },
    [ProductType.Convert]: { available: [convertPlan1] },
}

describe('BillingSummaryCard', () => {
    const updateSubscription = jest.fn()
    const mockSetUpdateProcessStarted = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAppSelector.mockImplementation((selector: any) => selector({}))
        mockShouldPayWithShopify.mockReturnValue(false)
        mockGetShopifyBillingStatus.mockReturnValue(ShopifyBillingStatus.Active)
        updateSubscription.mockResolvedValue(undefined)
        mockUseFlag.mockReturnValue(true)
    })

    function renderComponent() {
        return render(
            <BillingSummaryCard
                selectedPlans={{
                    [ProductType.Helpdesk]: {
                        plan: basicMonthlyHelpdeskPlan,
                        isSelected: true,
                    },
                    [ProductType.Automation]: {
                        isSelected: false,
                    },
                    [ProductType.Voice]: {
                        isSelected: false,
                    },
                    [ProductType.SMS]: {
                        isSelected: false,
                    },
                    [ProductType.Convert]: {
                        isSelected: false,
                    },
                }}
                cadence={Cadence.Month}
                plansByProduct={plansByProduct}
                totalProductAmount={basicMonthlyHelpdeskPlan.amount}
                anyProductChanged={true}
                anyNewProductSelected={true}
                anyDowngradedPlanSelected={false}
                updateSubscription={updateSubscription}
                startSubscription={jest.fn()}
                isSubscriptionUpdating={false}
                autoUpgradeChanged={false}
                cancellationDates={{}}
                totalCancelledAmount={0}
                cancelledProducts={[]}
                isTrialing={false}
                isCurrentSubscriptionCanceled={false}
                periodEnd="2026-12-31"
                ctaText="Update subscription"
                hasCreditCard={true}
                isPaymentEnabled={true}
                setUpdateProcessStarted={mockSetUpdateProcessStarted}
                setSessionSelectedPlans={jest.fn()}
                subscriptionResourceVersion={12345}
            />,
        )
    }

    it('always opens confirm modal from footer CTA', async () => {
        const user = userEvent.setup()
        renderComponent()

        expect(screen.getByText('closed')).toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: /open modal/i }))

        await waitFor(() => {
            expect(screen.getByText('open')).toBeInTheDocument()
        })
    })

    it('runs update only after confirm action', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole('button', { name: /open modal/i }))

        await waitFor(() => {
            expect(screen.getByText('open')).toBeInTheDocument()
        })

        await user.click(screen.getByRole('button', { name: /confirm modal/i }))

        await waitFor(() => {
            expect(updateSubscription).toHaveBeenCalledTimes(1)
        })
        expect(mockToastSuccess).toHaveBeenCalledWith(
            'Your subscription has successfully been updated.',
            { duration: 5000 },
        )

        await waitFor(() => {
            expect(screen.getByText('closed')).toBeInTheDocument()
        })
    })

    it('fires Segment tracking event when modal opens', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole('button', { name: /open modal/i }))

        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.BillingUsageAndPlansUpdateSubscriptionClicked,
        )
    })

    it('does not redirect when updateSubscription rejects', async () => {
        const user = userEvent.setup()
        updateSubscription.mockRejectedValueOnce(new Error('API error'))

        renderComponent()

        await user.click(screen.getByRole('button', { name: /open modal/i }))

        await waitFor(() => {
            expect(screen.getByText('open')).toBeInTheDocument()
        })

        await user.click(screen.getByRole('button', { name: /confirm modal/i }))

        await waitFor(() => {
            expect(updateSubscription).toHaveBeenCalledTimes(1)
        })

        expect(mockHistoryPush).not.toHaveBeenCalled()
        expect(mockReportError).toHaveBeenCalledWith(expect.any(Error))
    })

    it('keeps confirm modal open on error', async () => {
        const user = userEvent.setup()
        updateSubscription.mockRejectedValueOnce(new Error('API error'))

        renderComponent()

        await user.click(screen.getByRole('button', { name: /open modal/i }))

        await waitFor(() => {
            expect(screen.getByText('open')).toBeInTheDocument()
        })

        await user.click(screen.getByRole('button', { name: /confirm modal/i }))

        await waitFor(() => {
            expect(updateSubscription).toHaveBeenCalledTimes(1)
        })

        expect(screen.getByText('open')).toBeInTheDocument()
    })

    it('shows error toast and resets updateProcessStarted on failure', async () => {
        const user = userEvent.setup()
        updateSubscription.mockRejectedValueOnce(new Error('API error'))

        renderComponent()

        await user.click(screen.getByRole('button', { name: /open modal/i }))

        await waitFor(() => {
            expect(screen.getByText('open')).toBeInTheDocument()
        })

        await user.click(screen.getByRole('button', { name: /confirm modal/i }))

        expect(mockToastError).toHaveBeenCalledWith(
            "Sorry, we couldn't update your subscription. Please try again.",
            { duration: 5000 },
        )

        expect(mockSetUpdateProcessStarted).toHaveBeenCalledWith(false)
    })

    it('skips ConfirmChangesModal when subscription is canceled (FF on)', async () => {
        const user = userEvent.setup()

        render(
            <BillingSummaryCard
                selectedPlans={{
                    [ProductType.Helpdesk]: {
                        plan: basicMonthlyHelpdeskPlan,
                        isSelected: true,
                    },
                    [ProductType.Automation]: { isSelected: false },
                    [ProductType.Voice]: { isSelected: false },
                    [ProductType.SMS]: { isSelected: false },
                    [ProductType.Convert]: { isSelected: false },
                }}
                cadence={Cadence.Month}
                plansByProduct={plansByProduct}
                totalProductAmount={basicMonthlyHelpdeskPlan.amount}
                anyProductChanged={true}
                anyNewProductSelected={false}
                anyDowngradedPlanSelected={false}
                updateSubscription={updateSubscription}
                startSubscription={jest.fn()}
                isSubscriptionUpdating={false}
                autoUpgradeChanged={false}
                cancellationDates={{}}
                totalCancelledAmount={0}
                cancelledProducts={[]}
                isTrialing={false}
                isCurrentSubscriptionCanceled={true}
                periodEnd="2026-12-31"
                ctaText="Subscribe now"
                hasCreditCard={true}
                isPaymentEnabled={true}
                setUpdateProcessStarted={mockSetUpdateProcessStarted}
                setSessionSelectedPlans={jest.fn()}
                subscriptionResourceVersion={12345}
            />,
        )

        expect(
            screen.queryByRole('button', { name: /open modal/i }),
        ).not.toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /legacy submit/i }),
        ).toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: /legacy submit/i }))

        await waitFor(() => {
            expect(updateSubscription).toHaveBeenCalledTimes(1)
        })
    })

    it('skips ConfirmChangesModal when canceled with no payment method (Stripe path)', async () => {
        const user = userEvent.setup()

        render(
            <BillingSummaryCard
                selectedPlans={{
                    [ProductType.Helpdesk]: {
                        plan: basicMonthlyHelpdeskPlan,
                        isSelected: true,
                    },
                    [ProductType.Automation]: { isSelected: false },
                    [ProductType.Voice]: { isSelected: false },
                    [ProductType.SMS]: { isSelected: false },
                    [ProductType.Convert]: { isSelected: false },
                }}
                cadence={Cadence.Month}
                plansByProduct={plansByProduct}
                totalProductAmount={basicMonthlyHelpdeskPlan.amount}
                anyProductChanged={true}
                anyNewProductSelected={false}
                anyDowngradedPlanSelected={false}
                updateSubscription={updateSubscription}
                startSubscription={jest.fn()}
                isSubscriptionUpdating={false}
                autoUpgradeChanged={false}
                cancellationDates={{}}
                totalCancelledAmount={0}
                cancelledProducts={[]}
                isTrialing={false}
                isCurrentSubscriptionCanceled={true}
                periodEnd="2026-12-31"
                ctaText="Subscribe now"
                hasCreditCard={false}
                hasAchPaymentMethod={false}
                isPaymentEnabled={true}
                setUpdateProcessStarted={mockSetUpdateProcessStarted}
                setSessionSelectedPlans={jest.fn()}
                subscriptionResourceVersion={12345}
            />,
        )

        expect(
            screen.queryByRole('button', { name: /open modal/i }),
        ).not.toBeInTheDocument()
        await user.click(screen.getByRole('button', { name: /legacy submit/i }))

        await waitFor(() => {
            expect(updateSubscription).toHaveBeenCalledTimes(1)
        })
    })

    it('skips ConfirmChangesModal when subscription is trialing (FF on)', async () => {
        const user = userEvent.setup()

        render(
            <BillingSummaryCard
                selectedPlans={{
                    [ProductType.Helpdesk]: {
                        plan: basicMonthlyHelpdeskPlan,
                        isSelected: true,
                    },
                    [ProductType.Automation]: { isSelected: false },
                    [ProductType.Voice]: { isSelected: false },
                    [ProductType.SMS]: { isSelected: false },
                    [ProductType.Convert]: { isSelected: false },
                }}
                cadence={Cadence.Month}
                plansByProduct={plansByProduct}
                totalProductAmount={basicMonthlyHelpdeskPlan.amount}
                anyProductChanged={true}
                anyNewProductSelected={false}
                anyDowngradedPlanSelected={false}
                updateSubscription={updateSubscription}
                startSubscription={jest.fn()}
                isSubscriptionUpdating={false}
                autoUpgradeChanged={false}
                cancellationDates={{}}
                totalCancelledAmount={0}
                cancelledProducts={[]}
                isTrialing={true}
                isCurrentSubscriptionCanceled={false}
                periodEnd="2026-12-31"
                ctaText="Subscribe now"
                hasCreditCard={true}
                isPaymentEnabled={true}
                setUpdateProcessStarted={mockSetUpdateProcessStarted}
                setSessionSelectedPlans={jest.fn()}
                subscriptionResourceVersion={12345}
            />,
        )

        expect(
            screen.queryByRole('button', { name: /open modal/i }),
        ).not.toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /legacy submit/i }),
        ).toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: /legacy submit/i }))

        await waitFor(() => {
            expect(updateSubscription).toHaveBeenCalledTimes(1)
        })
    })

    it('redirects to Shopify activation when paying with Shopify and billing is not active', async () => {
        const user = userEvent.setup()
        mockShouldPayWithShopify.mockReturnValue(true)
        mockGetShopifyBillingStatus.mockReturnValue(
            ShopifyBillingStatus.Inactive,
        )

        renderComponent()

        await user.click(screen.getByRole('button', { name: /open modal/i }))

        await waitFor(() => {
            expect(screen.getByText('open')).toBeInTheDocument()
        })

        await user.click(screen.getByRole('button', { name: /confirm modal/i }))

        await waitFor(() => {
            expect(mockHistoryPush).toHaveBeenCalledWith(
                ACTIVATE_PAYMENT_WITH_SHOPIFY_URL,
            )
        })
    })

    describe('apply-time error handling', () => {
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

        it('passes pendingInvoiceError=true when API returns the typed pending-invoice error', async () => {
            const user = userEvent.setup()
            updateSubscription.mockRejectedValueOnce(
                makeGorgiasApiError(
                    'Proration cannot be performed until all pending invoices are resolved.',
                ),
            )

            renderComponent()

            await user.click(
                screen.getByRole('button', { name: /open modal/i }),
            )
            await user.click(
                screen.getByRole('button', { name: /confirm modal/i }),
            )

            await waitFor(() => {
                expect(
                    screen.getByText('pending invoice error'),
                ).toBeInTheDocument()
            })
        })

        it('does not show generic error toast or report to Sentry for the pending-invoice error', async () => {
            const user = userEvent.setup()
            updateSubscription.mockRejectedValueOnce(
                makeGorgiasApiError(
                    'Proration cannot be performed until all pending invoices are resolved.',
                ),
            )

            renderComponent()

            await user.click(
                screen.getByRole('button', { name: /open modal/i }),
            )
            await user.click(
                screen.getByRole('button', { name: /confirm modal/i }),
            )

            await waitFor(() => {
                expect(
                    screen.getByText('pending invoice error'),
                ).toBeInTheDocument()
            })

            expect(mockToastError).not.toHaveBeenCalled()
            expect(mockReportError).not.toHaveBeenCalled()
        })

        it('matches the typed error when the message is wrapped by InvalidRequestAppError prefix', async () => {
            const user = userEvent.setup()
            updateSubscription.mockRejectedValueOnce(
                makeGorgiasApiError(
                    "We couldn't update your subscription because Proration cannot be performed until all pending invoices are resolved.",
                ),
            )

            renderComponent()

            await user.click(
                screen.getByRole('button', { name: /open modal/i }),
            )
            await user.click(
                screen.getByRole('button', { name: /confirm modal/i }),
            )

            await waitFor(() => {
                expect(
                    screen.getByText('pending invoice error'),
                ).toBeInTheDocument()
            })

            expect(mockToastError).not.toHaveBeenCalled()
        })

        it('clears pending-invoice banner when modal is closed and reopened', async () => {
            const user = userEvent.setup()
            updateSubscription.mockRejectedValueOnce(
                makeGorgiasApiError(
                    'Proration cannot be performed until all pending invoices are resolved.',
                ),
            )

            renderComponent()

            await user.click(
                screen.getByRole('button', { name: /open modal/i }),
            )
            await user.click(
                screen.getByRole('button', { name: /confirm modal/i }),
            )

            await waitFor(() => {
                expect(
                    screen.getByText('pending invoice error'),
                ).toBeInTheDocument()
            })

            await user.click(
                screen.getByRole('button', { name: /close modal/i }),
            )
            await user.click(
                screen.getByRole('button', { name: /open modal/i }),
            )

            expect(
                screen.queryByText('pending invoice error'),
            ).not.toBeInTheDocument()
        })

        it('still shows generic error toast and reports to Sentry for unrelated API errors', async () => {
            const user = userEvent.setup()
            updateSubscription.mockRejectedValueOnce(
                makeGorgiasApiError('Something else broke'),
            )

            renderComponent()

            await user.click(
                screen.getByRole('button', { name: /open modal/i }),
            )
            await user.click(
                screen.getByRole('button', { name: /confirm modal/i }),
            )

            expect(mockToastError).toHaveBeenCalledWith(
                "Sorry, we couldn't update your subscription. Please try again.",
                { duration: 5000 },
            )

            expect(mockReportError).toHaveBeenCalledWith(expect.any(Error))
            expect(
                screen.queryByText('pending invoice error'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText('version conflict error'),
            ).not.toBeInTheDocument()
        })

        it.each([
            [
                'SubscriptionVersionConflict',
                'subscription has been modified since it was last retrieved, please refresh and try again',
            ],
            [
                'SubscriptionRenewalRampVersionInconsistent',
                'subscription scheduled changes at renewal has been updated',
            ],
            [
                'SubscriptionChangesInconsistentWithRamps',
                'subscription changes are inconsistent with existing scheduled changes',
            ],
        ])(
            'passes versionConflictError=true when apply returns a %s error and does not show a generic toast',
            async (_label, msg) => {
                const user = userEvent.setup()
                updateSubscription.mockRejectedValueOnce(
                    makeGorgiasApiError(
                        `We couldn't update your subscription because ${msg}`,
                    ),
                )

                renderComponent()

                await user.click(
                    screen.getByRole('button', { name: /open modal/i }),
                )
                await user.click(
                    screen.getByRole('button', { name: /confirm modal/i }),
                )

                await waitFor(() => {
                    expect(
                        screen.getByText('version conflict error'),
                    ).toBeInTheDocument()
                })

                expect(mockToastError).not.toHaveBeenCalled()
                expect(
                    screen.queryByText('pending invoice error'),
                ).not.toBeInTheDocument()
            },
        )
    })

    describe('payment method gating', () => {
        function renderWithProps(
            overrides: Partial<Parameters<typeof BillingSummaryCard>[0]> = {},
        ) {
            return render(
                <BillingSummaryCard
                    selectedPlans={{
                        [ProductType.Helpdesk]: {
                            plan: basicMonthlyHelpdeskPlan,
                            isSelected: true,
                        },
                        [ProductType.Automation]: { isSelected: false },
                        [ProductType.Voice]: { isSelected: false },
                        [ProductType.SMS]: { isSelected: false },
                        [ProductType.Convert]: { isSelected: false },
                    }}
                    cadence={Cadence.Month}
                    plansByProduct={plansByProduct}
                    totalProductAmount={basicMonthlyHelpdeskPlan.amount}
                    anyProductChanged={true}
                    anyNewProductSelected={false}
                    anyDowngradedPlanSelected={false}
                    updateSubscription={updateSubscription}
                    startSubscription={jest.fn()}
                    isSubscriptionUpdating={false}
                    autoUpgradeChanged={false}
                    cancellationDates={{}}
                    totalCancelledAmount={0}
                    cancelledProducts={[]}
                    isTrialing={false}
                    isCurrentSubscriptionCanceled={false}
                    periodEnd="2026-12-31"
                    ctaText="Update subscription"
                    hasCreditCard={true}
                    isPaymentEnabled={true}
                    setUpdateProcessStarted={mockSetUpdateProcessStarted}
                    setSessionSelectedPlans={jest.fn()}
                    subscriptionResourceVersion={12345}
                    {...overrides}
                />,
            )
        }

        it('flags payment method missing for active stripe subscription without card', async () => {
            const user = userEvent.setup()
            renderWithProps({ hasCreditCard: false })

            await user.click(
                screen.getByRole('button', { name: /open modal/i }),
            )

            expect(
                screen.getByText('payment method missing'),
            ).toBeInTheDocument()
        })

        it('does not flag payment method missing when active subscription has a card', async () => {
            const user = userEvent.setup()
            renderWithProps({ hasCreditCard: true })

            await user.click(
                screen.getByRole('button', { name: /open modal/i }),
            )

            expect(
                screen.queryByText('payment method missing'),
            ).not.toBeInTheDocument()
        })

        it('does not flag payment method missing when active stripe subscription has an ACH payment method (no card)', async () => {
            const user = userEvent.setup()
            renderWithProps({
                hasCreditCard: false,
                hasAchPaymentMethod: true,
            })

            await user.click(
                screen.getByRole('button', { name: /open modal/i }),
            )

            expect(
                screen.queryByText('payment method missing'),
            ).not.toBeInTheDocument()
        })

        it('flags payment method missing for active stripe subscription with neither card nor ACH', async () => {
            const user = userEvent.setup()
            renderWithProps({
                hasCreditCard: false,
                hasAchPaymentMethod: false,
            })

            await user.click(
                screen.getByRole('button', { name: /open modal/i }),
            )

            expect(
                screen.getByText('payment method missing'),
            ).toBeInTheDocument()
        })

        it('flags payment method missing for active shopify sub when shopify billing is inactive', async () => {
            const user = userEvent.setup()
            mockShouldPayWithShopify.mockReturnValue(true)
            mockGetShopifyBillingStatus.mockReturnValue(
                ShopifyBillingStatus.Inactive,
            )

            renderWithProps({ hasCreditCard: false })

            await user.click(
                screen.getByRole('button', { name: /open modal/i }),
            )

            expect(
                screen.getByText('payment method missing'),
            ).toBeInTheDocument()
        })
    })

    describe('when mid-cycle upgrade flag is off', () => {
        beforeEach(() => {
            mockUseFlag.mockReturnValue(false)
        })

        it('does not render ConfirmChangesModal', () => {
            renderComponent()

            expect(screen.queryByText('closed')).not.toBeInTheDocument()
            expect(screen.queryByText('open')).not.toBeInTheDocument()
        })

        it('calls updateSubscription directly via legacy SummaryFooter path', async () => {
            const user = userEvent.setup()
            renderComponent()

            await user.click(
                screen.getByRole('button', { name: /legacy submit/i }),
            )

            await waitFor(() => {
                expect(updateSubscription).toHaveBeenCalledTimes(1)
            })
        })
    })
})
