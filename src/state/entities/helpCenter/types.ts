import {HelpCenterCategoriesState} from './categories'
import {HelpCenterArticlesState} from './articles'
import {HelpCentersState} from './helpCenters'

export type HelpCenterState = {
    articles: HelpCenterArticlesState
    categories: HelpCenterCategoriesState
    helpCenters: HelpCentersState
}
