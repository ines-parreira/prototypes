import { initialState as contactFormInitialState } from 'state/entities/contactForm/reducer'
import { initialState as helpCenterInitialState } from 'state/entities/helpCenter/reducer'
import type { RootState } from 'state/types'

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
    selfServiceConfigurations: {},
    singleSenderVerifications: {},
    phoneNumbers: {},
    newPhoneNumbers: {},
    chatsApplicationAutomationSettings: {},
}
