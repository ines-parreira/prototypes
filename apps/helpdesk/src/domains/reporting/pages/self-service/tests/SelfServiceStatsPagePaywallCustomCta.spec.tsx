import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock } from '@repo/testing'
import { fireEvent, screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { basicMonthlyHelpdeskPlan } from 'fixtures/productPrices'
import type { RootState } from 'state/types'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'

import SelfServiceStatsPagePaywallCustomCta from '../SelfServiceStatsPagePaywallCustomCta'

jest.mock('@repo/logging')
const logEventMock = assumeMock(logEvent)

jest.mock('pages/settings/billing/automate/AutomateSubscriptionButton', () => {
    return function AutomateSubscriptionButton({
        onClick,
        label,
        segmentEventToSend,
    }: {
        onClick: () => void
        label: string
        segmentEventToSend: any
    }) {
        return (
            <button
                data-testid="automate-subscription-button"
                onClick={() => {
                    onClick()
                    if (segmentEventToSend) {
                        logEvent(
                            segmentEventToSend.name,
                            segmentEventToSend.props,
                        )
                    }
                }}
            >
                {label}
            </button>
        )
    }
})

jest.mock('pages/settings/billing/automate/AutomateSubscriptionModal', () => {
    return function AutomateSubscriptionModal({
        isOpen,
        onClose,
        confirmLabel,
    }: {
        isOpen: boolean
        onClose: () => void
        confirmLabel: string
    }) {
        if (!isOpen) return null
        return (
            <div data-testid="automate-subscription-modal">
                <button data-testid="modal-close-button" onClick={onClose}>
                    Close
                </button>
                <div data-testid="modal-confirm-label">{confirmLabel}</div>
            </div>
        )
    }
})

const defaultState: Partial<RootState> = {
    currentAccount: fromJS({
        ...account,
        domain: 'test-domain',
    }),
    billing: fromJS(billingState),
}

describe('SelfServiceStatsPagePaywallCustomCta', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the subscription button with correct label', () => {
        renderWithStoreAndQueryClientProvider(
            <SelfServiceStatsPagePaywallCustomCta />,
            defaultState,
        )

        const button = screen.getByTestId('automate-subscription-button')
        expect(button).toBeInTheDocument()
        expect(button).toHaveTextContent('Learn More')
    })

    it('should not render the modal initially', () => {
        renderWithStoreAndQueryClientProvider(
            <SelfServiceStatsPagePaywallCustomCta />,
            defaultState,
        )

        expect(
            screen.queryByTestId('automate-subscription-modal'),
        ).not.toBeInTheDocument()
    })

    it('should open the modal when button is clicked', () => {
        renderWithStoreAndQueryClientProvider(
            <SelfServiceStatsPagePaywallCustomCta />,
            defaultState,
        )

        const button = screen.getByTestId('automate-subscription-button')
        fireEvent.click(button)

        expect(
            screen.getByTestId('automate-subscription-modal'),
        ).toBeInTheDocument()
        expect(screen.getByTestId('modal-confirm-label')).toHaveTextContent(
            'Subscribe',
        )
    })

    it('should close the modal when close button is clicked', () => {
        renderWithStoreAndQueryClientProvider(
            <SelfServiceStatsPagePaywallCustomCta />,
            defaultState,
        )

        const button = screen.getByTestId('automate-subscription-button')
        fireEvent.click(button)

        expect(
            screen.getByTestId('automate-subscription-modal'),
        ).toBeInTheDocument()

        const closeButton = screen.getByTestId('modal-close-button')
        fireEvent.click(closeButton)

        expect(
            screen.queryByTestId('automate-subscription-modal'),
        ).not.toBeInTheDocument()
    })

    it('should send segment event with correct data when button is clicked', () => {
        renderWithStoreAndQueryClientProvider(
            <SelfServiceStatsPagePaywallCustomCta />,
            defaultState,
        )

        const button = screen.getByTestId('automate-subscription-button')
        fireEvent.click(button)

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.PaywallUpgradeButtonSelected,
            {
                domain: 'test-domain',
                current_prices: [basicMonthlyHelpdeskPlan.plan_id],
                paywall_feature: 'automation_addon',
            },
        )
    })

    it('should send segment event with empty current_prices when no products are available', () => {
        const stateWithoutProducts: Partial<RootState> = {
            currentAccount: fromJS({
                ...account,
                domain: 'test-domain',
                current_subscription: {
                    ...account.current_subscription,
                    products: {},
                },
            }),
            billing: fromJS(billingState),
        }

        renderWithStoreAndQueryClientProvider(
            <SelfServiceStatsPagePaywallCustomCta />,
            stateWithoutProducts,
        )

        const button = screen.getByTestId('automate-subscription-button')
        fireEvent.click(button)

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.PaywallUpgradeButtonSelected,
            {
                domain: 'test-domain',
                current_prices: [],
                paywall_feature: 'automation_addon',
            },
        )
    })
})
