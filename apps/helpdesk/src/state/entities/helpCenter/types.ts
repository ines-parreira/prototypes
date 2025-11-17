import type { HelpCenterArticlesState } from './articles'
import type { HelpCenterCategoriesState } from './categories'
import type { HelpCentersState } from './helpCenters'
import type { HelpCentersAutomationSettingsState } from './helpCentersAutomationSettings'

export type HelpCenterState = {
    articles: HelpCenterArticlesState
    categories: HelpCenterCategoriesState
    helpCenters: HelpCentersState
    helpCentersAutomationSettings: HelpCentersAutomationSettingsState
}
