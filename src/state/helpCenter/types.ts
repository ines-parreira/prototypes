import {HelpCenterArticlesState} from './articles'
import {HelpCenterCategoriesState} from './categories'
import {HelpCenterUiState} from './ui'

export type HelpCenterState = {
    ui: HelpCenterUiState
    articles: HelpCenterArticlesState
    categories: HelpCenterCategoriesState
}
