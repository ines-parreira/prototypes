import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS} from 'immutable'

import reducer, {initialState} from '../reducers'
import * as types from '../constants'
import * as utils from '../utils'

describe('infobar reducers', () => {
    beforeEach(() => {
        expect.extend(immutableMatchers)
    })

    it('initial state', () => {
        expect(reducer(undefined, {type: 'FOO_TYPE'})).toEqualImmutable(
            initialState
        )
    })

    it('execute action', () => {
        const data = {
            action_name: 'shopifyRefundShippingCostOfOrder',
            integration_id: '5',
            user_id: '34',
            ticket_id: '1',
            payload: {order_id: 4194477515},
            callback: jest.fn(),
        }
        const actionId = utils.actionButtonHashForData(data)

        // start
        expect(
            reducer(initialState, {
                type: types.EXECUTE_ACTION_START,
                data,
                id: actionId,
            }).toJS()
        ).toMatchSnapshot()

        // start with callback
        expect(
            reducer(initialState, {
                type: types.EXECUTE_ACTION_START,
                callback: data.callback,
                data,
                id: actionId,
            }).toJS()
        ).toMatchSnapshot()

        // success
        expect(
            reducer(
                initialState.mergeDeep(
                    fromJS({
                        pendingActionsCallbacks: [
                            {
                                id: actionId,
                                callback: data.callback,
                            },
                        ],
                    })
                ),
                {
                    type: types.EXECUTE_ACTION_SUCCESS,
                    data,
                    id: actionId,
                }
            ).toJS()
        ).toMatchSnapshot()
        expect(data.callback).toBeCalledWith(data)

        // fail
        expect(
            reducer(
                initialState.mergeDeep(
                    fromJS({
                        pendingActionsCallbacks: [
                            {
                                id: actionId,
                                callback: data.callback,
                            },
                        ],
                    })
                ),
                {
                    type: types.EXECUTE_ACTION_ERROR,
                    data,
                    id: actionId,
                }
            ).toJS()
        ).toMatchSnapshot()
        expect(data.callback).toBeCalledWith(data)
    })
})
