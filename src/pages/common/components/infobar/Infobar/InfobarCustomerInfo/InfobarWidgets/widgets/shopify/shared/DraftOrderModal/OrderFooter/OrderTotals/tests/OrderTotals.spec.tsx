import React, {ComponentProps} from 'react'
import {fromJS, Map} from 'immutable'
import {screen, fireEvent, render} from '@testing-library/react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

import {
    shopifyCalculatedDraftOrderFixture,
    shopifyDraftOrderPayloadFixture,
} from 'fixtures/shopify'
import {ShopifyActionType} from '../../../../../types'
import {IntegrationContext} from '../../../../../../IntegrationContext'
import {OrderTotalsComponent} from '../OrderTotals'

describe('<OrderTotalsComponent/>', () => {
    const mockStore = configureMockStore([thunk])
    const storeData = {
        infobarActions: {
            shopify: {
                cancelOrder: {},
                createOrder: fromJS({payload: {}, loading: false}),
                refundOrder: {},
                editOrder: {},
                editShippingAddress: {},
            },
        },
    }
    const integrationContextData = {integration: fromJS({}), integrationId: 1}
    const payload = fromJS(shopifyDraftOrderPayloadFixture()) as Map<any, any>
    const calculatedDraftOrder = fromJS(
        shopifyCalculatedDraftOrderFixture()
    ) as Map<any, any>
    let onPayloadChange: jest.MockedFunction<
        ComponentProps<typeof OrderTotalsComponent>['onPayloadChange']
    >

    beforeEach(() => {
        onPayloadChange = jest.fn()
    })

    describe('render()', () => {
        it('should render', () => {
            const {container} = render(
                <Provider store={mockStore(storeData)}>
                    <IntegrationContext.Provider value={integrationContextData}>
                        <OrderTotalsComponent
                            editable
                            actionName={ShopifyActionType.DuplicateOrder}
                            currencyCode="USD"
                            loading={false}
                            payload={payload}
                            calculatedDraftOrder={calculatedDraftOrder}
                            onPayloadChange={onPayloadChange}
                        />
                    </IntegrationContext.Provider>
                </Provider>
            )

            expect(container).toMatchSnapshot()
        })

        it('should render as loading', () => {
            const {container} = render(
                <Provider store={mockStore(storeData)}>
                    <IntegrationContext.Provider value={integrationContextData}>
                        <OrderTotalsComponent
                            editable
                            actionName={ShopifyActionType.DuplicateOrder}
                            currencyCode="USD"
                            loading
                            payload={payload}
                            calculatedDraftOrder={calculatedDraftOrder}
                            onPayloadChange={onPayloadChange}
                        />
                    </IntegrationContext.Provider>
                </Provider>
            )

            expect(container.getElementsByClassName('text-muted').length).toBe(
                2
            )
        })

        it('should render with taxes included', () => {
            const taxesIncludedDraftOrder = calculatedDraftOrder.set(
                'totalPrice',
                '9.99'
            )

            const {container} = render(
                <Provider store={mockStore(storeData)}>
                    <IntegrationContext.Provider value={integrationContextData}>
                        <OrderTotalsComponent
                            editable
                            actionName={ShopifyActionType.DuplicateOrder}
                            currencyCode="USD"
                            loading
                            payload={payload}
                            calculatedDraftOrder={taxesIncludedDraftOrder}
                            onPayloadChange={onPayloadChange}
                        />
                    </IntegrationContext.Provider>
                </Provider>
            )

            expect(container).toMatchSnapshot()
        })
    })

    describe('_onDiscountCodesChange()', () => {
        it('should call onPayloadChange() with updated payload', () => {
            render(
                <Provider store={mockStore(storeData)}>
                    <IntegrationContext.Provider value={integrationContextData}>
                        <OrderTotalsComponent
                            editable
                            actionName={ShopifyActionType.DuplicateOrder}
                            currencyCode="USD"
                            loading={false}
                            payload={payload}
                            calculatedDraftOrder={calculatedDraftOrder}
                            onPayloadChange={onPayloadChange}
                        />
                    </IntegrationContext.Provider>
                </Provider>
            )

            fireEvent.click(screen.getByText('Add discount'))
            fireEvent.change(screen.getByRole('spinbutton'), {
                target: {value: 0.1},
            })
            fireEvent.click(screen.getByText('Apply'))
            const newPayload = payload.set(
                'applied_discount',
                fromJS({
                    title: '',
                    value: '0.10',
                    value_type: 'percentage',
                    amount: '0.00',
                    currency_code: 'USD',
                })
            )
            expect(onPayloadChange).toHaveBeenCalledWith(
                integrationContextData.integrationId,
                newPayload
            )
        })
    })

    describe('_onShippingLineChange()', () => {
        it('should call onPayloadChange() with updated payload', () => {
            render(
                <Provider store={mockStore(storeData)}>
                    <IntegrationContext.Provider value={integrationContextData}>
                        <OrderTotalsComponent
                            editable
                            actionName={ShopifyActionType.DuplicateOrder}
                            currencyCode="USD"
                            loading={false}
                            payload={payload}
                            calculatedDraftOrder={calculatedDraftOrder}
                            onPayloadChange={onPayloadChange}
                        />
                    </IntegrationContext.Provider>
                </Provider>
            )

            fireEvent.click(screen.getByText('Add shipping'))
            fireEvent.click(screen.getByText('Free shipping'))
            fireEvent.click(screen.getByText('Apply'))

            expect(onPayloadChange.mock.calls[0][0]).toMatchSnapshot()
            expect(
                onPayloadChange.mock.calls[0][1].get('shipping_line')
            ).toMatchSnapshot()
        })
    })

    describe('_onTaxExemptChange()', () => {
        it('should call onPayloadChange() with updated payload', () => {
            render(
                <Provider store={mockStore(storeData)}>
                    <IntegrationContext.Provider value={integrationContextData}>
                        <OrderTotalsComponent
                            editable
                            actionName={ShopifyActionType.DuplicateOrder}
                            currencyCode="USD"
                            loading={false}
                            payload={payload}
                            calculatedDraftOrder={calculatedDraftOrder}
                            onPayloadChange={onPayloadChange}
                        />
                    </IntegrationContext.Provider>
                </Provider>
            )

            fireEvent.click(screen.getByText('Taxes'))
            fireEvent.click(screen.getByText('Charge taxes'))
            fireEvent.click(screen.getByText('Apply'))

            const newPayload = payload.set('tax_exempt', true)
            expect(onPayloadChange).toHaveBeenCalledWith(
                integrationContextData.integrationId,
                newPayload
            )
        })
    })
})
