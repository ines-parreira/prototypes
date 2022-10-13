import {combineReducers} from 'redux'

import bigCommerceCreateOrderReducer from './createOrder/reducers'

export default combineReducers({
    createOrder: bigCommerceCreateOrderReducer,
})
