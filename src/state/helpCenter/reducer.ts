import {combineReducers} from 'redux'

import articlesReducer from './articles'
import categoriesReducer from './categories'

export default combineReducers({
    articles: articlesReducer,
    categories: categoriesReducer,
})
