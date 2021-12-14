import thunk from 'redux-thunk'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import {fromJS, Map} from 'immutable'
import MockAdapter from 'axios-mock-adapter'

import {
    shopifyCalculateEditOrderFixture,
    shopifyCalculatedEditOrderFixture,
    shopifyDraftOrderPayloadFixture,
    shopifyOrderFixture,
} from '../../../../../fixtures/shopify'
import {initialState} from '../reducers'
import * as actions from '../actions'
import client from '../../../../../models/api/resources'
import {IntegrationType} from '../../../../../models/integration/types'
import {StoreDispatch} from '../../../../types'

jest.mock('lodash/debounce', () => (fn: Record<string, unknown>) => {
    fn.cancel = jest.fn()
    return fn
})

jest.mock('../../../../infobar/actions')

describe('infobarActions.shopify.editOrder actions', () => {
    const middlewares = [thunk]
    const mockStore = configureMockStore(middlewares)
    const integrationId = 1
    const order: Map<any, any> = fromJS(shopifyOrderFixture())

    const mockServer = new MockAdapter(client)
    mockServer
        .onPost(
            `/integrations/${IntegrationType.Shopify}/order/edit/calculate/`
        )
        .reply(200, {
            data: {
                orderEditSetQuantity: shopifyCalculateEditOrderFixture(),
            },
        })

    let store: MockStoreEnhanced<unknown, StoreDispatch>

    describe('onLineItemChange()', () => {
        beforeEach(() => {
            jest.useFakeTimers()
            store = mockStore({
                infobarActions: {
                    [IntegrationType.Shopify]: {
                        editOrder: initialState
                            .set(
                                'payload',
                                fromJS(shopifyDraftOrderPayloadFixture())
                            )
                            .set(
                                'calculatedEditOrder',
                                fromJS(shopifyCalculatedEditOrderFixture())
                            ),
                    },
                },
            })
        })
        afterEach(() => {
            jest.useRealTimers()
        })

        it('should edit the payload with the first product quantity set to 6', async () => {
            await store.dispatch(
                actions.onLineItemChange(integrationId, {
                    newLineItem: (
                        order.getIn(['line_items', 0]) as Map<any, any>
                    ).set('quantity', 6),
                    index: 0,
                })
            )
            expect(store.getActions()).toMatchSnapshot()
        })
        it('should edit the payload with the removed product line', async () => {
            await store.dispatch(
                actions.onLineItemChange(integrationId, {
                    remove: true,
                    index: 0,
                })
            )
            expect(store.getActions()).toMatchSnapshot()
        })
    })
})
