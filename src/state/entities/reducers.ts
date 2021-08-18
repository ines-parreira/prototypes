import {combineReducers} from 'redux'

import macros from './macros/reducer'
import {MacrosState} from './macros/types'
import sections from './sections/reducer'
import {SectionsState} from './sections/types'
import views from './views/reducer'
import {ViewsState} from './views/types'
import viewsCount from './viewsCount/reducer'
import {ViewsCountState} from './viewsCount/types'
import stats from './stats/reducer'
import {StatsState} from './stats/types'
import tags from './tags/reducer'
import {TagsState} from './tags/types'
import helpCenters from './helpCenters/reducer'
import {HelpCentersState} from './helpCenters/types'
import selfServiceConfigurations from './selfServiceConfigurations/reducer'
import {SelfServiceConfigurationsState} from './selfServiceConfigurations/types'
import rules from './rules/reducer'
import {RulesState} from './rules/types'

const entitiesReducers = combineReducers<{
    macros: MacrosState
    sections: SectionsState
    stats: StatsState
    tags: TagsState
    views: ViewsState
    viewsCount: ViewsCountState
    helpCenters: HelpCentersState
    selfServiceConfigurations: SelfServiceConfigurationsState
    rules: RulesState
}>({
    macros,
    rules,
    sections,
    stats,
    tags,
    views,
    viewsCount,
    helpCenters,
    selfServiceConfigurations,
})

export default entitiesReducers

export type EntitiesState = ReturnType<typeof entitiesReducers>
