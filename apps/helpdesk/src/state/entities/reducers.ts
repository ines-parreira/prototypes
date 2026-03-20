import { combineReducers } from 'redux'

import type { ContactFormState } from 'state/entities/contactForm'

import auditLogEvents from './auditLogEvents/reducer'
import type { AuditLogEventsState } from './auditLogEvents/types'
import chatsApplicationAutomationSettings from './chatsApplicationAutomationSettings/reducer'
import type { ChatsApplicationAutomationSettingsState } from './chatsApplicationAutomationSettings/types'
import contactForm from './contactForm/reducer'
import helpCenter from './helpCenter/reducer'
import type { HelpCenterState } from './helpCenter/types'
import macros from './macros/reducer'
import type { MacrosState } from './macros/types'
import newPhoneNumbers from './phoneNumbers/newReducer'
import phoneNumbers from './phoneNumbers/reducer'
import type {
    NewPhoneNumbersState,
    PhoneNumbersState,
} from './phoneNumbers/types'
import ruleRecipes from './ruleRecipes/reducer'
import type { RuleRecipesState } from './ruleRecipes/types'
import rules from './rules/reducer'
import type { RulesState } from './rules/types'
import sections from './sections/reducer'
import type { SectionsState } from './sections/types'
import selfServiceConfigurations from './selfServiceConfigurations/reducer'
import type { SelfServiceConfigurationsState } from './selfServiceConfigurations/types'
import singleSenderVerifications from './singleSenderVerification/reducer'
import type { SingleSenderVerificationsState } from './singleSenderVerification/types'
import stats from './stats/reducer'
import type { StatsState } from './stats/types'
import tags from './tags/reducer'
import type { TagsState } from './tags/types'
import views from './views/reducer'
import type { ViewsState } from './views/types'
import viewsCount from './viewsCount/reducer'
import type { ViewsCountState } from './viewsCount/types'

const entitiesReducers = combineReducers<{
    macros: MacrosState
    sections: SectionsState
    stats: StatsState
    tags: TagsState
    views: ViewsState
    viewsCount: ViewsCountState
    helpCenter: HelpCenterState
    contactForm: ContactFormState
    selfServiceConfigurations: SelfServiceConfigurationsState
    rules: RulesState
    phoneNumbers: PhoneNumbersState
    newPhoneNumbers: NewPhoneNumbersState
    singleSenderVerifications: SingleSenderVerificationsState
    ruleRecipes: RuleRecipesState
    auditLogEvents: AuditLogEventsState
    chatsApplicationAutomationSettings: ChatsApplicationAutomationSettingsState
}>({
    macros,
    rules,
    ruleRecipes,
    sections,
    stats,
    tags,
    views,
    viewsCount,
    helpCenter,
    contactForm,
    selfServiceConfigurations,
    phoneNumbers,
    newPhoneNumbers,
    singleSenderVerifications,
    auditLogEvents,
    chatsApplicationAutomationSettings,
})

export default entitiesReducers

export type EntitiesState = ReturnType<typeof entitiesReducers>
