// @flow

import {combineReducers} from 'redux'

import {SHOPIFY_INTEGRATION_TYPE} from '../../constants/integration'

import shopifyReducer from './shopify/reducers'

export default combineReducers({
    [SHOPIFY_INTEGRATION_TYPE]: shopifyReducer,
})
