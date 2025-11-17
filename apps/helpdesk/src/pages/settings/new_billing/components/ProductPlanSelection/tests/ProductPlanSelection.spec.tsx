import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock } from '@repo/testing'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { billingState } from 'fixtures/billing'
import {
    basicMonthlyAutomationPlan,
    basicMonthlyHelpdeskPlan,
    convertPlan1,
    HELPDESK_PRODUCT_ID,
    starterHelpdeskPlan,
} from 'fixtures/productPrices'
import { Cadence, ProductType } from 'models/billing/types'
import { PRODUCT_INFO } from 'pages/settings/new_billing/constants'

import useAutomatedHelpdeskCancellationFlowAvailable from '../../../hooks/useAutomatedHelpdeskCancellationFlowAvailable'
import CancelProductModal from '../../CancelProductModal/CancelProductModal'
import type { ProductPlanSelectionProps } from '../ProductPlanSelection'
import ProductPlanSelection from '../ProductPlanSelection'

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
    useAutomatedHelpdeskCancellationFlowAvailable,
)

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: jest.fn(),
}))
jest.mock('../../CancelProductModal/CancelProductModal')
const CancelProductModalMock = assumeMock(CancelProductModal)

jest.mock('@repo/logging')
const logEventMock = assumeMock(logEvent)

