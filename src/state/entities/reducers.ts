import {combineReducers} from 'redux'

import macros from './macros/reducer'
import {MacrosState} from './macros/types'
import sections from './sections/reducer'
import {SectionsState} from './sections/types'
import views from './views/reducer'
import {ViewsState} from './views/types'
import viewsCount from './viewsCount/reducer'
import {ViewsCountState} from './viewsCount/types'
import tags from './tags/reducer'
import {TagsState} from './tags/types'

const entitiesReducers = combineReducers<{
    macros: MacrosState
    sections: SectionsState
    tags: TagsState
    views: ViewsState
    viewsCount: ViewsCountState
}>({
    macros,
    sections,
    tags,
    views,
    viewsCount,
})

export default entitiesReducers

export type EntitiesState = ReturnType<typeof entitiesReducers>
