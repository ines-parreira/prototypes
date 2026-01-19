import { useFlag } from '@repo/feature-flags'
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
    currentProductsUsage,
    HELPDESK_PRODUCT_ID,
    SMS_PRODUCT_ID,
    smsPlan1,
    starterHelpdeskPlan,
    VOICE_PRODUCT_ID,
    voicePlan1,
} from 'fixtures/plans'
import { Cadence, ProductType } from 'models/billing/types'
import { getProductInfo } from 'models/billing/utils'

import useAutomatedHelpdeskCancellationFlowAvailable from '../../../hooks/useAutomatedHelpdeskCancellationFlowAvailable'
import { handleConvertProductRemoved } from '../../../utils/handleConvertProductRemoved'
import CancelAAOModal from '../../CancelAAOModal/CancelAAOModal'
import CancelProductModal from '../../CancelProductModal/CancelProductModal'
import type { ProductPlanSelectionProps } from '../ProductPlanSelection'
import ProductPlanSelection from '../ProductPlanSelection'

const mockStore = configureMockStore()
const store = mockStore({
    billing: fromJS(billingState),
    currentAccount: fromJS({
        current_subscription: {
            products: {
                [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.plan_id,
                [SMS_PRODUCT_ID]: smsPlan1.plan_id,
                [VOICE_PRODUCT_ID]: voicePlan1.plan_id,
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
    useLocation: jest.fn(() => ({ hash: '', pathname: '', search: '' })),
}))
jest.mock('../../CancelProductModal/CancelProductModal')
const CancelProductModalMock = assumeMock(CancelProductModal)

jest.mock('@repo/logging')
jest.mock('../../CancelAAOModal/CancelAAOModal')

const CancelAAOModalMock = assumeMock(CancelAAOModal)

jest.mock('@repo/feature-flags')

const useFlagMock = assumeMock(useFlag)

const logEventMock = assumeMock(logEvent)

jest.mock('../../../utils/handleConvertProductRemoved')
const handleConvertProductRemovedMock = assumeMock(handleConvertProductRemoved)

const mockUpdateSubscription = jest.fn()
const mockContactBilling = jest.fn()

describe('ProductPlanSelection', () => {
    beforeEach(() => {
        CancelProductModalMock.mockReset()
        CancelProductModalMock.mockImplementation(() => (
            <div data-testid="cancel-product-modal"></div>
        ))

        CancelAAOModalMock.mockReset()
        CancelAAOModalMock.mockImplementation(() => (
            <div data-testid="cancel-aao-modal"></div>
        ))

        mockUpdateSubscription.mockReset()
        mockUpdateSubscription.mockResolvedValue(undefined)

        mockContactBilling.mockReset()

        useFlagMock.mockReset()
        useFlagMock.mockReturnValue(false)

        useAutomatedHelpdeskCancellationFlowAvailableMock.mockReset()
        useAutomatedHelpdeskCancellationFlowAvailableMock.mockImplementation(
            () => false,
        )

        handleConvertProductRemovedMock.mockReset()
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
            plan_id: 'plan_123',
            name: 'Product 1',
            num_quota_tickets: 100,
        },
        {
            ...basicMonthlyHelpdeskPlan,
            plan_id: 'plan_456',
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
        updateSubscription: mockUpdateSubscription,
        contactBilling: mockContactBilling,
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
                [ProductType.Voice]: voicePlan1,
                [ProductType.SMS]: smsPlan1,
                [ProductType.Convert]: null,
            },
            periodEnd: props.periodEnd,
            currentUsage: props.currentUsage,
            selectedPlans: props.selectedPlans,
            setSelectedPlans: expect.any(Function),
            onCancellationConfirmed: expect.any(Function),
            updateSubscription: expect.any(Function),
            cancelledProducts: [],
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
            plan_id: 'plan_automate_456',
            name: 'Product automate 2',
            num_quota_tickets: 333,
            generation: 5,
        }
        const automateAvailablePlans = [
            {
                ...basicMonthlyAutomationPlan,
                plan_id: 'plan_automate_123',
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
                plan_id: 'plan_automate_456',
                name: 'Product automate 2',
                num_quota_tickets: 333,
                generation: 5,
            },
            {
                ...basicMonthlyAutomationPlan,
                plan_id: 'plan_automate_123',
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

            const productInfo = getProductInfo(productType, props.currentPlan)
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
        },
    )

    describe('AI Agent cancellation with consolidated modal feature flag turned ON', () => {
        const automationProps: ProductPlanSelectionProps = {
            type: ProductType.Automation,
            cadence: Cadence.Month,
            currentPlan: basicMonthlyAutomationPlan,
            availablePlans: [basicMonthlyAutomationPlan],
            selectedPlans: {
                ...selectedPlans,
                [ProductType.Automation]: {
                    plan: basicMonthlyAutomationPlan,
                    isSelected: true,
                },
            },
            setSelectedPlans: mockSetSelectedPlans,
            periodEnd: 'February 14, 2024',
            currentUsage: currentProductsUsage,
            editingAvailable: true,
            updateSubscription: mockUpdateSubscription,
            contactBilling: mockContactBilling,
        }

        it('shows CancelAAOModal when consolidated modal feature flag is OFF', async () => {
            useFlagMock.mockReturnValue(false)

            const { getByRole, getByTestId } = render(
                <Provider store={store}>
                    <ProductPlanSelection {...automationProps} />
                </Provider>,
            )

            const removeButton = getByRole('button', { name: 'Remove product' })
            expect(removeButton).toBeInTheDocument()

            await act(() => userEvent.click(removeButton))

            expect(getByTestId('cancel-aao-modal')).toBeInTheDocument()
            expect(CancelAAOModalMock).toHaveBeenCalledWith(
                {
                    isOpen: true,
                    handleCancelAAO: expect.any(Function),
                    handleOnClose: expect.any(Function),
                    periodEnd: automationProps.periodEnd,
                    currentUsage: automationProps.currentUsage,
                },
                {},
            )
        })

        it('shows CancelProductModal when consolidated modal feature flag is ON', async () => {
            useFlagMock.mockReturnValue(true)

            const { getByRole, getByTestId } = render(
                <Provider store={store}>
                    <ProductPlanSelection {...automationProps} />
                </Provider>,
            )

            const removeButton = getByRole('button', { name: 'Remove product' })
            expect(removeButton).toBeInTheDocument()

            await act(() => userEvent.click(removeButton))

            expect(getByTestId('cancel-product-modal')).toBeInTheDocument()
            expect(CancelProductModalMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    isOpen: true,
                    productType: ProductType.Automation,
                    periodEnd: automationProps.periodEnd,
                    currentUsage: automationProps.currentUsage,
                }),
                {},
            )
        })
    })

    describe('Convert and SMS cancellation with consolidated modal', () => {
        describe.each([
            {
                productType: ProductType.Convert,
                productName: 'Convert',
                currentPlan: convertPlan1,
                availablePlans: [convertPlan1],
                hasButtonWhenFlagOff: true,
            },
            {
                productType: ProductType.SMS,
                productName: 'SMS',
                currentPlan: smsPlan1,
                availablePlans: [smsPlan1],
                hasButtonWhenFlagOff: false,
            },
            {
                productType: ProductType.Voice,
                productName: 'Voice',
                currentPlan: voicePlan1,
                availablePlans: [voicePlan1],
                hasButtonWhenFlagOff: false,
            },
        ])(
            '$productName cancellation',
            ({
                productType,
                currentPlan,
                availablePlans,
                hasButtonWhenFlagOff,
            }) => {
                let productProps: ProductPlanSelectionProps

                beforeEach(() => {
                    productProps = {
                        type: productType,
                        cadence: Cadence.Month,
                        currentPlan,
                        availablePlans,
                        selectedPlans: {
                            ...selectedPlans,
                            [productType]: {
                                plan: currentPlan,
                                isSelected: true,
                            },
                        },
                        setSelectedPlans: mockSetSelectedPlans,
                        periodEnd: 'February 14, 2024',
                        editingAvailable: true,
                        updateSubscription: mockUpdateSubscription,
                        contactBilling: mockContactBilling,
                    }
                })

                if (hasButtonWhenFlagOff) {
                    it('does NOT show modal when Remove product button is clicked with feature flag OFF', async () => {
                        useFlagMock.mockReturnValue(false)

                        const { getByRole, queryByTestId } = render(
                            <Provider store={store}>
                                <ProductPlanSelection {...productProps} />
                            </Provider>,
                        )

                        const removeButton = getByRole('button', {
                            name: 'Remove product',
                        })
                        expect(removeButton).toBeInTheDocument()

                        await act(() => userEvent.click(removeButton))

                        expect(
                            queryByTestId('cancel-product-modal'),
                        ).not.toBeInTheDocument()
                        expect(
                            queryByTestId('cancel-aao-modal'),
                        ).not.toBeInTheDocument()
                    })
                } else {
                    it('does NOT show Remove product button when feature flag is OFF', async () => {
                        useFlagMock.mockReturnValue(false)

                        const { queryByRole } = render(
                            <Provider store={store}>
                                <ProductPlanSelection {...productProps} />
                            </Provider>,
                        )

                        const removeButton = queryByRole('button', {
                            name: 'Remove product',
                        })
                        expect(removeButton).not.toBeInTheDocument()
                    })
                }

                it('shows CancelProductModal when consolidated modal feature flag is ON', async () => {
                    useFlagMock.mockReturnValue(true)

                    const { getByRole, getByTestId } = render(
                        <Provider store={store}>
                            <ProductPlanSelection {...productProps} />
                        </Provider>,
                    )

                    const removeButton = getByRole('button', {
                        name: 'Remove product',
                    })
                    expect(removeButton).toBeInTheDocument()

                    await act(() => userEvent.click(removeButton))

                    expect(
                        getByTestId('cancel-product-modal'),
                    ).toBeInTheDocument()
                    expect(CancelProductModalMock).toHaveBeenCalledWith(
                        expect.objectContaining({
                            isOpen: true,
                            productType,
                            periodEnd: productProps.periodEnd,
                        }),
                        {},
                    )
                })
            },
        )

        describe('Convert-specific behavior', () => {
            const convertProps: ProductPlanSelectionProps = {
                type: ProductType.Convert,
                cadence: Cadence.Month,
                currentPlan: convertPlan1,
                availablePlans: [convertPlan1],
                selectedPlans: {
                    ...selectedPlans,
                    [ProductType.Convert]: {
                        plan: convertPlan1,
                        isSelected: true,
                    },
                },
                setSelectedPlans: mockSetSelectedPlans,
                periodEnd: 'February 14, 2024',
                editingAvailable: true,
                updateSubscription: mockUpdateSubscription,
                contactBilling: mockContactBilling,
            }

            it('calls handleConvertProductRemoved when Convert is removed with feature flag OFF', async () => {
                useFlagMock.mockReturnValue(false)

                const convertStore = mockStore({
                    billing: fromJS(billingState),
                    currentAccount: fromJS({
                        domain: 'test-account.gorgias.com',
                        current_subscription: {
                            products: {},
                        },
                    }),
                })

                const { getByRole } = render(
                    <Provider store={convertStore}>
                        <ProductPlanSelection {...convertProps} />
                    </Provider>,
                )

                const removeButton = getByRole('button', {
                    name: 'Remove product',
                })
                expect(removeButton).toBeInTheDocument()

                await act(() => userEvent.click(removeButton))

                expect(handleConvertProductRemovedMock).toHaveBeenCalledWith(
                    convertPlan1.plan_id,
                    'test-account.gorgias.com',
                )
            })

            it('calls handleConvertProductRemoved when Convert is removed after confirmation with feature flag ON', async () => {
                useFlagMock.mockReturnValue(true)

                const convertStore = mockStore({
                    billing: fromJS(billingState),
                    currentAccount: fromJS({
                        domain: 'test-account.gorgias.com',
                        current_subscription: {
                            products: {
                                [HELPDESK_PRODUCT_ID]:
                                    basicMonthlyHelpdeskPlan.plan_id,
                            },
                        },
                    }),
                })

                const { getByRole } = render(
                    <Provider store={convertStore}>
                        <ProductPlanSelection {...convertProps} />
                    </Provider>,
                )

                const removeButton = getByRole('button', {
                    name: 'Remove product',
                })
                expect(removeButton).toBeInTheDocument()

                await act(() => userEvent.click(removeButton))

                const cancelProductModalCalls =
                    CancelProductModalMock.mock.calls
                const lastCall =
                    cancelProductModalCalls[cancelProductModalCalls.length - 1]
                const modalProps = lastCall[0]

                expect(modalProps.onCancellationConfirmed).toBeDefined()

                await act(() => {
                    modalProps.onCancellationConfirmed?.()
                })

                expect(handleConvertProductRemovedMock).toHaveBeenCalledWith(
                    convertPlan1.plan_id,
                    'test-account.gorgias.com',
                )
            })
        })
    })

    describe('onCancellationConfirmed callback', () => {
        it.each([
            {
                productType: ProductType.Helpdesk,
                productName: 'Helpdesk',
                currentPlan: basicMonthlyHelpdeskPlan,
                availablePlans: [basicMonthlyHelpdeskPlan],
                buttonName: 'Cancel auto-renewal',
                setupMock: () => {
                    useAutomatedHelpdeskCancellationFlowAvailableMock.mockImplementation(
                        () => true,
                    )
                    useFlagMock.mockReturnValue(false)
                },
            },
            {
                productType: ProductType.Automation,
                productName: 'Automation',
                currentPlan: basicMonthlyAutomationPlan,
                availablePlans: [basicMonthlyAutomationPlan],
                buttonName: 'Remove product',
                setupMock: () => {
                    useFlagMock.mockReturnValue(true)
                },
            },
            {
                productType: ProductType.SMS,
                productName: 'SMS',
                currentPlan: smsPlan1,
                availablePlans: [smsPlan1],
                buttonName: 'Remove product',
                setupMock: () => {
                    useFlagMock.mockReturnValue(true)
                },
            },
            {
                productType: ProductType.Voice,
                productName: 'Voice',
                currentPlan: voicePlan1,
                availablePlans: [voicePlan1],
                buttonName: 'Remove product',
                setupMock: () => {
                    useFlagMock.mockReturnValue(true)
                },
            },
        ])(
            'should close the modal when $productName cancellation is confirmed',
            async ({
                productType,
                currentPlan,
                availablePlans,
                buttonName,
                setupMock,
            }) => {
                setupMock()

                const productProps: ProductPlanSelectionProps = {
                    type: productType,
                    cadence: Cadence.Month,
                    currentPlan,
                    availablePlans,
                    selectedPlans: {
                        ...selectedPlans,
                        [productType]: {
                            plan: currentPlan,
                            isSelected: true,
                        },
                    },
                    setSelectedPlans: mockSetSelectedPlans,
                    periodEnd: 'February 14, 2024',
                    editingAvailable: true,
                    updateSubscription: mockUpdateSubscription,
                    currentUsage:
                        productType === ProductType.Automation
                            ? currentProductsUsage
                            : undefined,
                    contactBilling: mockContactBilling,
                }

                const { getByRole } = render(
                    <Provider store={store}>
                        <ProductPlanSelection {...productProps} />
                    </Provider>,
                )

                const cancellationButton = getByRole('button', {
                    name: buttonName,
                })
                expect(cancellationButton).toBeInTheDocument()

                await act(() => userEvent.click(cancellationButton))

                const cancelProductModalCallsBeforeConfirmation =
                    CancelProductModalMock.mock.calls
                const callBeforeConfirmation =
                    cancelProductModalCallsBeforeConfirmation[
                        cancelProductModalCallsBeforeConfirmation.length - 1
                    ]
                const modalPropsBeforeConfirmation = callBeforeConfirmation[0]

                expect(modalPropsBeforeConfirmation.isOpen).toBe(true)
                expect(
                    modalPropsBeforeConfirmation.onCancellationConfirmed,
                ).toBeDefined()

                await act(() => {
                    modalPropsBeforeConfirmation.onCancellationConfirmed?.()
                    modalPropsBeforeConfirmation.onClose()
                })

                const cancelProductModalCallsAfterConfirmation =
                    CancelProductModalMock.mock.calls
                const callAfterConfirmation =
                    cancelProductModalCallsAfterConfirmation[
                        cancelProductModalCallsAfterConfirmation.length - 1
                    ]
                const modalPropsAfterConfirmation = callAfterConfirmation[0]

                expect(modalPropsAfterConfirmation.isOpen).toBe(false)
            },
        )
    })

    describe('Product cancellation badge', () => {
        it('should show "Active" badge when product is active without cancellation', () => {
            render(
                <Provider store={store}>
                    <ProductPlanSelection
                        {...props}
                        scheduledToCancelAt={null}
                    />
                </Provider>,
            )

            expect(screen.getByText('Active')).toBeInTheDocument()
            expect(screen.queryByText(/Active until/i)).not.toBeInTheDocument()
        })

        it('should show "Active until <date>" warning badge when product has cancellation scheduled', () => {
            const cancellationDate = '2025-12-31T23:59:59Z'

            render(
                <Provider store={store}>
                    <ProductPlanSelection
                        {...props}
                        scheduledToCancelAt={cancellationDate}
                    />
                </Provider>,
            )

            expect(screen.queryByText('Active')).not.toBeInTheDocument()
            expect(
                screen.getByText(/Active until December 31, 2025/i),
            ).toBeInTheDocument()
        })

        it('should not show any badge when product is inactive', () => {
            render(
                <Provider store={store}>
                    <ProductPlanSelection
                        {...props}
                        currentPlan={undefined}
                        selectedPlans={{
                            ...selectedPlans,
                            helpdesk: {
                                isSelected: false,
                            },
                        }}
                    />
                </Provider>,
            )

            expect(screen.queryByText('Active')).not.toBeInTheDocument()
            expect(screen.queryByText(/Active until/i)).not.toBeInTheDocument()
        })

        it('should format cancellation date correctly', () => {
            const cancellationDate = '2026-01-15T12:00:00Z'

            render(
                <Provider store={store}>
                    <ProductPlanSelection
                        {...props}
                        scheduledToCancelAt={cancellationDate}
                    />
                </Provider>,
            )

            expect(
                screen.getByText(/Active until January 15, 2026/i),
            ).toBeInTheDocument()
        })

        it('should show "Active" badge when scheduledToCancelAt is undefined', () => {
            render(
                <Provider store={store}>
                    <ProductPlanSelection {...props} />
                </Provider>,
            )

            expect(screen.getByText('Active')).toBeInTheDocument()
            expect(screen.queryByText(/Active until/i)).not.toBeInTheDocument()
        })
    })

    describe('Remove product button when scheduled for cancellation', () => {
        describe.each([
            {
                productType: ProductType.Automation,
                productName: 'Automation',
                currentPlan: basicMonthlyAutomationPlan,
                availablePlans: [basicMonthlyAutomationPlan],
                requiresFlag: false,
            },
            {
                productType: ProductType.Convert,
                productName: 'Convert',
                currentPlan: convertPlan1,
                availablePlans: [convertPlan1],
                requiresFlag: false,
            },
            {
                productType: ProductType.SMS,
                productName: 'SMS',
                currentPlan: smsPlan1,
                availablePlans: [smsPlan1],
                requiresFlag: true,
            },
            {
                productType: ProductType.Voice,
                productName: 'Voice',
                currentPlan: voicePlan1,
                availablePlans: [voicePlan1],
                requiresFlag: true,
            },
        ])(
            '$productName button visibility with scheduledToCancelAt',
            ({ productType, currentPlan, availablePlans, requiresFlag }) => {
                let productProps: ProductPlanSelectionProps

                beforeEach(() => {
                    if (requiresFlag) {
                        useFlagMock.mockReturnValue(true)
                    }

                    productProps = {
                        type: productType,
                        cadence: Cadence.Month,
                        currentPlan,
                        availablePlans,
                        selectedPlans: {
                            ...selectedPlans,
                            [productType]: {
                                plan: currentPlan,
                                isSelected: true,
                            },
                        },
                        setSelectedPlans: mockSetSelectedPlans,
                        periodEnd: 'February 14, 2024',
                        editingAvailable: true,
                        updateSubscription: mockUpdateSubscription,
                        contactBilling: mockContactBilling,
                    }
                })

                it('should disable Remove product button when scheduledToCancelAt is set', async () => {
                    const user = userEvent.setup()
                    const { getByRole, container } = render(
                        <Provider store={store}>
                            <ProductPlanSelection
                                {...productProps}
                                scheduledToCancelAt="2025-12-31T23:59:59Z"
                            />
                        </Provider>,
                    )

                    const removeButton = getByRole('button', {
                        name: 'Remove product',
                    })
                    expect(removeButton).toBeAriaDisabled()

                    await act(() => user.hover(removeButton))

                    expect(
                        container.querySelector(
                            `#remove-product-${productProps.type}`,
                        ),
                    ).toBeInTheDocument()
                    expect(
                        screen.getByText(
                            /Your product is scheduled to cancel/i,
                        ),
                    ).toBeInTheDocument()
                    expect(screen.getByText('get in touch')).toBeInTheDocument()
                })

                it('should enable Remove product button when scheduledToCancelAt is null', () => {
                    const { getByRole } = render(
                        <Provider store={store}>
                            <ProductPlanSelection
                                {...productProps}
                                scheduledToCancelAt={null}
                            />
                        </Provider>,
                    )

                    expect(
                        getByRole('button', { name: 'Remove product' }),
                    ).not.toBeAriaDisabled()
                })

                it('should enable Remove product button when scheduledToCancelAt is undefined', () => {
                    const { getByRole } = render(
                        <Provider store={store}>
                            <ProductPlanSelection {...productProps} />
                        </Provider>,
                    )

                    expect(
                        getByRole('button', { name: 'Remove product' }),
                    ).not.toBeAriaDisabled()
                })
            },
        )

        describe('Whole subscription cancellation', () => {
            it('should display active until badge when whole subscription is scheduled to cancel for Helpdesk', () => {
                const { getByText } = render(
                    <Provider store={store}>
                        <ProductPlanSelection
                            {...props}
                            scheduledToCancelAt="2025-12-31T23:59:59Z"
                        />
                    </Provider>,
                )

                expect(
                    getByText(/Active until December 31, 2025/i),
                ).toBeInTheDocument()
            })

            it('should display active until badge when whole subscription is scheduled to cancel for Convert', () => {
                const convertProps = {
                    ...props,
                    type: ProductType.Convert,
                    currentPlan: convertPlan1,
                    availablePlans: [convertPlan1],
                    selectedPlans: {
                        ...selectedPlans,
                        convert: {
                            plan: convertPlan1,
                            isSelected: true,
                        },
                    },
                }

                const { getByText } = render(
                    <Provider store={store}>
                        <ProductPlanSelection
                            {...convertProps}
                            scheduledToCancelAt="2025-11-30T23:59:59Z"
                        />
                    </Provider>,
                )

                expect(
                    getByText(/Active until November 30, 2025/i),
                ).toBeInTheDocument()
            })

            it('should not display active until badge when no cancellation is scheduled', () => {
                const { queryByText } = render(
                    <Provider store={store}>
                        <ProductPlanSelection
                            {...props}
                            scheduledToCancelAt={null}
                        />
                    </Provider>,
                )

                expect(queryByText(/Active until/i)).not.toBeInTheDocument()
            })

            it('should disable Remove product button when whole subscription is cancelled', async () => {
                const user = userEvent.setup()
                const automationProps = {
                    ...props,
                    type: ProductType.Automation,
                    currentPlan: basicMonthlyAutomationPlan,
                    availablePlans: [basicMonthlyAutomationPlan],
                    selectedPlans: {
                        ...selectedPlans,
                        automation: {
                            plan: basicMonthlyAutomationPlan,
                            isSelected: true,
                        },
                    },
                }

                const { getByRole, container } = render(
                    <Provider store={store}>
                        <ProductPlanSelection
                            {...automationProps}
                            scheduledToCancelAt="2025-12-31T23:59:59Z"
                        />
                    </Provider>,
                )

                const removeButton = getByRole('button', {
                    name: 'Remove product',
                })
                expect(removeButton).toBeAriaDisabled()

                await act(() => user.hover(removeButton))

                expect(
                    screen.getByText(/Your product is scheduled to cancel/i),
                ).toBeInTheDocument()
                expect(screen.getByText('get in touch')).toBeInTheDocument()

                const selectWrapper = container.querySelector(
                    `#priceSelect_${ProductType.Automation}_wrapper`,
                )
                expect(selectWrapper).toBeInTheDocument()

                await act(() => user.hover(selectWrapper!))

                expect(
                    screen.getAllByText(/Your product is scheduled to cancel/i)
                        .length,
                ).toBeGreaterThanOrEqual(1)
            })
        })
    })

    describe('BillingUsageAndPlansCancelAutoRenewalClicked tracking', () => {
        it('should track event when Cancel auto-renewal button is clicked for Helpdesk', async () => {
            useAutomatedHelpdeskCancellationFlowAvailableMock.mockReturnValue(
                true,
            )

            render(
                <Provider store={store}>
                    <ProductPlanSelection {...props} />
                </Provider>,
            )

            logEventMock.mockClear()

            const cancelButton = screen.getByRole('button', {
                name: /Cancel auto-renewal/i,
            })
            await act(() => userEvent.click(cancelButton))

            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.BillingUsageAndPlansCancelAutoRenewalClicked,
            )
        })
    })

    describe('BillingUsageAndPlansRemoveProductClicked tracking', () => {
        it('should track event when Remove product button is clicked for Automation', async () => {
            const automationProps = {
                ...props,
                type: ProductType.Automation,
                currentPlan: basicMonthlyAutomationPlan,
                availablePlans: [basicMonthlyAutomationPlan],
                selectedPlans: {
                    ...selectedPlans,
                    automation: {
                        plan: basicMonthlyAutomationPlan,
                        isSelected: true,
                    },
                },
            }

            render(
                <Provider store={store}>
                    <ProductPlanSelection {...automationProps} />
                </Provider>,
            )

            logEventMock.mockClear()

            const removeButton = screen.getByRole('button', {
                name: /Remove product/i,
            })
            await act(() => userEvent.click(removeButton))

            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.BillingUsageAndPlansRemoveProductClicked,
                { product: 'ai_agent' },
            )
        })

        it('should track event when Remove product button is clicked for Convert', async () => {
            const convertProps = {
                ...props,
                type: ProductType.Convert,
                currentPlan: convertPlan1,
                availablePlans: [convertPlan1],
                selectedPlans: {
                    ...selectedPlans,
                    convert: {
                        plan: convertPlan1,
                        isSelected: true,
                    },
                },
            }

            render(
                <Provider store={store}>
                    <ProductPlanSelection {...convertProps} />
                </Provider>,
            )

            logEventMock.mockClear()

            const removeButton = screen.getByRole('button', {
                name: /Remove product/i,
            })
            await act(() => userEvent.click(removeButton))

            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.BillingUsageAndPlansRemoveProductClicked,
                { product: 'convert' },
            )
        })

        it('should track event when Remove product button is clicked for SMS', async () => {
            useFlagMock.mockReturnValue(true)

            const smsProps = {
                ...props,
                type: ProductType.SMS,
                currentPlan: smsPlan1,
                availablePlans: [smsPlan1],
                selectedPlans: {
                    ...selectedPlans,
                    sms: {
                        plan: smsPlan1,
                        isSelected: true,
                    },
                },
            }

            render(
                <Provider store={store}>
                    <ProductPlanSelection {...smsProps} />
                </Provider>,
            )

            logEventMock.mockClear()

            const removeButton = screen.getByRole('button', {
                name: /Remove product/i,
            })
            await act(() => userEvent.click(removeButton))

            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.BillingUsageAndPlansRemoveProductClicked,
                { product: 'sms' },
            )
        })

        it('should track event when Remove product button is clicked for Voice', async () => {
            useFlagMock.mockReturnValue(true)

            const voiceProps = {
                ...props,
                type: ProductType.Voice,
                currentPlan: voicePlan1,
                availablePlans: [voicePlan1],
                selectedPlans: {
                    ...selectedPlans,
                    voice: {
                        plan: voicePlan1,
                        isSelected: true,
                    },
                },
            }

            render(
                <Provider store={store}>
                    <ProductPlanSelection {...voiceProps} />
                </Provider>,
            )

            logEventMock.mockClear()

            const removeButton = screen.getByRole('button', {
                name: /Remove product/i,
            })
            await act(() => userEvent.click(removeButton))

            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.BillingUsageAndPlansRemoveProductClicked,
                { product: 'voice' },
            )
        })
    })

    describe('BillingUsageAndPlansAddProductClicked tracking', () => {
        it('should track event when Add Product button is clicked for Automation', async () => {
            const automationProps = {
                ...props,
                type: ProductType.Automation,
                currentPlan: undefined,
                availablePlans: [basicMonthlyAutomationPlan],
                selectedPlans: {
                    ...selectedPlans,
                    automation: {
                        isSelected: false,
                    },
                },
            }

            render(
                <Provider store={store}>
                    <ProductPlanSelection {...automationProps} />
                </Provider>,
            )

            logEventMock.mockClear()

            const addButton = screen.getByRole('button', {
                name: /Add Product/i,
            })
            await act(() => userEvent.click(addButton))

            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.BillingUsageAndPlansAddProductClicked,
                { product: 'ai_agent' },
            )
            expect(logEventMock).toHaveBeenCalledTimes(1)
        })

        it('should track event when Add Product button is clicked for Convert', async () => {
            const convertProps = {
                ...props,
                type: ProductType.Convert,
                currentPlan: undefined,
                availablePlans: [convertPlan1],
                selectedPlans: {
                    ...selectedPlans,
                    convert: {
                        isSelected: false,
                    },
                },
            }

            render(
                <Provider store={store}>
                    <ProductPlanSelection {...convertProps} />
                </Provider>,
            )

            logEventMock.mockClear()

            const addButton = screen.getByRole('button', {
                name: /Add Product/i,
            })
            await act(() => userEvent.click(addButton))

            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.BillingUsageAndPlansAddProductClicked,
                { product: 'convert' },
            )
            expect(logEventMock).toHaveBeenCalledTimes(1)
        })

        it('should track event when Add Product button is clicked for SMS', async () => {
            const smsProps = {
                ...props,
                type: ProductType.SMS,
                currentPlan: undefined,
                availablePlans: [smsPlan1],
                selectedPlans: {
                    ...selectedPlans,
                    sms: {
                        isSelected: false,
                    },
                },
            }

            render(
                <Provider store={store}>
                    <ProductPlanSelection {...smsProps} />
                </Provider>,
            )

            logEventMock.mockClear()

            const addButton = screen.getByRole('button', {
                name: /Add Product/i,
            })
            await act(() => userEvent.click(addButton))

            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.BillingUsageAndPlansAddProductClicked,
                { product: 'sms' },
            )
            expect(logEventMock).toHaveBeenCalledTimes(1)
        })

        it('should track event when Add Product button is clicked for Voice', async () => {
            const voiceProps = {
                ...props,
                type: ProductType.Voice,
                currentPlan: undefined,
                availablePlans: [voicePlan1],
                selectedPlans: {
                    ...selectedPlans,
                    voice: {
                        isSelected: false,
                    },
                },
            }

            render(
                <Provider store={store}>
                    <ProductPlanSelection {...voiceProps} />
                </Provider>,
            )

            logEventMock.mockClear()

            const addButton = screen.getByRole('button', {
                name: /Add Product/i,
            })
            await act(() => userEvent.click(addButton))

            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.BillingUsageAndPlansAddProductClicked,
                { product: 'voice' },
            )
            expect(logEventMock).toHaveBeenCalledTimes(1)
        })
    })

    describe('BillingUsageAndPlansPlanSelected tracking', () => {
        it('should track event when a Helpdesk plan is selected from dropdown', async () => {
            render(
                <Provider store={store}>
                    <ProductPlanSelection {...props} />
                </Provider>,
            )

            logEventMock.mockClear()

            const priceSelector = screen.getByLabelText('Price value')
            await act(() => userEvent.click(priceSelector))

            const menuitems = screen.getAllByRole('menuitem')
            const starterPlanItem = menuitems.find((item) =>
                item.textContent?.includes(
                    starterHelpdeskPlan.num_quota_tickets.toString(),
                ),
            )

            await act(() => userEvent.click(starterPlanItem!))

            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.BillingUsageAndPlansPlanSelected,
                {
                    product: 'helpdesk',
                    value: starterHelpdeskPlan.num_quota_tickets,
                },
            )
            expect(logEventMock).toHaveBeenCalledTimes(1)
        })

        it('should track event when an Automation plan is selected from dropdown', async () => {
            const automationProps = {
                ...props,
                type: ProductType.Automation,
                currentPlan: basicMonthlyAutomationPlan,
                availablePlans: [basicMonthlyAutomationPlan],
                selectedPlans: {
                    ...selectedPlans,
                    automation: {
                        plan: basicMonthlyAutomationPlan,
                        isSelected: true,
                    },
                },
            }

            render(
                <Provider store={store}>
                    <ProductPlanSelection {...automationProps} />
                </Provider>,
            )

            logEventMock.mockClear()

            const priceSelector = screen.getByLabelText('Price value')
            await act(() => userEvent.click(priceSelector))

            const menuitems = screen.getAllByRole('menuitem')
            const automationPlanItem = menuitems[0]

            await act(() => userEvent.click(automationPlanItem))

            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.BillingUsageAndPlansPlanSelected,
                {
                    product: 'ai_agent',
                    value: basicMonthlyAutomationPlan.num_quota_tickets,
                },
            )
            expect(logEventMock).toHaveBeenCalledTimes(1)
        })

        it('should track event when a Convert plan is selected from dropdown', async () => {
            const convertProps = {
                ...props,
                type: ProductType.Convert,
                currentPlan: convertPlan1,
                availablePlans: [convertPlan1],
                selectedPlans: {
                    ...selectedPlans,
                    convert: {
                        plan: convertPlan1,
                        isSelected: true,
                    },
                },
            }

            render(
                <Provider store={store}>
                    <ProductPlanSelection {...convertProps} />
                </Provider>,
            )

            logEventMock.mockClear()

            const priceSelector = screen.getByLabelText('Price value')
            await act(() => userEvent.click(priceSelector))

            const menuitems = screen.getAllByRole('menuitem')
            const convertPlanItem = menuitems[0]

            await act(() => userEvent.click(convertPlanItem))

            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.BillingUsageAndPlansPlanSelected,
                {
                    product: 'convert',
                    value: convertPlan1.num_quota_tickets,
                },
            )
            expect(logEventMock).toHaveBeenCalledTimes(1)
        })

        it('should track BillingUsageAndPlansEnterprisePlanSelected event when Enterprise plan is selected', async () => {
            render(
                <Provider store={store}>
                    <ProductPlanSelection {...props} />
                </Provider>,
            )

            logEventMock.mockClear()

            const priceSelector = screen.getByLabelText('Price value')
            await act(() => userEvent.click(priceSelector))

            const menuitems = screen.getAllByRole('menuitem')
            const enterpriseItem = menuitems[menuitems.length - 1]

            await act(() => userEvent.click(enterpriseItem))

            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.BillingUsageAndPlansEnterprisePlanSelected,
                { product: 'helpdesk' },
            )
            expect(logEventMock).toHaveBeenCalledTimes(1)
        })
    })
})
