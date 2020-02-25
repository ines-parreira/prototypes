// @flow

import {combineReducers} from 'redux'

import shopifyDuplicateOrderReducer from './duplicateOrder/reducers'

export default combineReducers({
    duplicateOrder: shopifyDuplicateOrderReducer,
})
