import MockAdapter from 'axios-mock-adapter'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'
import type { MockStoreEnhanced } from 'redux-mock-store'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    shopifyCalculatedEditOrderFixture,
    shopifyCalculateEditOrderFixture,
    shopifyDraftOrderPayloadFixture,
    shopifyOrderFixture,
} from '../../../../../fixtures/shopify'
import client from '../../../../../models/api/resources'
import { IntegrationType } from '../../../../../models/integration/types'
import type { StoreDispatch } from '../../../../types'
import * as actions from '../actions'
import { initialState } from '../reducers'

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
            `/integrations/${IntegrationType.Shopify}/order/edit/calculate/`,
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
                                fromJS(shopifyDraftOrderPayloadFixture()),
                            )
                            .set(
                                'calculatedEditOrder',
                                fromJS(shopifyCalculatedEditOrderFixture()),
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
                }),
            )
            expect(store.getActions()).toMatchSnapshot()
        })
        it('should edit the payload with the removed product line', async () => {
            await store.dispatch(
                actions.onLineItemChange(integrationId, {
                    remove: true,
                    index: 0,
                }),
            )
            expect(store.getActions()).toMatchSnapshot()
        })
    })
})
