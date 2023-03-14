import {combineReducers} from 'redux'

import {ContactFormState} from 'state/entities/contactForm'
import macros from './macros/reducer'
import {MacrosState} from './macros/types'
import sections from './sections/reducer'
import {SectionsState} from './sections/types'
import views from './views/reducer'
import {ViewsState} from './views/types'
import viewsCount from './viewsCount/reducer'
import {ViewsCountState} from './viewsCount/types'
import stats from './stats/reducer'
import {StatsState} from './stats/types'
import tags from './tags/reducer'
import {TagsState} from './tags/types'
import helpCenter from './helpCenter/reducer'
import {HelpCenterState} from './helpCenter/types'
import selfServiceConfigurations from './selfServiceConfigurations/reducer'
import {SelfServiceConfigurationsState} from './selfServiceConfigurations/types'
import rules from './rules/reducer'
import {RulesState} from './rules/types'
import phoneNumbers from './phoneNumbers/reducer'
import newPhoneNumbers from './phoneNumbers/newReducer'
import {NewPhoneNumbersState, PhoneNumbersState} from './phoneNumbers/types'
import ruleRecipes from './ruleRecipes/reducer'
import {RuleRecipesState} from './ruleRecipes/types'
import auditLogEvents from './auditLogEvents/reducer'
import {AuditLogEventsState} from './auditLogEvents/types'
import {SingleSenderVerificationsState} from './singleSenderVerification/types'
import singleSenderVerifications from './singleSenderVerification/reducer'
import {ChatInstallationStatusState} from './chatInstallationStatus/types'
import chatInstallationStatus from './chatInstallationStatus/reducer'
import chatsApplicationAutomationSettings from './chatsApplicationAutomationSettings/reducer'
import {ChatsApplicationAutomationSettingsState} from './chatsApplicationAutomationSettings/types'
import contactForm from './contactForm/reducer'

const entitiesReducers = combineReducers<{
    macros: MacrosState
    sections: SectionsState
    stats: StatsState
    tags: TagsState
    views: ViewsState
    viewsCount: ViewsCountState
    helpCenter: HelpCenterState
    contactForm: ContactFormState
    chatInstallationStatus: ChatInstallationStatusState
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
    chatInstallationStatus,
    selfServiceConfigurations,
    phoneNumbers,
    newPhoneNumbers,
    singleSenderVerifications,
    auditLogEvents,
    chatsApplicationAutomationSettings,
})

export default entitiesReducers

export type EntitiesState = ReturnType<typeof entitiesReducers>
