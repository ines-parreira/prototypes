import {combineReducers} from 'redux'

import shopifyCancelOrderReducer from './cancelOrder/reducers'
import shopifyCreateOrderReducer from './createOrder/reducers'
import shopifyRefundOrderReducer from './refundOrder/reducers'
import shopifyEditOrderReducer from './editOrder/reducers'

export default combineReducers({
    cancelOrder: shopifyCancelOrderReducer,
    createOrder: shopifyCreateOrderReducer,
    refundOrder: shopifyRefundOrderReducer,
    editOrder: shopifyEditOrderReducer,
})
