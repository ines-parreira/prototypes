import {combineReducers} from 'redux'

import articlesReducer, {initialState as articlesInitialState} from './articles'
import categoriesReducer, {
    initialState as categoriesInitialState,
} from './categories'
import uiReducer, {initialState as uiInitialState} from './ui'

export const initialState = {
    ui: uiInitialState,
    articles: articlesInitialState,
    categories: categoriesInitialState,
}

export default combineReducers({
    ui: uiReducer,
    articles: articlesReducer,
    categories: categoriesReducer,
})
