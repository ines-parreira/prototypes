import {combineReducers} from 'redux'

import macros from './macros/reducer'
import {MacrosState} from './macros/types'

const entitiesReducers = combineReducers<{
    macros: MacrosState
}>({
    macros,
})

export default entitiesReducers

export type EntitiesState = ReturnType<typeof entitiesReducers>
