// @flow

import React from 'react'
import {shallow} from 'enzyme'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'

import {
    getDuplicateOrderState
} from '../../../../../../../../../../../../state/infobarActions/shopify/duplicateOrder/selectors'
import {
    getDuplicateOrderPayload
} from '../../../../../../../../../../../../state/infobarActions/shopify/duplicateOrder/actions'
import {getIntegrationsByTypes} from '../../../../../../../../../../../../state/integrations/selectors'
import {integrationsStateWithShopify} from '../../../../../../../../../../../../fixtures/integrations'
import {
    duplicateOrderStateFixture,
    infobarActionsStateFixture
} from '../../../../../../../../../../../../fixtures/infobarActions'
import {SHOPIFY_INTEGRATION_TYPE} from '../../../../../../../../../../../../constants/integration'
import {shopifyOrderFixture} from '../../../../../../../../../../../../fixtures/shopify'
import DuplicateOrderModal, {DuplicateOrderModalComponent} from '../DuplicateOrderModal'
import {ShopifyAction} from '../../constants'
import {initDraftOrderPayload} from '../../../../../../../../../../../../business/shopify/order'

describe('<DuplicateOrderModal/>', () => {
    const middlewares = [thunk]
    const mockStore = configureMockStore(middlewares)
    let actions

    beforeEach(() => {
        const onInit = jest.fn()
        const onOpen = jest.fn()
        const addRow = jest.fn()
        const addCustomRow = jest.fn()
        const onChange = jest.fn()
        const onBulkChange = jest.fn()
        const onSubmit = jest.fn()
        const onClose = jest.fn()
        const onCancel = jest.fn()
        const onCleanUp = jest.fn()

        actions = {onInit, onOpen, addRow, addCustomRow, onChange, onBulkChange, onSubmit, onClose, onCancel, onCleanUp}
    })

    describe('render()', () => {
        it('should render as closed', () => {
            const store = mockStore({
                integrations: integrationsStateWithShopify,
                infobarActions: infobarActionsStateFixture(),
            })

            const component = shallow(
                <DuplicateOrderModal
                    store={store}
                    header="Duplicate order"
                    isOpen={false}
                    data={{
                        actionName: ShopifyAction.DUPLICATE_ORDER,
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
                <DuplicateOrderModal
                    store={store}
                    header="Duplicate order"
                    isOpen
                    data={{
                        actionName: ShopifyAction.DUPLICATE_ORDER,
                        order: fromJS(shopifyOrderFixture()),
                    }}
                    {...actions}
                />
            )

            expect(component).toMatchSnapshot()
        })
    })
})

describe('<DuplicateOrderModalComponent/>', () => {
    const middlewares = [thunk]
    const mockStore = configureMockStore(middlewares)
    const context = {integrationId: 1}
    let actions

    beforeEach(() => {
        const onInit = jest.fn()
        const onOpen = jest.fn()
        const addRow = jest.fn()
        const addCustomRow = jest.fn()
        const onChange = jest.fn()
        const onBulkChange = jest.fn()
        const onSubmit = jest.fn()
        const onClose = jest.fn()
        const onCancel = jest.fn()
        const onCleanUp = jest.fn()

        actions = {onInit, onOpen, addRow, addCustomRow, onChange, onBulkChange, onSubmit, onClose, onCancel, onCleanUp}
    })

    describe('render()', () => {
        it('should render as closed', () => {
            const store = mockStore({
                integrations: integrationsStateWithShopify,
                infobarActions: infobarActionsStateFixture(),
            })

            const state = store.getState()

            const component = shallow(
                <DuplicateOrderModalComponent
                    integrations={getIntegrationsByTypes([SHOPIFY_INTEGRATION_TYPE])(state)}
                    loading={getDuplicateOrderState(state).get('loading')}
                    payload={getDuplicateOrderState(state).get('payload')}
                    draftOrder={getDuplicateOrderState(state).get('draftOrder')}
                    products={getDuplicateOrderState(state).get('products')}
                    header="Duplicate order"
                    isOpen={false}
                    data={{
                        actionName: ShopifyAction.DUPLICATE_ORDER,
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
                <DuplicateOrderModalComponent
                    integrations={getIntegrationsByTypes([SHOPIFY_INTEGRATION_TYPE])(state)}
                    loading={getDuplicateOrderState(state).get('loading')}
                    payload={getDuplicateOrderState(state).get('payload')}
                    draftOrder={getDuplicateOrderState(state).get('draftOrder')}
                    products={getDuplicateOrderState(state).get('products')}
                    header="Duplicate order"
                    isOpen
                    data={{
                        actionName: ShopifyAction.DUPLICATE_ORDER,
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
            const draftOrder = initDraftOrderPayload(order)
            const payload = getDuplicateOrderPayload(draftOrder)
            const duplicateOrderState = duplicateOrderStateFixture({payload})

            const store = mockStore({
                integrations: integrationsStateWithShopify,
                infobarActions: infobarActionsStateFixture(duplicateOrderState),
            })

            const state = store.getState()

            const component = shallow(
                <DuplicateOrderModalComponent
                    integrations={getIntegrationsByTypes([SHOPIFY_INTEGRATION_TYPE])(state)}
                    loading={getDuplicateOrderState(state).get('loading')}
                    payload={getDuplicateOrderState(state).get('payload')}
                    draftOrder={getDuplicateOrderState(state).get('draftOrder')}
                    products={getDuplicateOrderState(state).get('products')}
                    header="Duplicate order"
                    isOpen
                    data={{
                        actionName: ShopifyAction.DUPLICATE_ORDER,
                        order,
                    }}
                    {...actions}
                />,
                {context}
            )

            expect(component).toMatchSnapshot()
        })
    })
})
