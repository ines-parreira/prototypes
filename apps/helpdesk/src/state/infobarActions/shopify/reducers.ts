import { combineReducers } from 'redux'

import { reducer as shopifyCancelOrderReducer } from './cancelOrder/reducers'
import { reducer as shopifyCreateOrderReducer } from './createOrder/reducers'
import { reducer as shopifyEditOrderReducer } from './editOrder/reducers'
import { reducer as shopifyEditShippingAddressReducer } from './editShippingAddress/reducers'
import { reducer as shopifyRefundOrderReducer } from './refundOrder/reducers'

const DefaultExportReducers = combineReducers({
    cancelOrder: shopifyCancelOrderReducer,
    createOrder: shopifyCreateOrderReducer,
    refundOrder: shopifyRefundOrderReducer,
    editOrder: shopifyEditOrderReducer,
    editShippingAddress: shopifyEditShippingAddressReducer,
})

export { DefaultExportReducers }
