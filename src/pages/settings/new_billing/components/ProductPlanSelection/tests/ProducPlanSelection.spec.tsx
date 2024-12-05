import {render, fireEvent, screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import {resetLDMocks, mockFlags} from 'jest-launchdarkly-mock'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {logEvent, SegmentEvent} from 'common/segment'
import {FeatureFlagKey} from 'config/featureFlags'
import {billingState} from 'fixtures/billing'
import {
    basicMonthlyAutomationPlan,
    basicMonthlyHelpdeskPlan,
    convertPlan1,
    HELPDESK_PRODUCT_ID,
} from 'fixtures/productPrices'
import {PlanInterval, ProductType} from 'models/billing/types'
import {assumeMock} from 'utils/testing'

import useAutomatedHelpdeskCancellationFlowAvailable from '../../../hooks/useAutomatedHelpdeskCancellationFlowAvailable'
import CancelProductModal from '../../CancelProductModal/CancelProductModal'
import ProductPlanSelection, {
    ProductPlanSelectionProps,
} from '../ProductPlanSelection'

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
        resetLDMocks()
        mockFlags({
            [FeatureFlagKey.BillingVoiceSmsSelfServe]: false,
        })
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
        currentPlan: basicMonthlyHelpdeskPlan,
        availablePlans: [
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
        render(
            <Provider store={store}>
                <ProductPlanSelection {...props} />
            </Provider>
        )
        expect(
            screen.queryByText('Cancel auto-renewal')
        ).not.toBeInTheDocument()
        expect(CancelProductModalMock).not.toHaveBeenCalled()
    })

    it('does not display the cancel auto-renewal button if cancellation is available, but editing is not available', () => {
        useAutomatedHelpdeskCancellationFlowAvailableMock.mockImplementation(
            () => true
        )
        render(
            <Provider store={store}>
                <ProductPlanSelection {...props} editingAvailable={false} />
            </Provider>
        )
        expect(
            screen.queryByText('Cancel auto-renewal')
        ).not.toBeInTheDocument()
        expect(CancelProductModalMock).not.toHaveBeenCalled()
    })

    it('does not display the cancel auto-renewal button if cancellation is available and editing is available, but subscription is trialing', () => {
        useAutomatedHelpdeskCancellationFlowAvailableMock.mockImplementation(
            () => true
        )
        render(
            <Provider store={store}>
                <ProductPlanSelection {...props} isTrialing={true} />
            </Provider>
        )
        expect(
            screen.queryByText('Cancel auto-renewal')
        ).not.toBeInTheDocument()
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

        const {getByTestId} = render(
            <Provider store={store}>
                <ProductPlanSelection {...props} />
            </Provider>
        )

        const cancelAutoRenewalButton = screen.getByRole('button', {
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
        render(
            <Provider store={store}>
                <ProductPlanSelection {...props} />
            </Provider>
        )
        expect(screen.getByText('Helpdesk')).toBeInTheDocument()
    })

    it('displays the active badge when product is active', () => {
        render(
            <Provider store={store}>
                <ProductPlanSelection {...props} />
            </Provider>
        )
        expect(screen.getByText('Active')).toBeInTheDocument()
    })

    it('displays the add product button when product is not active', () => {
        render(
            <Provider store={store}>
                <ProductPlanSelection
                    {...props}
                    currentPlan={undefined}
                    selectedPlans={{
                        ...selectedPlans,
                        [ProductType.Helpdesk]: {isSelected: false},
                    }}
                />
            </Provider>
        )
        expect(screen.getByText('Add Product')).toBeInTheDocument()
    })

    it('calls handleClose when the close button is clicked', () => {
        render(
            <Provider store={store}>
                <ProductPlanSelection {...props} currentPlan={undefined} />
            </Provider>
        )
        const closeButton = screen.getByText('close')
        fireEvent.click(closeButton)
        expect(mockSetSelectedPlans).toHaveBeenCalled()
    })

    it('calls handleOpen when the add product button is clicked', () => {
        render(
            <Provider store={store}>
                <ProductPlanSelection
                    {...props}
                    currentPlan={undefined}
                    selectedPlans={{
                        ...selectedPlans,
                        [ProductType.Helpdesk]: {isSelected: false},
                    }}
                />
            </Provider>
        )
        const addProductButton = screen.getByText('Add Product')
        fireEvent.click(addProductButton)
        expect(mockSetSelectedPlans).toHaveBeenCalled()
    })

    it('displays the auto-upgrade toggle', () => {
        render(
            <Provider store={store}>
                <ProductPlanSelection
                    {...props}
                    currentPlan={convertPlan1}
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
        expect(
            screen.getByText('Click allowance auto-upgrade')
        ).toBeInTheDocument()
    })

    it('should keep add product button disabled if editing is not available', () => {
        render(
            <Provider store={store}>
                <ProductPlanSelection
                    {...props}
                    currentPlan={convertPlan1}
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

        expect(
            screen.getByRole('button', {name: /Add Product/})
        ).toBeAriaDisabled()
        expect(
            screen.queryByText('Click allowance auto-upgrade')
        ).not.toBeInTheDocument()
    })

    it('should keep add product button disabled if editing is not available', () => {
        render(
            <Provider store={store}>
                <ProductPlanSelection
                    {...props}
                    currentPlan={convertPlan1}
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

        expect(
            screen.getByRole('button', {name: /Add Product/})
        ).toBeAriaDisabled()
        expect(
            screen.queryByText('Click allowance auto-upgrade')
        ).not.toBeInTheDocument()
    })

    it.each([ProductType.Voice, ProductType.SMS])(
        '%p: should disable the add button for trialing users ',
        (productType) => {
            mockFlags({
                [FeatureFlagKey.BillingVoiceSmsSelfServe]: true,
            })
            render(
                <Provider store={store}>
                    <ProductPlanSelection
                        {...props}
                        selectedPlans={{
                            ...selectedPlans,
                            [productType]: {plan: null},
                        }}
                        type={productType}
                        editingAvailable={true}
                        isTrialing={true}
                    />
                </Provider>
            )

            expect(
                screen.getByRole('button', {name: /Add Product/})
            ).toBeAriaDisabled()
        }
    )

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
                        currentPlan={convertPlan1}
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
