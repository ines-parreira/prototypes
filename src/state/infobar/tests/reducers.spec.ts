import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS} from 'immutable'

import reducer, {initialState} from '../reducers'
import * as types from '../constants'
import * as utils from '../utils'

jest.addMatchers(immutableMatchers)

describe('infobar reducers', () => {
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
            ticket_id: 1,
            payload: {order_id: 4194477515},
            callback: jest.fn(),
        }
        const actionId = utils.actionButtonHashForData(data)

        // start
        expect(
            reducer(initialState, {
                type: types.EXECUTE_ACTION_START,
            }).toJS()
        ).toMatchSnapshot()

        // start with callback
        expect(
            reducer(initialState, {
                type: types.EXECUTE_ACTION_START,
                callback: data.callback,
                data,
            }).toJS()
        ).toMatchSnapshot()

        // success
        jest.clearAllMocks()
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
                }
            ).toJS()
        ).toMatchSnapshot()
        expect(data.callback).toBeCalledWith(data)

        // fail
        jest.clearAllMocks()
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
                }
            ).toJS()
        ).toMatchSnapshot()
        expect(data.callback).toBeCalledWith(data)
    })
})
