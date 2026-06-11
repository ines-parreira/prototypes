import type { SelectedPlans } from '@repo/billing'
import {
    ACTIVATE_PAYMENT_WITH_SHOPIFY_URL,
    BILLING_BASE_PATH,
    BILLING_PAYMENT_CARD_PATH,
} from '@repo/billing'
import { render } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    basicMonthlyHelpdeskPlan,
    HELPDESK_PRODUCT_ID,
    products,
} from 'fixtures/plans'
import { ProductType } from 'models/billing/types'
import { ShopifyBillingStatus } from 'state/currentAccount/types'
import type { RootState, StoreDispatch } from 'state/types'

import type { SummaryFooterProps } from '../SummaryFooter'
import { SummaryFooter } from '../SummaryFooter'

const mockedStore = configureMockStore<DeepPartial<RootState>, StoreDispatch>([
    thunk,
])

const store = mockedStore({
    billing: fromJS({
        currentAccount: fromJS({
            current_subscription: {
                products: {
                    [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.plan_id,
                },
            },
        }),
        products,
    }),
})

const mockHistoryPush = jest.fn()

jest.mock('@repo/logging', () => ({
    reportError: jest.fn(),
}))

jest.mock(
    'react-router-dom',
    () =>
        ({
            ...jest.requireActual('react-router-dom'),
            useHistory: () => ({
                push: mockHistoryPush,
            }),
        }) as Record<string, unknown>,
)

describe('SummaryFooter', () => {
    const mockUpdateSubscription = jest.fn(async () => undefined)

    beforeEach(() => {
        jest.clearAllMocks()
    })

    const props: SummaryFooterProps = {
        isPaymentEnabled: true,
        isTrialing: false,
        anyProductChanged: true,
        anyNewProductSelected: true,
        anyDowngradedPlanSelected: true,
        updateSubscription: mockUpdateSubscription,
        periodEnd: '2020-12-31',
        ctaText: 'Update Subscription',
    }

    it('disables the container when isPaymentEnabled is false', () => {
        const { container } = render(
            <Provider store={store}>
                <SummaryFooter {...props} isPaymentEnabled={false} />
            </Provider>,
        )

        expect(container.firstChild).toHaveClass('disabled')
    })

    it('renders legal text and checkboxes when anyProductChanged is true', () => {
        render(
            <Provider store={store}>
                <SummaryFooter {...props} />
            </Provider>,
        )

        expect(
            screen.getByText(
                /You agree to be charged in accordance with the subscription plan/,
            ),
        ).toBeInTheDocument()
        expect(screen.getByText(/I agree to the/)).toBeInTheDocument()
    })

    it('does not render checkboxes when anyNewProductSelected is false', () => {
        render(
            <Provider store={store}>
                <SummaryFooter {...props} anyNewProductSelected={false} />
            </Provider>,
        )

        expect(screen.queryByText(/I agree to the/)).not.toBeInTheDocument()
    })

    it('renders downgrade text when anyDowngradedPlanSelected is true and anyNewProductSelected is false', () => {
        render(
            <Provider store={store}>
                <SummaryFooter {...props} anyNewProductSelected={false} />
            </Provider>,
        )

        expect(
            screen.queryByText(
                /Changes to your subscription will apply starting/,
            ),
        ).toBeInTheDocument()
    })

    it('enables the update subscription button when all conditions are met', () => {
        render(
            <Provider store={store}>
                <SummaryFooter {...props} anyNewProductSelected={false} />
            </Provider>,
        )
        const button = screen.getByText('Update Subscription')
        expect(button).toBeEnabled()
    })

    it('calls handleSubscribe when the update subscription button is clicked', async () => {
        const user = userEvent.setup()
        render(
            <Provider store={store}>
                <SummaryFooter {...props} anyNewProductSelected={false} />
            </Provider>,
        )
        const button = screen.getByText('Update Subscription')
        await user.click(button)

        expect(mockUpdateSubscription).toHaveBeenCalled()
        await waitFor(() => {
            expect(mockHistoryPush).toHaveBeenCalledWith(BILLING_BASE_PATH)
        })
    })

    it('calls onOpenConfirmationModal when provided', async () => {
        const user = userEvent.setup()
        const onOpenConfirmationModal = jest.fn()

        render(
            <Provider store={store}>
                <SummaryFooter
                    {...props}
                    anyNewProductSelected={false}
                    onOpenConfirmationModal={onOpenConfirmationModal}
                />
            </Provider>,
        )

        await user.click(screen.getByText('Update Subscription'))

        expect(onOpenConfirmationModal).toHaveBeenCalled()
        expect(mockHistoryPush).not.toHaveBeenCalled()
    })

    describe('impersonation warning', () => {
        afterEach(() => {
            window.USER_IMPERSONATED = null
        })

        it('does not render the External page tag when not impersonating', () => {
            render(
                <Provider store={store}>
                    <SummaryFooter {...props} />
                </Provider>,
            )

            expect(
                screen.queryByText(/This is a customer-facing page/i),
            ).not.toBeInTheDocument()
        })

        it('renders the External page tag when impersonating', () => {
            window.USER_IMPERSONATED = true

            render(
                <Provider store={store}>
                    <SummaryFooter {...props} />
                </Provider>,
            )

            expect(
                screen.getByText(/This is a customer-facing page/i),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('link', { name: /internal billing page/i }),
            ).toBeInTheDocument()
        })
    })

    it('calls setSessionSelectedPlans with selectedPlans when subscription is updated', async () => {
        const user = userEvent.setup()
        const mockSetSessionSelectedPlans = jest.fn()
        const selectedPlans: SelectedPlans = {
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
        }

        render(
            <Provider store={store}>
                <SummaryFooter
                    {...props}
                    anyNewProductSelected={false}
                    selectedPlans={selectedPlans}
                    setSessionSelectedPlans={mockSetSessionSelectedPlans}
                />
            </Provider>,
        )
        const button = screen.getByText('Update Subscription')
        await user.click(button)

        expect(mockUpdateSubscription).toHaveBeenCalled()
        await waitFor(() => {
            expect(mockSetSessionSelectedPlans).toHaveBeenCalledWith(
                selectedPlans,
            )
        })
    })

    describe('canceled subscription restart flow', () => {
        const mockStartSubscription = jest.fn(async () => undefined)

        beforeEach(() => {
            jest.clearAllMocks()
        })

        const canceledProps: SummaryFooterProps = {
            ...props,
            anyNewProductSelected: false,
            isCurrentSubscriptionCanceled: true,
            startSubscription: mockStartSubscription,
            ctaText: 'Subscribe now',
        }

        it('calls startSubscription and redirects to billing for canceled sub with credit card', async () => {
            const user = userEvent.setup()
            render(
                <Provider store={store}>
                    <SummaryFooter {...canceledProps} hasCreditCard={true} />
                </Provider>,
            )

            await user.click(screen.getByText('Subscribe now'))

            expect(mockUpdateSubscription).toHaveBeenCalled()
            await waitFor(() => {
                expect(mockStartSubscription).toHaveBeenCalled()
            })
            expect(mockHistoryPush).toHaveBeenCalledWith(BILLING_BASE_PATH)
        })

        it('calls startSubscription and redirects to billing for canceled sub with ACH mandate (no card)', async () => {
            const user = userEvent.setup()
            render(
                <Provider store={store}>
                    <SummaryFooter
                        {...canceledProps}
                        hasCreditCard={false}
                        hasAchPaymentMethod={true}
                    />
                </Provider>,
            )

            await user.click(screen.getByText('Subscribe now'))

            expect(mockUpdateSubscription).toHaveBeenCalled()
            await waitFor(() => {
                expect(mockStartSubscription).toHaveBeenCalled()
            })
            expect(mockHistoryPush).toHaveBeenCalledWith(BILLING_BASE_PATH)
            expect(mockHistoryPush).not.toHaveBeenCalledWith(
                BILLING_PAYMENT_CARD_PATH,
            )
        })

        it('skips startSubscription and redirects to payment card setup when canceled sub has neither card nor ACH', async () => {
            const user = userEvent.setup()
            render(
                <Provider store={store}>
                    <SummaryFooter
                        {...canceledProps}
                        hasCreditCard={false}
                        hasAchPaymentMethod={false}
                    />
                </Provider>,
            )

            await user.click(screen.getByText('Subscribe now'))

            expect(mockUpdateSubscription).toHaveBeenCalled()
            await waitFor(() => {
                expect(mockHistoryPush).toHaveBeenCalledWith(
                    BILLING_PAYMENT_CARD_PATH,
                )
            })
            expect(mockStartSubscription).not.toHaveBeenCalled()
        })

        it('calls startSubscription and redirects to billing for canceled sub paying with active Shopify (no Stripe payment method)', async () => {
            const user = userEvent.setup()
            render(
                <Provider store={store}>
                    <SummaryFooter
                        {...canceledProps}
                        hasCreditCard={false}
                        shouldPayWithShopify={true}
                        shopifyBillingStatus={ShopifyBillingStatus.Active}
                    />
                </Provider>,
            )

            await user.click(screen.getByText('Subscribe now'))

            expect(mockUpdateSubscription).toHaveBeenCalled()
            await waitFor(() => {
                expect(mockStartSubscription).toHaveBeenCalled()
            })
            expect(mockHistoryPush).toHaveBeenCalledWith(BILLING_BASE_PATH)
            expect(mockHistoryPush).not.toHaveBeenCalledWith(
                BILLING_PAYMENT_CARD_PATH,
            )
        })

        it('redirects to Shopify activate URL when paying with Shopify and billing is inactive (no Stripe fallback)', async () => {
            const user = userEvent.setup()
            render(
                <Provider store={store}>
                    <SummaryFooter
                        {...canceledProps}
                        hasCreditCard={false}
                        shouldPayWithShopify={true}
                        shopifyBillingStatus={ShopifyBillingStatus.Inactive}
                    />
                </Provider>,
            )

            await user.click(screen.getByText('Subscribe now'))

            expect(mockUpdateSubscription).toHaveBeenCalled()
            await waitFor(() => {
                expect(mockHistoryPush).toHaveBeenCalledWith(
                    ACTIVATE_PAYMENT_WITH_SHOPIFY_URL,
                )
            })
            expect(mockStartSubscription).not.toHaveBeenCalled()
            expect(mockHistoryPush).not.toHaveBeenCalledWith(
                BILLING_PAYMENT_CARD_PATH,
            )
        })
    })
})
