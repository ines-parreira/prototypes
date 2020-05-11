//@flow
import {combineReducers, type Reducer} from 'redux'

import type {StoreAction} from '../types'

import macros, {type MacrosState} from './macros'

type EntitiesState = {|
    macros: MacrosState,
|}

const entitiesReducers: Reducer<EntitiesState, StoreAction> = combineReducers({
    macros,
})

export default entitiesReducers
