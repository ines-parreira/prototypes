import { combineReducers } from 'redux'

import { IntegrationType } from '../../models/integration/types'
import { DefaultExportReducers as shopifyReducer } from './shopify/reducers'

const DefaultExportReducers = combineReducers({
    [IntegrationType.Shopify]: shopifyReducer,
})

export { DefaultExportReducers }
