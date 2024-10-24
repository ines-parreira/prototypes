import {combineReducers} from 'redux'

import shopifyCancelOrderReducer from './cancelOrder/reducers'
import shopifyCreateOrderReducer from './createOrder/reducers'
import shopifyEditOrderReducer from './editOrder/reducers'
import shopifyEditShippingAddressReducer from './editShippingAddress/reducers'
import shopifyRefundOrderReducer from './refundOrder/reducers'

export default combineReducers({
    cancelOrder: shopifyCancelOrderReducer,
    createOrder: shopifyCreateOrderReducer,
    refundOrder: shopifyRefundOrderReducer,
    editOrder: shopifyEditOrderReducer,
    editShippingAddress: shopifyEditShippingAddressReducer,
})
