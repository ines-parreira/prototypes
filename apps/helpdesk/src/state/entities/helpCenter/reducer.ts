import { combineReducers } from 'redux'

import {
    initialState as articlesInitialState,
    DefaultExportReducer as articlesReducer,
} from './articles'
import {
    initialState as categoriesInitialState,
    DefaultExportReducer as categoriesReducer,
} from './categories'
import {
    initialState as helpCentersInitialState,
    helpCenterReducer as helpCentersReducer,
} from './helpCenters'
import {
    initialState as helpCentersAutomationSettingsInitialState,
    helpCenterAutomationSettingsReducer as helpCentersAutomationSettingsReducer,
} from './helpCentersAutomationSettings'

export const initialState = {
    articles: articlesInitialState,
    categories: categoriesInitialState,
    helpCenters: helpCentersInitialState,
    helpCentersAutomationSettings: helpCentersAutomationSettingsInitialState,
}

const DefaultExportReducer = combineReducers({
    articles: articlesReducer,
    categories: categoriesReducer,
    helpCenters: helpCentersReducer,
    helpCentersAutomationSettings: helpCentersAutomationSettingsReducer,
})

export { DefaultExportReducer }
