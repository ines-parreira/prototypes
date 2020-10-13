// @flow

import React from 'react'
import {shallow} from 'enzyme'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import {Form} from 'reactstrap'

import {getRefundOrderState} from '../../../../../../../../../../../../state/infobarActions/shopify/refundOrder/selectors.ts'
import {
    infobarActionsStateFixture,
    refundOrderStateFixture,
} from '../../../../../../../../../../../../fixtures/infobarActions.ts'
import {
    shopifyLineItemFixture,
    shopifyOrderFixture,
    shopifyRefundOrderPayloadFixture,
    shopifySuggestedRefundFixture,
} from '../../../../../../../../../../../../fixtures/shopify.ts'
import {
    getFinalRefundOrderPayload,
    initRefundOrderLineItems,
    initRefundOrderPayload,
} from '../../../../../../../../../../../../business/shopify/order.ts'
import {getIntegrationsByTypes} from '../../../../../../../../../../../../state/integrations/selectors.ts'
import {integrationsStateWithShopify} from '../../../../../../../../../../../../fixtures/integrations.ts'
import {SHOPIFY_INTEGRATION_TYPE} from '../../../../../../../../../../../../constants/integration.ts'
import RefundOrderModal, {RefundOrderModalComponent} from '../RefundOrderModal'
import {ShopifyAction} from '../../../constants'

function initActions() {
    return {
        onBulkChange: jest.fn(),
        onCancel: jest.fn(),
        onChange: jest
            .fn()
            .mockImplementation(
                (
                    name: string,
                    value: string | number | boolean | Object,
                    callback?: () => void
                ) => {
                    if (callback) {
                        callback()
                    }
                }
            ),
        onClose: jest.fn(),
        onInit: jest.fn(),
        onLineItemsChange: jest.fn(),
        onOpen: jest.fn(),
        onPayloadChange: jest.fn(),
        onReset: jest.fn(),
        onSubmit: jest.fn(),
        setPayload: jest.fn(),
    }
}

