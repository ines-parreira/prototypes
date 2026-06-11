import { combineReducers } from 'redux'

import type { ContactFormState } from 'state/entities/contactForm'

import { auditLogEventsReducer as auditLogEvents } from './auditLogEvents/reducer'
import type { AuditLogEventsState } from './auditLogEvents/types'
import { chatsApplicationAutomationSettingsReducer as chatsApplicationAutomationSettings } from './chatsApplicationAutomationSettings/reducer'
import type { ChatsApplicationAutomationSettingsState } from './chatsApplicationAutomationSettings/types'
import { DefaultExportReducer as contactForm } from './contactForm/reducer'
import { DefaultExportReducer as helpCenter } from './helpCenter/reducer'
import type { HelpCenterState } from './helpCenter/types'
import { macrosReducer as macros } from './macros/reducer'
import type { MacrosState } from './macros/types'
import { newPhoneNumbersReducer as newPhoneNumbers } from './phoneNumbers/newReducer'
import { phoneNumbersReducer as phoneNumbers } from './phoneNumbers/reducer'
import type {
    NewPhoneNumbersState,
    PhoneNumbersState,
} from './phoneNumbers/types'
import { ruleRecipesReducer as ruleRecipes } from './ruleRecipes/reducer'
import type { RuleRecipesState } from './ruleRecipes/types'
import { rulesReducer as rules } from './rules/reducer'
import type { RulesState } from './rules/types'
import { sectionsReducer as sections } from './sections/reducer'
import type { SectionsState } from './sections/types'
import { selfServiceConfigurationsReducer as selfServiceConfigurations } from './selfServiceConfigurations/reducer'
import type { SelfServiceConfigurationsState } from './selfServiceConfigurations/types'
import { singleSenderReducer as singleSenderVerifications } from './singleSenderVerification/reducer'
import type { SingleSenderVerificationsState } from './singleSenderVerification/types'
import { sectionsReducer as stats } from './stats/reducer'
import type { StatsState } from './stats/types'
import { tagsReducer as tags } from './tags/reducer'
import type { TagsState } from './tags/types'
import { viewsReducer as views } from './views/reducer'
import type { ViewsState } from './views/types'

const entitiesReducers = combineReducers<{
    macros: MacrosState
    sections: SectionsState
    stats: StatsState
    tags: TagsState
    views: ViewsState
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
    helpCenter,
    contactForm,
    selfServiceConfigurations,
    phoneNumbers,
    newPhoneNumbers,
    singleSenderVerifications,
    auditLogEvents,
    chatsApplicationAutomationSettings,
})

export { entitiesReducers }

export type EntitiesState = ReturnType<typeof entitiesReducers>
