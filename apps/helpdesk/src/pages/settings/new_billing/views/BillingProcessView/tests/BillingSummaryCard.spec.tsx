import { useFlag } from '@repo/feature-flags'
import { logEvent, SegmentEvent } from '@repo/logging'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
    basicMonthlyHelpdeskPlan,
    convertPlan1,
    smsPlan1,
    voicePlan1,
} from 'fixtures/plans'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { Cadence, ProductType } from 'models/billing/types'
import type { PlansByProduct } from 'pages/settings/new_billing/types'
import {
    getShopifyBillingStatus,
    shouldPayWithShopify,
} from 'state/currentAccount/selectors'
import { ShopifyBillingStatus } from 'state/currentAccount/types'

import {
    ACTIVATE_PAYMENT_WITH_SHOPIFY_URL,
    BILLING_BASE_PATH,
    BILLING_PAYMENT_CARD_PATH,
} from '../../../constants'
import { BillingSummaryCard } from '../BillingSummaryCard'

jest.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: {
        MidCycleUpgradeBillingLogic: 'mid-cycle-upgrade-billing-logic',
    },
    useFlag: jest.fn(),
}))
jest.mock('@repo/logging', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {
        BillingUsageAndPlansUpdateSubscriptionClicked:
            'billing-usage-and-plans-update-subscription-click',
    },
}))
jest.mock('utils/errors', () => ({
    reportError: jest.fn(),
}))
jest.mock('hooks/useAppDispatch')
jest.mock('hooks/useAppSelector')
jest.mock('state/currentAccount/selectors', () => ({
    shouldPayWithShopify: jest.fn(),
    getShopifyBillingStatus: jest.fn(),
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
    ConfirmChangesModal: jest.fn(({ isOpen, onConfirm }) => (
        <div>
            <span>{isOpen ? 'open' : 'closed'}</span>
            {isOpen && (
                <button onClick={onConfirm} type="button">
                    confirm modal
                </button>
            )}
        </div>
    )),
}))

jest.mock(
    'pages/settings/new_billing/components/SummaryPaymentSection/NewSummaryPaymentSection',
    () => ({
        NewSummaryPaymentSection: jest.fn(() => null),
    }),
)

const mockHistoryPush = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-router-dom'),
    useHistory: () => ({
        push: mockHistoryPush,
    }),
}))

const mockUseAppDispatch = jest.mocked(useAppDispatch)
const mockUseAppSelector = jest.mocked(useAppSelector)
const mockShouldPayWithShopify = jest.mocked(shouldPayWithShopify)
const mockGetShopifyBillingStatus = jest.mocked(getShopifyBillingStatus)

const mockUseFlag = jest.mocked(useFlag)

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
    const mockDispatch = jest.fn()
    const updateSubscription = jest.fn()
    const mockSetUpdateProcessStarted = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAppDispatch.mockReturnValue(mockDispatch)
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

    it('dispatches error notification and resets updateProcessStarted on failure', async () => {
        const user = userEvent.setup()
        updateSubscription.mockRejectedValueOnce(new Error('API error'))

        renderComponent()

        await user.click(screen.getByRole('button', { name: /open modal/i }))

        await waitFor(() => {
            expect(screen.getByText('open')).toBeInTheDocument()
        })

        await user.click(screen.getByRole('button', { name: /confirm modal/i }))

        await waitFor(() => {
            expect(mockDispatch).toHaveBeenCalled()
        })

        expect(mockSetUpdateProcessStarted).toHaveBeenCalledWith(false)
    })

    it('calls startSubscription when subscription is canceled and has payment method', async () => {
        const user = userEvent.setup()
        const startSubscription = jest.fn().mockResolvedValue(undefined)

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
                startSubscription={startSubscription}
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
            />,
        )

        await user.click(screen.getByRole('button', { name: /open modal/i }))

        await waitFor(() => {
            expect(screen.getByText('open')).toBeInTheDocument()
        })

        await user.click(screen.getByRole('button', { name: /confirm modal/i }))

        await waitFor(() => {
            expect(startSubscription).toHaveBeenCalledTimes(1)
        })

        await waitFor(() => {
            expect(mockHistoryPush).toHaveBeenCalledWith(BILLING_BASE_PATH)
        })
    })

    it('redirects to payment card page when trialing', async () => {
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
                ctaText="Update subscription"
                hasCreditCard={true}
                isPaymentEnabled={true}
                setUpdateProcessStarted={mockSetUpdateProcessStarted}
                setSessionSelectedPlans={jest.fn()}
            />,
        )

        await user.click(screen.getByRole('button', { name: /open modal/i }))

        await waitFor(() => {
            expect(screen.getByText('open')).toBeInTheDocument()
        })

        await user.click(screen.getByRole('button', { name: /confirm modal/i }))

        await waitFor(() => {
            expect(mockHistoryPush).toHaveBeenCalledWith(
                BILLING_PAYMENT_CARD_PATH,
            )
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
