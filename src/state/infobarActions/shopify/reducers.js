// @flow

import {combineReducers} from 'redux'

import shopifyCancelOrderReducer from './cancelOrder/reducers'
import shopifyDuplicateOrderReducer from './duplicateOrder/reducers'

export default combineReducers({
    cancelOrder: shopifyCancelOrderReducer,
    duplicateOrder: shopifyDuplicateOrderReducer,
})
