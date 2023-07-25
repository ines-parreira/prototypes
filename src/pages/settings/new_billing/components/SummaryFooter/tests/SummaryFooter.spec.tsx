import React from 'react'
import {render, fireEvent, screen, waitFor} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import {RootState, StoreDispatch} from 'state/types'
import {
    HELPDESK_PRODUCT_ID,
    products,
    basicMonthlyHelpdeskPrice,
} from 'fixtures/productPrices'
import SummaryFooter, {SummaryFooterProps} from '../SummaryFooter'
import {BILLING_BASE_PATH} from '../../../constants'

const mockedStore = configureMockStore<DeepPartial<RootState>, StoreDispatch>()

const store = mockedStore({
    billing: fromJS({
        currentAccount: fromJS({
            current_subscription: {
                products: {
                    [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPrice.price_id,
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
        } as Record<string, unknown>)
)

describe('SummaryFooter', () => {
    const mockHandleSubscribe = jest.fn()

    const props: SummaryFooterProps = {
        isPaymentEnabled: true,
        isTrialing: false,
        anyProductChanged: true,
        anyNewProductSelected: true,
        anyDowngradedPlanSelected: true,
        handleSubscribe: mockHandleSubscribe,
        periodEnd: '2020-12-31',
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
        const {getByTestId} = render(
            <Provider store={store}>
                <SummaryFooter {...props} />
            </Provider>
        )
        expect(getByTestId('legalText')).toBeInTheDocument()
        expect(getByTestId('terms')).toBeInTheDocument()
    })

    it('does not render checkboxes when anyNewProductSelected is false', () => {
        const {queryByTestId} = render(
            <Provider store={store}>
                <SummaryFooter {...props} anyNewProductSelected={false} />
            </Provider>
        )
        expect(queryByTestId('terms')).toBeNull()
    })

    it('renders downgrade text when anyDowngradedPlanSelected is true and anyNewProductSelected is false', () => {
        const {queryByTestId} = render(
            <Provider store={store}>
                <SummaryFooter {...props} anyNewProductSelected={false} />
            </Provider>
        )
        expect(queryByTestId('downgradeText')).toBeInTheDocument()
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

        expect(mockHandleSubscribe).toHaveBeenCalled()
        await waitFor(() => {
            expect(mockHistoryPush).toHaveBeenCalledWith(BILLING_BASE_PATH)
        })
    })
})
