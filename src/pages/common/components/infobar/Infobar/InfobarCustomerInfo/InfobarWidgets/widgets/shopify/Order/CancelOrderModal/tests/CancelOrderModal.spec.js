// @flow

import React from 'react'
import {shallow} from 'enzyme'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import {Form} from 'reactstrap'

import {getCancelOrderState} from '../../../../../../../../../../../../state/infobarActions/shopify/cancelOrder/selectors.ts'
import {getIntegrationsByTypes} from '../../../../../../../../../../../../state/integrations/selectors.ts'
import {integrationsStateWithShopify} from '../../../../../../../../../../../../fixtures/integrations'
import {
    cancelOrderStateFixture,
    infobarActionsStateFixture,
} from '../../../../../../../../../../../../fixtures/infobarActions'
import {SHOPIFY_INTEGRATION_TYPE} from '../../../../../../../../../../../../constants/integration.ts'
import {
    shopifyLineItemFixture,
    shopifyOrderFixture,
    shopifyRefundOrderPayloadFixture,
    shopifySuggestedRefundFixture,
} from '../../../../../../../../../../../../fixtures/shopify'
import CancelOrderModal, {CancelOrderModalComponent} from '../CancelOrderModal'
import {ShopifyAction} from '../../../constants'
import {
    getFinalCancelOrderPayload,
    initRefundOrderLineItems,
    initCancelOrderPayload,
} from '../../../../../../../../../../../../business/shopify/order.ts'

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

describe('<CancelOrderModal/>', () => {
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
                <CancelOrderModal
                    store={store}
                    header="Cancel order"
                    isOpen={false}
                    data={{
                        actionName: ShopifyAction.CANCEL_ORDER,
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
                <CancelOrderModal
                    store={store}
                    header="Cancel order"
                    isOpen
                    data={{
                        actionName: ShopifyAction.CANCEL_ORDER,
                        order: fromJS(shopifyOrderFixture()),
                    }}
                    {...actions}
                />
            )

            expect(component).toMatchSnapshot()
        })
    })
})

describe('<CancelOrderModalComponent/>', () => {
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
                <CancelOrderModalComponent
                    integrations={getIntegrationsByTypes([
                        SHOPIFY_INTEGRATION_TYPE,
                    ])(state)}
                    loading={getCancelOrderState(state).get('loading')}
                    loadingMessage={getCancelOrderState(state).get(
                        'loadingMessage'
                    )}
                    payload={getCancelOrderState(state).get('payload')}
                    lineItems={getCancelOrderState(state).get('lineItems')}
                    refund={getCancelOrderState(state).get('refund')}
                    header="Cancel order"
                    isOpen={false}
                    data={{
                        actionName: ShopifyAction.CANCEL_ORDER,
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
                <CancelOrderModalComponent
                    integrations={getIntegrationsByTypes([
                        SHOPIFY_INTEGRATION_TYPE,
                    ])(state)}
                    loading={getCancelOrderState(state).get('loading')}
                    loadingMessage={getCancelOrderState(state).get(
                        'loadingMessage'
                    )}
                    payload={getCancelOrderState(state).get('payload')}
                    lineItems={getCancelOrderState(state).get('lineItems')}
                    refund={getCancelOrderState(state).get('refund')}
                    header="Cancel order"
                    isOpen
                    data={{
                        actionName: ShopifyAction.CANCEL_ORDER,
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
            const payload = initCancelOrderPayload(order)
            const lineItems = initRefundOrderLineItems(order)
            const cancelOrderState = cancelOrderStateFixture({
                payload,
                lineItems,
            })

            const store = mockStore({
                integrations: integrationsStateWithShopify,
                infobarActions: infobarActionsStateFixture({cancelOrderState}),
            })

            const state = store.getState()

            const component = shallow(
                <CancelOrderModalComponent
                    integrations={getIntegrationsByTypes([
                        SHOPIFY_INTEGRATION_TYPE,
                    ])(state)}
                    loading={getCancelOrderState(state).get('loading')}
                    loadingMessage={getCancelOrderState(state).get(
                        'loadingMessage'
                    )}
                    payload={getCancelOrderState(state).get('payload')}
                    lineItems={getCancelOrderState(state).get('lineItems')}
                    refund={getCancelOrderState(state).get('refund')}
                    header="Cancel order"
                    isOpen
                    data={{
                        actionName: ShopifyAction.CANCEL_ORDER,
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
            payload = initCancelOrderPayload(order)
            refund = fromJS(shopifySuggestedRefundFixture())

            const lineItems = initRefundOrderLineItems(order)
            const cancelOrderState = cancelOrderStateFixture({
                payload,
                lineItems,
                refund,
            })

            const store = mockStore({
                integrations: integrationsStateWithShopify,
                infobarActions: infobarActionsStateFixture({cancelOrderState}),
            })

            const state = store.getState()

            component = shallow(
                <CancelOrderModalComponent
                    integrations={getIntegrationsByTypes([
                        SHOPIFY_INTEGRATION_TYPE,
                    ])(state)}
                    loading={getCancelOrderState(state).get('loading')}
                    loadingMessage={getCancelOrderState(state).get(
                        'loadingMessage'
                    )}
                    payload={getCancelOrderState(state).get('payload')}
                    lineItems={getCancelOrderState(state).get('lineItems')}
                    refund={getCancelOrderState(state).get('refund')}
                    header="Cancel order"
                    isOpen
                    data={{
                        actionName: ShopifyAction.CANCEL_ORDER,
                        order,
                    }}
                    {...actions}
                />,
                {context}
            )
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

        describe('_onRefundPayloadChange()', () => {
            it('should call onPayloadChange()', () => {
                const refundPayload = fromJS(
                    shopifyRefundOrderPayloadFixture()
                ).setIn(['transactions', 0, 'amount'], '9.99')

                component.instance()._onRefundPayloadChange(refundPayload)

                const newPayload = payload.set('refund', refundPayload)
                expect(actions.onPayloadChange).toHaveBeenCalledWith(
                    context.integrationId,
                    newPayload
                )
            })
        })

        describe('_setRefundPayload()', () => {
            it('should call setPayload()', () => {
                const refundPayload = fromJS(
                    shopifyRefundOrderPayloadFixture()
                ).setIn(['transactions', 0, 'amount'], '9.99')

                component.instance()._setRefundPayload(refundPayload)

                const newPayload = payload.set('refund', refundPayload)
                expect(actions.setPayload).toHaveBeenCalledWith(newPayload)
            })
        })

        describe('_onReasonChange()', () => {
            it('should call setPayload()', () => {
                const event = ({target: {value: 'fraud'}}: any)
                component.instance()._onReasonChange(event)

                const newPayload = payload
                    .set('reason', 'fraud')
                    .set('email', false)

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

                const finalPayload = getFinalCancelOrderPayload(
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
