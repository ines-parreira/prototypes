import {combineReducers} from 'redux'

import articlesReducer, {initialState as articlesInitialState} from './articles'
import categoriesReducer, {
    initialState as categoriesInitialState,
} from './categories'
import helpCentersReducer, {
    initialState as helpCentersInitialState,
} from './helpCenters'

export const initialState = {
    articles: articlesInitialState,
    categories: categoriesInitialState,
    helpCenters: helpCentersInitialState,
}

export default combineReducers({
    articles: articlesReducer,
    categories: categoriesReducer,
    helpCenters: helpCentersReducer,
})
