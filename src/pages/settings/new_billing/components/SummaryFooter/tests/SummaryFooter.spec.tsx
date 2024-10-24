import {render, fireEvent, screen, waitFor} from '@testing-library/react'
import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {
    HELPDESK_PRODUCT_ID,
    products,
    basicMonthlyHelpdeskPlan,
} from 'fixtures/productPrices'
import {BILLING_BASE_PATH} from 'pages/settings/new_billing/constants'
import {RootState, StoreDispatch} from 'state/types'

import SummaryFooter, {SummaryFooterProps} from '../SummaryFooter'

const mockedStore = configureMockStore<DeepPartial<RootState>, StoreDispatch>()

const store = mockedStore({
    billing: fromJS({
        currentAccount: fromJS({
            current_subscription: {
                products: {
                    [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.price_id,
                },
            },
        }),
        products,
    }),
})

const mockHistoryPush = jest.fn()

jest.mock(
    'react-router-dom',
    () =>
        ({
            ...jest.requireActual('react-router-dom'),
            useHistory: () => ({
                push: mockHistoryPush,
            }),
        }) as Record<string, unknown>
)

describe('SummaryFooter', () => {
    const mockUpdateSubscription = jest.fn()

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
        const {container} = render(
            <Provider store={store}>
                <SummaryFooter {...props} isPaymentEnabled={false} />
            </Provider>
        )

        expect(container.firstChild).toHaveClass('disabled')
    })

    it('renders legal text and checkboxes when anyProductChanged is true', () => {
        render(
            <Provider store={store}>
                <SummaryFooter {...props} />
            </Provider>
        )

        expect(
            screen.getByText(
                /You agree to be charged in accordance with the subscription plan/
            )
        ).toBeInTheDocument()
        expect(screen.getByText(/I agree to the/)).toBeInTheDocument()
    })

    it('does not render checkboxes when anyNewProductSelected is false', () => {
        render(
            <Provider store={store}>
                <SummaryFooter {...props} anyNewProductSelected={false} />
            </Provider>
        )

        expect(screen.queryByText(/I agree to the/)).not.toBeInTheDocument()
    })

    it('renders downgrade text when anyDowngradedPlanSelected is true and anyNewProductSelected is false', () => {
        render(
            <Provider store={store}>
                <SummaryFooter {...props} anyNewProductSelected={false} />
            </Provider>
        )

        expect(
            screen.queryByText(
                /Changes to your subscription will apply starting/
            )
        ).toBeInTheDocument()
    })

    it('enables the update subscription button when all conditions are met', () => {
        render(
            <Provider store={store}>
                <SummaryFooter {...props} anyNewProductSelected={false} />
            </Provider>
        )
        const button = screen.getByText('Update Subscription')
        expect(button).toBeEnabled()
    })

    it('calls handleSubscribe when the update subscription button is clicked', async () => {
        render(
            <Provider store={store}>
                <SummaryFooter {...props} anyNewProductSelected={false} />
            </Provider>
        )
        const button = screen.getByText('Update Subscription')
        fireEvent.click(button)

        expect(mockUpdateSubscription).toHaveBeenCalled()
        await waitFor(() => {
            expect(mockHistoryPush).toHaveBeenCalledWith(BILLING_BASE_PATH)
        })
    })
})
