import {combineReducers} from 'redux'

import articlesReducer from './articles'
import categoriesReducer from './categories'
import uiReducer from './ui'

export default combineReducers({
    ui: uiReducer,
    articles: articlesReducer,
    categories: categoriesReducer,
})
