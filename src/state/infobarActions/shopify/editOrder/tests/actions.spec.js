import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import MockAdapter from 'axios-mock-adapter'

import {
    shopifyCalculateEditOrderFixture,
    shopifyCalculatedEditOrderFixture,
    shopifyDraftOrderPayloadFixture,
    shopifyOrderFixture,
} from '../../../../../fixtures/shopify.ts'
import {SHOPIFY_INTEGRATION_TYPE} from '../../../../../constants/integration.ts'
import {initialState} from '../reducers.ts'
import * as actions from '../actions.ts'
import client from '../../../../../models/api/resources.ts'

jest.mock('lodash/debounce', () => (fn) => {
    fn.cancel = jest.fn()
    return fn
})

jest.mock('../../../../infobar/actions.ts')

describe('infobarActions.shopify.editOrder actions', () => {
    const middlewares = [thunk]
    const mockStore = configureMockStore(middlewares)
    const integrationId = 1
    const order = fromJS(shopifyOrderFixture())

    const mockServer = new MockAdapter(client)
    mockServer
        .onPost(
            `/integrations/${SHOPIFY_INTEGRATION_TYPE}/order/edit/calculate/`
        )
        .reply(200, {
            data: {
                orderEditSetQuantity: shopifyCalculateEditOrderFixture(),
            },
        })

    let store

    describe('onLineItemChange()', () => {
        beforeEach(() => {
            jest.useFakeTimers()
            store = mockStore({
                infobarActions: {
                    [SHOPIFY_INTEGRATION_TYPE]: {
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
                    newLineItem: order
                        .getIn(['line_items', 0])
                        .set('quantity', 6),
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
