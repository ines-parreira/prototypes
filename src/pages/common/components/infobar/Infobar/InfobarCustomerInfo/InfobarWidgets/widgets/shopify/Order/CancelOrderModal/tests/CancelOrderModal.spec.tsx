import React, {ComponentProps} from 'react'
import {shallow, ShallowWrapper} from 'enzyme'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {fromJS, Map} from 'immutable'
import {Form} from 'reactstrap'

import {IntegrationType} from '../../../../../../../../../../../../models/integration/types'
import {getCancelOrderState} from '../../../../../../../../../../../../state/infobarActions/shopify/cancelOrder/selectors'
import {getIntegrationsByTypes} from '../../../../../../../../../../../../state/integrations/selectors'
import {integrationsStateWithShopify} from '../../../../../../../../../../../../fixtures/integrations'
import {
    cancelOrderStateFixture,
    infobarActionsStateFixture,
} from '../../../../../../../../../../../../fixtures/infobarActions'
import {
    shopifyLineItemFixture,
    shopifyOrderFixture,
    shopifyRefundOrderPayloadFixture,
    shopifySuggestedRefundFixture,
} from '../../../../../../../../../../../../fixtures/shopify'
import CancelOrderModal, {CancelOrderModalComponent} from '../CancelOrderModal'
import {ShopifyAction} from '../../../constants.js'
import {
    getFinalCancelOrderPayload,
    initRefundOrderLineItems,
    initCancelOrderPayload,
} from '../../../../../../../../../../../../business/shopify/order'

function initActions() {
    return {
        onBulkChange: jest.fn(),
        onCancel: jest.fn(),
        onChange: jest
            .fn()
            .mockImplementation(
                (
                    name: string,
                    value: string | number | boolean | Record<string, unknown>,
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
    let actions: ReturnType<typeof initActions>

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
                    {...({store} as any)}
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
                    {...({store} as any)}
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
    let actions: ReturnType<typeof initActions>

    beforeEach(() => {
        actions = initActions()
    })

    describe('render()', () => {
        it('should render as closed', () => {
            const store = mockStore({
                integrations: integrationsStateWithShopify,
                infobarActions: infobarActionsStateFixture(),
            })

            const state: any = store.getState()

            const component = shallow(
                <CancelOrderModalComponent
                    integrations={getIntegrationsByTypes([
                        IntegrationType.ShopifyIntegrationType,
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

            const state: any = store.getState()

            const component = shallow(
                <CancelOrderModalComponent
                    integrations={getIntegrationsByTypes([
                        IntegrationType.ShopifyIntegrationType,
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
                payload: payload as any,
                lineItems: lineItems as any,
            })

            const store = mockStore({
                integrations: integrationsStateWithShopify,
                infobarActions: infobarActionsStateFixture({cancelOrderState}),
            })

            const state: any = store.getState()

            const component = shallow(
                <CancelOrderModalComponent
                    integrations={getIntegrationsByTypes([
                        IntegrationType.ShopifyIntegrationType,
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
        let payload: Map<any, any>
        let refund: Map<any, any>
        let component: ShallowWrapper<
            ComponentProps<typeof CancelOrderModalComponent>,
            any,
            CancelOrderModalComponent
        >

        beforeEach(() => {
            order = fromJS(shopifyOrderFixture())
            payload = initCancelOrderPayload(order) as any
            refund = fromJS(shopifySuggestedRefundFixture())

            const lineItems = initRefundOrderLineItems(order)
            const cancelOrderState = cancelOrderStateFixture({
                payload: payload as any,
                lineItems: lineItems as any,
                refund: refund as any,
            })

            const store = mockStore({
                integrations: integrationsStateWithShopify,
                infobarActions: infobarActionsStateFixture({cancelOrderState}),
            })

            const state: any = store.getState()

            component = shallow(
                <CancelOrderModalComponent
                    integrations={getIntegrationsByTypes([
                        IntegrationType.ShopifyIntegrationType,
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
            ) as any
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
                const refundPayload = (fromJS(
                    shopifyRefundOrderPayloadFixture()
                ) as Map<any, any>).setIn(['transactions', 0, 'amount'], '9.99')

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
                const refundPayload = (fromJS(
                    shopifyRefundOrderPayloadFixture()
                ) as Map<any, any>).setIn(['transactions', 0, 'amount'], '9.99')

                component.instance()._setRefundPayload(refundPayload)

                const newPayload = payload.set('refund', refundPayload)
                expect(actions.setPayload).toHaveBeenCalledWith(newPayload)
            })
        })

        describe('_onReasonChange()', () => {
            it('should call setPayload()', () => {
                const event = {target: {value: 'fraud'}} as any
                component.instance()._onReasonChange(event)

                const newPayload = payload
                    .set('reason', 'fraud')
                    .set('email', false)

                expect(actions.setPayload).toHaveBeenCalledWith(newPayload)
            })
        })

        describe('_onNotifyChange()', () => {
            it('should call setPayload()', () => {
                const event = {target: {checked: false}} as any
                component.instance()._onNotifyChange(event)

                const newPayload = payload.set('email', false)
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
                        preventDefault: () => undefined,
                    })

                const finalPayload = getFinalCancelOrderPayload(
                    payload as any,
                    refund as any
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
