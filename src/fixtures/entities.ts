import {RootState} from 'state/types'
import {initialState as helpCenterInitialState} from 'state/entities/helpCenter/reducer'
import {initialState as chatInstallationStatusInitialState} from 'state/entities/chatInstallationStatus/reducer'
import {initialState as contactFormInitialState} from 'state/entities/contactForm/reducer'

export const entitiesInitialState: RootState['entities'] = {
    auditLogEvents: {},
    macros: {},
    rules: {},
    ruleRecipes: {},
    sections: {},
    stats: {},
    tags: {},
    views: {},
    viewsCount: {},
    helpCenter: helpCenterInitialState,
    contactForm: contactFormInitialState,
    chatInstallationStatus: chatInstallationStatusInitialState,
    selfServiceConfigurations: {},
    singleSenderVerifications: {},
    phoneNumbers: {},
    newPhoneNumbers: {},
    chatsApplicationAutomationSettings: {},
}
