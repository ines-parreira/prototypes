import {HelpCenterCategoriesState} from './categories'
import {HelpCenterArticlesState} from './articles'
import {HelpCentersState} from './helpCenters'
import {HelpCentersAutomationSettingsState} from './helpCentersAutomationSettings'

export type HelpCenterState = {
    articles: HelpCenterArticlesState
    categories: HelpCenterCategoriesState
    helpCenters: HelpCentersState
    helpCentersAutomationSettings: HelpCentersAutomationSettingsState
}