describe('ProductPlanSelection', () => {
    beforeEach(() => {
        CancelProductModalMock.mockReset()
        CancelProductModalMock.mockImplementation(() => (
            <div data-testid="cancel-product-modal"></div>
        ))

        useAutomatedHelpdeskCancellationFlowAvailableMock.mockReset()
        useAutomatedHelpdeskCancellationFlowAvailableMock.mockImplementation(
            () => false,
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

    const currentPlan = basicMonthlyHelpdeskPlan
    const availablePlans = [
        starterHelpdeskPlan,
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
    ]

    const props: ProductPlanSelectionProps = {
        type: ProductType.Helpdesk,
        cadence: Cadence.Month,
        currentPlan,
        availablePlans,
        selectedPlans,
        setSelectedPlans: mockSetSelectedPlans,
        periodEnd: 'February 14, 2024',
        editingAvailable: true,
    }

    it('does not display the cancel auto-renewal button and a modal if cancellation is not available', () => {
        render(
            <Provider store={store}>
                <ProductPlanSelection {...props} />
            </Provider>,
        )
        expect(
            screen.queryByText('Cancel auto-renewal'),
        ).not.toBeInTheDocument()
        expect(CancelProductModalMock).not.toHaveBeenCalled()
    })

    it('does not display the cancel auto-renewal button if cancellation is available, but editing is not available', () => {
        useAutomatedHelpdeskCancellationFlowAvailableMock.mockImplementation(
            () => true,
        )
        render(
            <Provider store={store}>
                <ProductPlanSelection {...props} editingAvailable={false} />
            </Provider>,
        )
        expect(
            screen.queryByText('Cancel auto-renewal'),
        ).not.toBeInTheDocument()
        expect(CancelProductModalMock).not.toHaveBeenCalled()
    })

    it('does not display the cancel auto-renewal button if cancellation is available and editing is available, but subscription is trialing', () => {
        useAutomatedHelpdeskCancellationFlowAvailableMock.mockImplementation(
            () => true,
        )
        render(
            <Provider store={store}>
                <ProductPlanSelection {...props} isTrialing={true} />
            </Provider>,
        )
        expect(
            screen.queryByText('Cancel auto-renewal'),
        ).not.toBeInTheDocument()
        expect(CancelProductModalMock).not.toHaveBeenCalled()
    })

    it('displays the cancel auto-renewal button if cancellation is available, subscription is active and editing is available', () => {
        useAutomatedHelpdeskCancellationFlowAvailableMock.mockImplementation(
            () => true,
        )
        const { getByRole, getByTestId } = render(
            <Provider store={store}>
                <ProductPlanSelection {...props} />
            </Provider>,
        )

        expect(
            getByRole('button', { name: 'Cancel auto-renewal' }),
        ).toBeInTheDocument()
        expect(getByTestId('cancel-product-modal')).toBeInTheDocument()
    })

    it('opens the cancel product modal flow', async () => {
        useAutomatedHelpdeskCancellationFlowAvailableMock.mockImplementation(
            () => true,
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

        const { getByTestId } = render(
            <Provider store={store}>
                <ProductPlanSelection {...props} />
            </Provider>,
        )

        const cancelAutoRenewalButton = screen.getByRole('button', {
            name: 'Cancel auto-renewal',
        })
        expect(CancelProductModalMock).toHaveBeenCalledWith(expectedProps, {})
        await act(() => userEvent.click(cancelAutoRenewalButton))
        expect(getByTestId('cancel-product-modal')).toBeInTheDocument()

        expect(CancelProductModalMock).toHaveBeenCalledWith(
            { ...expectedProps, isOpen: true },
            {},
        )

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.SubscriptionCancellationAutoRenewalClicked,
            {
                productType: ProductType.Helpdesk,
                productPlan: basicMonthlyHelpdeskPlan.name,
            },
        )
    })

    it('displays the product type title', () => {
        render(
            <Provider store={store}>
                <ProductPlanSelection {...props} />
            </Provider>,
        )
        expect(screen.getByText('Helpdesk')).toBeInTheDocument()
    })

    it('is possible to change plans', async () => {
        render(
            <Provider store={store}>
                <ProductPlanSelection {...props} />
            </Provider>,
        )

        const selectedPlan = screen.getByLabelText('Price value')
        expect(selectedPlan).toHaveTextContent(
            currentPlan.num_quota_tickets.toString(),
        )

        await act(() => userEvent.click(selectedPlan))

        const items = screen.getAllByRole('menuitem')

        expect(items).toHaveLength(availablePlans.length + 1) // +1 for enterprise
        for (const index in availablePlans) {
            expect(items[index]).toHaveTextContent(
                availablePlans[index].num_quota_tickets.toString(),
            )
        }

        await act(() => userEvent.click(items[1]))

        expect(mockSetSelectedPlans).toHaveBeenCalledTimes(1)
    })

    it.each(
        Object.values(Cadence).filter((cadence) => cadence !== Cadence.Month),
    )('disables the starter plan for %p cadence', async (cadence) => {
        render(
            <Provider store={store}>
                <ProductPlanSelection {...props} cadence={cadence} />
            </Provider>,
        )

        const selectedPlan = screen.getByLabelText('Price value')
        await act(() => userEvent.click(selectedPlan))

        // N.B. the disabled item is not assigned the menuitem role
        const item = screen.getByRole('button', {
            name: starterHelpdeskPlan.num_quota_tickets.toString(),
        })
        expect(item).toBeInTheDocument()
        expect(item).toBeDisabled()

        await act(() => userEvent.hover(item))

        const tooltip = await screen.findByRole('tooltip')
        expect(tooltip).toBeInTheDocument()
        expect(tooltip).toHaveTextContent(
            'Switch to monthly billing to downgrade to a Starter plan.',
        )
    })

    it('displays the active badge when product is active', () => {
        render(
            <Provider store={store}>
                <ProductPlanSelection {...props} />
            </Provider>,
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
                        [ProductType.Helpdesk]: { isSelected: false },
                    }}
                />
            </Provider>,
        )
        expect(screen.getByText('Add Product')).toBeInTheDocument()
    })

    it('calls handleClose when the close button is clicked', () => {
        render(
            <Provider store={store}>
                <ProductPlanSelection {...props} currentPlan={undefined} />
            </Provider>,
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
                        [ProductType.Helpdesk]: { isSelected: false },
                    }}
                />
            </Provider>,
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
            </Provider>,
        )
        expect(
            screen.getByText('Click allowance auto-upgrade'),
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
            </Provider>,
        )

        expect(
            screen.getByRole('button', { name: /Add Product/ }),
        ).toBeAriaDisabled()
        expect(
            screen.queryByText('Click allowance auto-upgrade'),
        ).not.toBeInTheDocument()
    })

    it('should filter out automate plans of different generation', () => {
        const gen5AutomatePlan = {
            ...basicMonthlyAutomationPlan,
            price_id: 'price_automate_456',
            name: 'Product automate 2',
            num_quota_tickets: 333,
            generation: 5,
        }
        const automateAvailablePlans = [
            {
                ...basicMonthlyAutomationPlan,
                price_id: 'price_automate_123',
                name: 'Product automate 1',
                num_quota_tickets: 111,
                generation: 6,
            },
            gen5AutomatePlan,
        ]

        const { queryByText } = render(
            <Provider store={store}>
                <ProductPlanSelection
                    {...props}
                    availablePlans={automateAvailablePlans}
                    currentPlan={gen5AutomatePlan}
                    selectedPlans={{
                        ...selectedPlans,
                        [ProductType.Automation]: {
                            isSelected: true,
                            autoUpgrade: false,
                            plan: gen5AutomatePlan,
                        },
                    }}
                    type={ProductType.Automation}
                    editingAvailable
                />
            </Provider>,
        )

        expect(queryByText(/111/)).not.toBeInTheDocument()
    })

    it('should filter out gen 5 automate plan when no current plan', () => {
        const automateAvailablePlans = [
            {
                ...basicMonthlyAutomationPlan,
                price_id: 'price_automate_456',
                name: 'Product automate 2',
                num_quota_tickets: 333,
                generation: 5,
            },
            {
                ...basicMonthlyAutomationPlan,
                price_id: 'price_automate_123',
                name: 'Product automate 1',
                num_quota_tickets: 111,
                generation: 6,
            },
        ]

        const { queryByText } = render(
            <Provider store={store}>
                <ProductPlanSelection
                    {...props}
                    currentPlan={undefined}
                    availablePlans={automateAvailablePlans}
                    selectedPlans={{
                        ...selectedPlans,
                        [ProductType.Automation]: {
                            isSelected: true,
                            autoUpgrade: false,
                        },
                    }}
                    type={ProductType.Automation}
                    editingAvailable
                />
            </Provider>,
        )

        expect(queryByText(/333/)).not.toBeInTheDocument()
    })

    it.each([ProductType.Voice, ProductType.SMS])(
        '%p: should disable the add button for trialing users ',
        (productType) => {
            render(
                <Provider store={store}>
                    <ProductPlanSelection
                        {...props}
                        selectedPlans={{
                            ...selectedPlans,
                            [productType]: { plan: null },
                        }}
                        type={productType}
                        editingAvailable={true}
                        isTrialing={true}
                    />
                </Provider>,
            )

            expect(
                screen.getByRole('button', { name: /Add Product/ }),
            ).toBeAriaDisabled()
        },
    )

    it.each([
        [
            ProductType.Convert,
            { isSelected: true, autoUpgrade: true, plan: convertPlan1 },
            'Remove product',
        ],
        [
            ProductType.Automation,
            { isSelected: true, plan: basicMonthlyAutomationPlan },
            'Remove product',
        ],
        [
            ProductType.Helpdesk,
            { isSelected: true, plan: basicMonthlyHelpdeskPlan },
            'Cancel auto-renewal',
        ],
    ])(
        '%p: no removal button is displayed if editing is not available',
        (productType, selectedProduct, expectedButtonText) => {
            const { queryByRole } = render(
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
                </Provider>,
            )

            expect(
                queryByRole('button', { name: expectedButtonText }),
            ).not.toBeInTheDocument()
        },
    )

    it('does not display the cancel auto-renewal button when currentSubscriptionProducts.helpdesk is null', () => {
        const storeWithoutHelpdeskPlan = mockStore({
            billing: fromJS(billingState),
            currentAccount: fromJS({
                current_subscription: {
                    products: {},
                },
            }),
        })

        useAutomatedHelpdeskCancellationFlowAvailableMock.mockImplementation(
            () => false,
        )

        render(
            <Provider store={storeWithoutHelpdeskPlan}>
                <ProductPlanSelection {...props} />
            </Provider>,
        )

        expect(
            screen.queryByText('Cancel auto-renewal'),
        ).not.toBeInTheDocument()
    })

    it.each(Object.values(ProductType))(
        'should render a tooltip on an active ProductPlanSelection component for %p',
        async (productType: ProductType) => {
            const testProps: ProductPlanSelectionProps = {
                ...props,
                type: productType,
                selectedPlans: {
                    ...props.selectedPlans,
                    [productType]: {
                        ...props.selectedPlans[productType],
                        isSelected: true,
                    },
                },
            }
            const user = userEvent.setup()
            const { container } = render(
                <Provider store={store}>
                    <ProductPlanSelection {...testProps} />
                </Provider>,
            )

            const productInfo = PRODUCT_INFO[productType]
            const infoIcon = container.querySelector(
                `#priceSelectInfo_${productType}`,
            )

            await act(() => user.hover(infoIcon!))

            const tooltip = screen.getByText(productInfo.tooltip)
            expect(tooltip).toBeInTheDocument()

            const tooltipContainer = screen.getByRole('tooltip')
            expect(tooltipContainer).toBeInTheDocument()

            const link = within(tooltipContainer!).getByText('Learn more')
            expect(link).toBeInTheDocument()
            expect(link).toHaveAttribute('href', productInfo.tooltipLink)

            expect(tooltip).toHaveAttribute(
                'data-candu-id',
                `product-info-${productType}-tooltip`,
            )
        },
    )
})
