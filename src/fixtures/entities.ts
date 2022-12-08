import {RootState} from 'state/types'
import {initialState as helpCenterInitialState} from 'state/entities/helpCenter/reducer'

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
    selfServiceConfigurations: {},
    phoneNumbers: {},
}
