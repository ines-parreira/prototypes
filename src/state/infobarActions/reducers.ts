import {combineReducers} from 'redux'

import {IntegrationType} from '../../models/integration/types'

import bigCommerceReducer from './bigcommerce/reducers'
import shopifyReducer from './shopify/reducers'

export default combineReducers({
    [IntegrationType.Shopify]: shopifyReducer,
    [IntegrationType.BigCommerce]: bigCommerceReducer,
})
