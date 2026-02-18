import type { ComponentProps } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock } from '@repo/testing'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'

import { UserRole } from 'config/types/user'
import { account, automationSubscriptionProductPrices } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import {
    basicYearlyInvoicedMonthlyHelpdeskPlan,
    HELPDESK_PRODUCT_ID,
} from 'fixtures/plans'
import type { RootState } from 'state/types'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'

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

const minProps: ComponentProps<typeof AutomateSubscriptionModal> = {
    confirmLabel: 'I am sure',
    isOpen: false,
    onClose: jest.fn(),
}

describe('<AutomateSubscriptionModal />', () => {
    it('should not render the modal', () => {
        const { baseElement } = renderWithStoreAndQueryClientProvider(
            <AutomateSubscriptionModal {...minProps} />,
            defaultState,
        )
        expect(logEventMock).not.toHaveBeenCalled()
        expect(baseElement).toMatchSnapshot()
    })

    it('should render the modal', () => {
        const { baseElement } = renderWithStoreAndQueryClientProvider(
            <AutomateSubscriptionModal {...minProps} isOpen />,
            defaultState,
        )
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.AutomatePaywallModalUpsell,
            { location: undefined },
        )
        expect(baseElement).toMatchSnapshot()
    })

    it('should display loader', async () => {
        renderWithStoreAndQueryClientProvider(
            <>
                {' '}
                <AutomateSubscriptionModal {...minProps} isOpen />
            </>,
            defaultState,
        )
        const button = await screen.findByText(/I am sure/)
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.AutomatePaywallModalUpsell,
            { location: undefined },
        )
        fireEvent.click(button)

        await waitFor(() => {
            expect(button).toMatchSnapshot()
        })
    })

    // TODO(React18): Fix this test
    it.skip('should render for customers already with full add-on features', async () => {
        const { baseElement } = renderWithStoreAndQueryClientProvider(
            <AutomateSubscriptionModal {...minProps} isOpen />,
            {
                ...defaultState,
                currentAccount: fromJS({
                    ...account,
                    current_subscription: {
                        ...account.current_subscription,
                        products: automationSubscriptionProductPrices,
                    },
                }),
            },
        )
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.AutomatePaywallModalUpsell,
            { location: undefined },
        )
        await screen.findByText(/Cancel subscription/i)

        await waitFor(() => {
            expect(baseElement).toMatchSnapshot()
        })
    })

    it('should display image', async () => {
        renderWithStoreAndQueryClientProvider(
            <>
                {' '}
                <AutomateSubscriptionModal
                    {...minProps}
                    isOpen
                    image="foo.png"
                />
            </>,
            defaultState,
        )
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.AutomatePaywallModalUpsell,
            { location: undefined },
        )
        const img = await screen.findByAltText(/features/)
        await waitFor(() => {
            expect(img).toMatchSnapshot()
        })
    })

    it('should display the new modal description component', async () => {
        renderWithStoreAndQueryClientProvider(
            <AutomateSubscriptionModal {...minProps} isOpen />,
            defaultState,
        )

        await waitFor(() => {
            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.AutomatePaywallModalUpsell,
                { location: undefined },
            )
            expect(
                screen.getByText(`Ready to upgrade with AI Agent?`),
            ).toBeInTheDocument()
        })
    })

    it('should display "Manage AI Agent" header when user has access', async () => {
        renderWithStoreAndQueryClientProvider(
            <AutomateSubscriptionModal {...minProps} isOpen />,
            {
                ...defaultState,
                currentAccount: fromJS({
                    ...account,
                    current_subscription: {
                        ...account.current_subscription,
                        products: automationSubscriptionProductPrices,
                    },
                }),
            },
        )

        await waitFor(() => {
            expect(
                screen.getByRole('heading', { name: /manage ai agent/i }),
            ).toBeInTheDocument()
        })
    })

    it('should display "Subscribe to AI Agent" header when user has no access', async () => {
        renderWithStoreAndQueryClientProvider(
            <AutomateSubscriptionModal {...minProps} isOpen />,
            defaultState,
        )

        await waitFor(() => {
            expect(
                screen.getByRole('heading', { name: /subscribe to ai agent/i }),
            ).toBeInTheDocument()
        })
    })

    it('should display custom header when headerDescription prop is provided', async () => {
        const customHeader = 'Custom Header Text'
        renderWithStoreAndQueryClientProvider(
            <AutomateSubscriptionModal
                {...minProps}
                isOpen
                headerDescription={customHeader}
            />,
            defaultState,
        )

        await waitFor(() => {
            expect(
                screen.getByRole('heading', { name: customHeader }),
            ).toBeInTheDocument()
        })
    })

    it('should show custom plan message and Contact Us button for yearly contract plans', async () => {
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

        renderWithStoreAndQueryClientProvider(
            <AutomateSubscriptionModal {...minProps} isOpen />,
            yearlyPlanState,
        )

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
})
