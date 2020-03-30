// @flow

import {combineReducers} from 'redux'

import shopifyCancelOrderReducer from './cancelOrder/reducers'
import shopifyDuplicateOrderReducer from './duplicateOrder/reducers'
import shopifyRefundOrderReducer from './refundOrder/reducers'

export default combineReducers({
    cancelOrder: shopifyCancelOrderReducer,
    duplicateOrder: shopifyDuplicateOrderReducer,
    refundOrder: shopifyRefundOrderReducer,
})
