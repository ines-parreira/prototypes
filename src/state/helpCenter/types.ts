import {HelpCenterArticlesState} from './articles'
import {HelpCenterCategoriesState} from './categories'

export type HelpCenterState = {
    articles: HelpCenterArticlesState
    categories: HelpCenterCategoriesState
}
