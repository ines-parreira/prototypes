import {combineReducers} from 'redux'

import {IntegrationType} from '../../models/integration/types'

import shopifyReducer from './shopify/reducers'

export default combineReducers({
    [IntegrationType.ShopifyIntegrationType]: shopifyReducer,
})
