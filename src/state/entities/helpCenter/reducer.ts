import {combineReducers} from 'redux'

import articlesReducer, {initialState as articlesInitialState} from './articles'
import categoriesReducer, {
    initialState as categoriesInitialState,
} from './categories'
import helpCentersReducer, {
    initialState as helpCentersInitialState,
} from './helpCenters'
import helpCentersAutomationSettingsReducer, {
    initialState as helpCentersAutomationSettingsInitialState,
} from './helpCentersAutomationSettings'

export const initialState = {
    articles: articlesInitialState,
    categories: categoriesInitialState,
    helpCenters: helpCentersInitialState,
    helpCentersAutomationSettings: helpCentersAutomationSettingsInitialState,
}

export default combineReducers({
    articles: articlesReducer,
    categories: categoriesReducer,
    helpCenters: helpCentersReducer,
    helpCentersAutomationSettings: helpCentersAutomationSettingsReducer,
})
