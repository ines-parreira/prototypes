import React from 'react'
import {render, fireEvent} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import {PlanInterval, ProductType} from 'models/billing/types'
import {
    basicMonthlyHelpdeskPrice,
    convertPrice1,
    HELPDESK_PRODUCT_ID,
} from 'fixtures/productPrices'
import {billingState} from 'fixtures/billing'
import {assumeMock} from 'utils/testing'
import ProductPlanSelection, {
    ProductPlanSelectionProps,
} from '../ProductPlanSelection'
import CancelProductModal from '../../CancelProductModal/CancelProductModal'
import useAutomatedHelpdeskCancellationFlowAvailable from '../../../hooks/useAutomatedHelpdeskCancellationFlowAvailable'

const mockStore = configureMockStore()
const store = mockStore({
    billing: fromJS(billingState),
    currentAccount: fromJS({
        current_subscription: {
            products: {
                [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPrice.price_id,
            },
        },
    }),
})

jest.mock('../../../hooks/useAutomatedHelpdeskCancellationFlowAvailable')
const useAutomatedHelpdeskCancellationFlowAvailableMock = assumeMock(
    useAutomatedHelpdeskCancellationFlowAvailable
)

jest.mock('react-router')
jest.mock('../../CancelProductModal/CancelProductModal')
const CancelProductModalMock = assumeMock(CancelProductModal)
describe('ProductPlanSelection', () => {
    beforeEach(() => {
        CancelProductModalMock.mockReset()
        CancelProductModalMock.mockImplementation(() => (
            <div data-testid="cancel-product-modal"></div>
        ))

        useAutomatedHelpdeskCancellationFlowAvailableMock.mockReset()
        useAutomatedHelpdeskCancellationFlowAvailableMock.mockImplementation(
            () => false
        )
    })
    const mockSetSelectedPlans = jest.fn()

    const selectedPlans = {
        helpdesk: {
            plan: basicMonthlyHelpdeskPrice,
            isSelected: true,
        },
        automation: {
            isSelected: false,
        },
        voice: {
            isSelected: false,
        },
        sms: {
            isSelected: false,
        },
        convert: {
            isSelected: false,
        },
    }

    const props: ProductPlanSelectionProps = {
        type: ProductType.Helpdesk,
        interval: PlanInterval.Month,
        product: basicMonthlyHelpdeskPrice,
        prices: [
            basicMonthlyHelpdeskPrice,
            {
                ...basicMonthlyHelpdeskPrice,
                price_id: 'price_123',
                name: 'Product 1',
                num_quota_tickets: 100,
            },
            {
                ...basicMonthlyHelpdeskPrice,
                price_id: 'price_456',
                name: 'Product 2',
                num_quota_tickets: 200,
            },
        ],
        selectedPlans,
        setSelectedPlans: mockSetSelectedPlans,
        periodEnd: 'February 14, 2024',
    }

    it('does not display the cancel auto-renewal button and a modal if cancellation is not available', () => {
        const {queryByText} = render(
            <Provider store={store}>
                <ProductPlanSelection {...props} />
            </Provider>
        )
        expect(queryByText('Cancel auto-renewal')).toBeNull()
        expect(CancelProductModalMock).not.toHaveBeenCalled()
    })

    it('displays the cancel auto-renewal button if cancellation is available', () => {
        useAutomatedHelpdeskCancellationFlowAvailableMock.mockImplementation(
            () => true
        )
        const {getByRole, getByTestId} = render(
            <Provider store={store}>
                <ProductPlanSelection {...props} />
            </Provider>
        )

        expect(
            getByRole('button', {name: 'Cancel auto-renewal'})
        ).toBeInTheDocument()
        expect(getByTestId('cancel-product-modal')).toBeInTheDocument()
    })

    it('opens the cancel product modal flow', () => {
        useAutomatedHelpdeskCancellationFlowAvailableMock.mockImplementation(
            () => true
        )
        const expectedProps = {
            onClose: expect.any(Function),
            isOpen: false,
            productType: ProductType.Helpdesk,
            subscriptionProducts: {
                [ProductType.Helpdesk]: basicMonthlyHelpdeskPrice,
                [ProductType.Automation]: null,
                [ProductType.Voice]: null,
                [ProductType.SMS]: null,
                [ProductType.Convert]: null,
            },
            periodEnd: props.periodEnd,
        }

        const {getByRole, getByTestId} = render(
            <Provider store={store}>
                <ProductPlanSelection {...props} />
            </Provider>
        )

        const cancelAutoRenewalButton = getByRole('button', {
            name: 'Cancel auto-renewal',
        })
        expect(CancelProductModalMock).toHaveBeenCalledWith(expectedProps, {})
        cancelAutoRenewalButton.click()
        expect(getByTestId('cancel-product-modal')).toBeInTheDocument()

        expect(CancelProductModalMock).toHaveBeenCalledWith(
            {...expectedProps, isOpen: true},
            {}
        )
    })

    it('displays the product type title', () => {
        const {getByText} = render(
            <Provider store={store}>
                <ProductPlanSelection {...props} />
            </Provider>
        )
        expect(getByText('Helpdesk')).toBeInTheDocument()
    })

    it('displays the active badge when product is active', () => {
        const {getByText} = render(
            <Provider store={store}>
                <ProductPlanSelection {...props} />
            </Provider>
        )
        expect(getByText('Active')).toBeInTheDocument()
    })

    it('displays the add product button when product is not active', () => {
        const {getByText} = render(
            <Provider store={store}>
                <ProductPlanSelection
                    {...props}
                    product={undefined}
                    selectedPlans={{
                        ...selectedPlans,
                        [ProductType.Helpdesk]: {isSelected: false},
                    }}
                />
            </Provider>
        )
        expect(getByText('Add Product')).toBeInTheDocument()
    })

    it('calls handleClose when the close button is clicked', () => {
        const {getByText} = render(
            <Provider store={store}>
                <ProductPlanSelection {...props} product={undefined} />
            </Provider>
        )
        const closeButton = getByText('close')
        fireEvent.click(closeButton)
        expect(mockSetSelectedPlans).toHaveBeenCalled()
    })

    it('calls handleOpen when the add product button is clicked', () => {
        const {getByText} = render(
            <Provider store={store}>
                <ProductPlanSelection
                    {...props}
                    product={undefined}
                    selectedPlans={{
                        ...selectedPlans,
                        [ProductType.Helpdesk]: {isSelected: false},
                    }}
                />
            </Provider>
        )
        const addProductButton = getByText('Add Product')
        fireEvent.click(addProductButton)
        expect(mockSetSelectedPlans).toHaveBeenCalled()
    })

    it('displays the auto-upgrade toggle', () => {
        const {getByText} = render(
            <Provider store={store}>
                <ProductPlanSelection
                    {...props}
                    product={convertPrice1}
                    selectedPlans={{
                        ...selectedPlans,
                        [ProductType.Convert]: {
                            isSelected: true,
                            autoUpgrade: true,
                            plan: convertPrice1,
                        },
                    }}
                    type={ProductType.Convert}
                />
            </Provider>
        )
        expect(getByText('Click allowance auto-upgrade')).toBeInTheDocument()
    })
})