describe('<RefundOrderModal/>', () => {
    const middlewares = [thunk]
    const mockStore = configureMockStore(middlewares)
    let actions

    beforeEach(() => {
        actions = initActions()
    })

    describe('render()', () => {
        it('should render as closed', () => {
            const store = mockStore({
                integrations: integrationsStateWithShopify,
                infobarActions: infobarActionsStateFixture(),
            })

            const component = shallow(
                <RefundOrderModal
                    store={store}
                    header="Refund order"
                    isOpen={false}
                    data={{
                        actionName: ShopifyAction.REFUND_ORDER,
                        order: fromJS(shopifyOrderFixture()),
                    }}
                    {...actions}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render as open', () => {
            const store = mockStore({
                integrations: integrationsStateWithShopify,
                infobarActions: infobarActionsStateFixture(),
            })

            const component = shallow(
                <RefundOrderModal
                    store={store}
                    header="Refund order"
                    isOpen
                    data={{
                        actionName: ShopifyAction.REFUND_ORDER,
                        order: fromJS(shopifyOrderFixture()),
                    }}
                    {...actions}
                />
            )

            expect(component).toMatchSnapshot()
        })
    })
})

describe('<RefundOrderModalComponent/>', () => {
    const middlewares = [thunk]
    const mockStore = configureMockStore(middlewares)
    const context = {integrationId: 1}
    let actions

    beforeEach(() => {
        actions = initActions()
    })

    describe('render()', () => {
        it('should render as closed', () => {
            const store = mockStore({
                integrations: integrationsStateWithShopify,
                infobarActions: infobarActionsStateFixture(),
            })

            const state = store.getState()

            const component = shallow(
                <RefundOrderModalComponent
                    integrations={getIntegrationsByTypes([
                        SHOPIFY_INTEGRATION_TYPE,
                    ])(state)}
                    loading={getRefundOrderState(state).get('loading')}
                    loadingMessage={getRefundOrderState(state).get(
                        'loadingMessage'
                    )}
                    payload={getRefundOrderState(state).get('payload')}
                    lineItems={getRefundOrderState(state).get('lineItems')}
                    refund={getRefundOrderState(state).get('refund')}
                    header="Refund order"
                    isOpen={false}
                    data={{
                        actionName: ShopifyAction.REFUND_ORDER,
                        order: fromJS(shopifyOrderFixture()),
                    }}
                    {...actions}
                />,
                {context}
            )

            expect(component).toMatchSnapshot()
        })

        it('should render as open, without order table', () => {
            const store = mockStore({
                integrations: integrationsStateWithShopify,
                infobarActions: infobarActionsStateFixture(),
            })

            const state = store.getState()

            const component = shallow(
                <RefundOrderModalComponent
                    integrations={getIntegrationsByTypes([
                        SHOPIFY_INTEGRATION_TYPE,
                    ])(state)}
                    loading={getRefundOrderState(state).get('loading')}
                    loadingMessage={getRefundOrderState(state).get(
                        'loadingMessage'
                    )}
                    payload={getRefundOrderState(state).get('payload')}
                    lineItems={getRefundOrderState(state).get('lineItems')}
                    refund={getRefundOrderState(state).get('refund')}
                    header="Refund order"
                    isOpen
                    data={{
                        actionName: ShopifyAction.REFUND_ORDER,
                        order: fromJS(shopifyOrderFixture()),
                    }}
                    {...actions}
                />,
                {context}
            )

            expect(component).toMatchSnapshot()
        })

        it('should render as open, with order table', () => {
            const order = fromJS(shopifyOrderFixture())
            const payload = initRefundOrderPayload(order)
            const lineItems = initRefundOrderLineItems(order)
            const refundOrderState = refundOrderStateFixture({
                payload,
                lineItems,
            })

            const store = mockStore({
                integrations: integrationsStateWithShopify,
                infobarActions: infobarActionsStateFixture({refundOrderState}),
            })

            const state = store.getState()

            const component = shallow(
                <RefundOrderModalComponent
                    integrations={getIntegrationsByTypes([
                        SHOPIFY_INTEGRATION_TYPE,
                    ])(state)}
                    loading={getRefundOrderState(state).get('loading')}
                    loadingMessage={getRefundOrderState(state).get(
                        'loadingMessage'
                    )}
                    payload={getRefundOrderState(state).get('payload')}
                    lineItems={getRefundOrderState(state).get('lineItems')}
                    refund={getRefundOrderState(state).get('refund')}
                    header="Refund order"
                    isOpen
                    data={{
                        actionName: ShopifyAction.REFUND_ORDER,
                        order,
                    }}
                    {...actions}
                />,
                {context}
            )

            expect(component).toMatchSnapshot()
        })
    })

    describe('actions', () => {
        let order
        let payload
        let refund
        let component

        beforeEach(() => {
            order = fromJS(shopifyOrderFixture())
            payload = initRefundOrderPayload(order)
            refund = fromJS(shopifySuggestedRefundFixture())

            const lineItems = initRefundOrderLineItems(order)
            const refundOrderState = refundOrderStateFixture({
                payload,
                lineItems,
                refund,
            })

            const store = mockStore({
                integrations: integrationsStateWithShopify,
                infobarActions: infobarActionsStateFixture({refundOrderState}),
            })

            const state = store.getState()

            component = shallow(
                <RefundOrderModalComponent
                    integrations={getIntegrationsByTypes([
                        SHOPIFY_INTEGRATION_TYPE,
                    ])(state)}
                    loading={getRefundOrderState(state).get('loading')}
                    loadingMessage={getRefundOrderState(state).get(
                        'loadingMessage'
                    )}
                    payload={getRefundOrderState(state).get('payload')}
                    lineItems={getRefundOrderState(state).get('lineItems')}
                    refund={getRefundOrderState(state).get('refund')}
                    header="Refund order"
                    isOpen
                    data={{
                        actionName: ShopifyAction.REFUND_ORDER,
                        order,
                    }}
                    {...actions}
                />,
                {context}
            )
        })

        describe('_onPayloadChange()', () => {
            it('should call onPayloadChange()', () => {
                const payload = fromJS(shopifyRefundOrderPayloadFixture())
                component.instance()._onPayloadChange(payload)

                expect(actions.onPayloadChange).toHaveBeenCalledWith(
                    context.integrationId,
                    payload
                )
            })
        })

        describe('_onLineItemsChange()', () => {
            it('should call onLineItemsChange()', () => {
                const lineItems = fromJS([shopifyLineItemFixture()])
                component.instance()._onLineItemsChange(lineItems)

                expect(actions.onLineItemsChange).toHaveBeenCalledWith(
                    context.integrationId,
                    lineItems
                )
            })
        })

        describe('_onReasonChange()', () => {
            it('should call setPayload()', () => {
                const event = ({target: {value: 'foo bar'}}: any)
                component.instance()._onReasonChange(event)

                const newPayload = payload.set('note', 'foo bar')
                expect(actions.setPayload).toHaveBeenCalledWith(newPayload)
            })
        })

        describe('_onSubmit()', () => {
            it('should call onSubmit()', () => {
                // Click on "Submit"
                component
                    .find(Form)
                    .at(0)
                    .simulate('submit', {
                        preventDefault: () => {},
                    })

                const finalPayload = getFinalRefundOrderPayload(
                    payload,
                    refund
                ).toJS()

                expect(actions.onChange).toHaveBeenCalledWith(
                    'payload',
                    finalPayload,
                    expect.any(Function)
                )
                expect(actions.onSubmit).toHaveBeenCalled()
                expect(actions.onReset).toHaveBeenCalled()
            })
        })

        describe('_onCancel()', () => {
            it('should call onCancel()', () => {
                component.instance()._onCancel('foo')

                expect(actions.onCancel).toHaveBeenCalledWith('foo')
                expect(actions.onClose).toHaveBeenCalled()
                expect(actions.onReset).toHaveBeenCalled()
            })
        })

        describe('_onCancelViaHeader()', () => {
            it('should call onCancel()', () => {
                component.instance()._onCancelViaHeader()

                expect(actions.onCancel).toHaveBeenCalledWith('header')
                expect(actions.onClose).toHaveBeenCalled()
                expect(actions.onReset).toHaveBeenCalled()
            })
        })

        describe('_onCancelViaFooter()', () => {
            it('should call onCancel()', () => {
                component.instance()._onCancelViaFooter()

                expect(actions.onCancel).toHaveBeenCalledWith('footer')
                expect(actions.onClose).toHaveBeenCalled()
                expect(actions.onReset).toHaveBeenCalled()
            })
        })
    })
})
