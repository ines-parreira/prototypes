import {combineReducers} from 'redux'

import macros from './macros/reducer'
import {MacrosState} from './macros/types'
import sections from './sections/reducer'
import {SectionsState} from './sections/types'
import views from './views/reducer'
import {ViewsState} from './views/types'
import viewsCount from './viewsCount/reducer'
import {ViewsCountState} from './viewsCount/types'

const entitiesReducers = combineReducers<{
    macros: MacrosState
    sections: SectionsState
    views: ViewsState
    viewsCount: ViewsCountState
}>({
    macros,
    sections,
    views,
    viewsCount,
})

export default entitiesReducers

export type EntitiesState = ReturnType<typeof entitiesReducers>
