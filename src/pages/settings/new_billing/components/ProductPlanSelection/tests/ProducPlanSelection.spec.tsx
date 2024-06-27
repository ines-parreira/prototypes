import React from 'react'
import {render, fireEvent} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import {PlanInterval, ProductType} from 'models/billing/types'
import {
    basicMonthlyAutomationPlan,
    basicMonthlyHelpdeskPlan,
    convertPlan1,
    HELPDESK_PRODUCT_ID,
} from 'fixtures/productPrices'
import {billingState} from 'fixtures/billing'
import {assumeMock} from 'utils/testing'
import {logEvent, SegmentEvent} from 'common/segment'
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
                [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.price_id,
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

jest.mock('common/segment')
const logEventMock = assumeMock(logEvent)

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
            plan: basicMonthlyHelpdeskPlan,
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
        product: basicMonthlyHelpdeskPlan,
        prices: [
            basicMonthlyHelpdeskPlan,
            {
                ...basicMonthlyHelpdeskPlan,
                price_id: 'price_123',
                name: 'Product 1',
                num_quota_tickets: 100,
            },
            {
                ...basicMonthlyHelpdeskPlan,
                price_id: 'price_456',
                name: 'Product 2',
                num_quota_tickets: 200,
            },
        ],
        selectedPlans,
        setSelectedPlans: mockSetSelectedPlans,
        periodEnd: 'February 14, 2024',
        editingAvailable: true,
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

    it('does not display the cancel auto-renewal button if cancellation is available, but editing is not available', () => {
        useAutomatedHelpdeskCancellationFlowAvailableMock.mockImplementation(
            () => true
        )
        const {queryByText} = render(
            <Provider store={store}>
                <ProductPlanSelection {...props} editingAvailable={false} />
            </Provider>
        )
        expect(queryByText('Cancel auto-renewal')).toBeNull()
        expect(CancelProductModalMock).not.toHaveBeenCalled()
    })

    it('does not display the cancel auto-renewal button if cancellation is available and editing is available, but subscription is trialing', () => {
        useAutomatedHelpdeskCancellationFlowAvailableMock.mockImplementation(
            () => true
        )
        const {queryByText} = render(
            <Provider store={store}>
                <ProductPlanSelection {...props} isTrialing={true} />
            </Provider>
        )
        expect(queryByText('Cancel auto-renewal')).toBeNull()
        expect(CancelProductModalMock).not.toHaveBeenCalled()
    })

    it('displays the cancel auto-renewal button if cancellation is available, subscription is active and editing is available', () => {
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
                [ProductType.Helpdesk]: basicMonthlyHelpdeskPlan,
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

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.SubscriptionCancellationAutoRenewalClicked,
            {
                productType: ProductType.Helpdesk,
                productPlan: basicMonthlyHelpdeskPlan.name,
            }
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
                    product={convertPlan1}
                    selectedPlans={{
                        ...selectedPlans,
                        [ProductType.Convert]: {
                            isSelected: true,
                            autoUpgrade: true,
                            plan: convertPlan1,
                        },
                    }}
                    type={ProductType.Convert}
                />
            </Provider>
        )
        expect(getByText('Click allowance auto-upgrade')).toBeInTheDocument()
    })

    it('should keep add product button disabled if editing is not available', () => {
        const {queryByText} = render(
            <Provider store={store}>
                <ProductPlanSelection
                    {...props}
                    product={convertPlan1}
                    selectedPlans={{
                        ...selectedPlans,
                        [ProductType.Convert]: {
                            isSelected: false,
                            autoUpgrade: false,
                            plan: convertPlan1,
                        },
                    }}
                    type={ProductType.Convert}
                    editingAvailable={false}
                />
            </Provider>
        )

        expect(queryByText('Add Product')).toHaveClass('isDisabled')
        expect(
            queryByText('Click allowance auto-upgrade')
        ).not.toBeInTheDocument()
    })

    it('should keep add product button disabled if editing is not available', () => {
        const {queryByText} = render(
            <Provider store={store}>
                <ProductPlanSelection
                    {...props}
                    product={convertPlan1}
                    selectedPlans={{
                        ...selectedPlans,
                        [ProductType.Convert]: {
                            isSelected: false,
                            autoUpgrade: false,
                            plan: convertPlan1,
                        },
                    }}
                    type={ProductType.Convert}
                    editingAvailable={false}
                />
            </Provider>
        )

        expect(queryByText('Add Product')).toHaveClass('isDisabled')
        expect(
            queryByText('Click allowance auto-upgrade')
        ).not.toBeInTheDocument()
    })

    it.each([
        [
            ProductType.Convert,
            {isSelected: true, autoUpgrade: true, plan: convertPlan1},
            'Remove product',
        ],
        [
            ProductType.Automation,
            {isSelected: true, plan: basicMonthlyAutomationPlan},
            'Remove product',
        ],
        [
            ProductType.Helpdesk,
            {isSelected: true, plan: basicMonthlyHelpdeskPlan},
            'Cancel auto-renewal',
        ],
    ])(
        '%p: no removal button is displayed if editing is not available',
        (productType, selectedProduct, expectedButtonText) => {
            const {queryByRole} = render(
                <Provider store={store}>
                    <ProductPlanSelection
                        {...props}
                        product={convertPlan1}
                        selectedPlans={{
                            ...selectedPlans,
                            [productType]: {
                                ...selectedProduct,
                            },
                        }}
                        type={productType}
                        editingAvailable={false}
                    />
                </Provider>
            )

            expect(
                queryByRole('button', {name: expectedButtonText})
            ).not.toBeInTheDocument()
        }
    )
})
