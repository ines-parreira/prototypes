import { reducer as notificationsReducer } from 'reapop'
import { combineReducers } from 'redux'

import { statsSlice } from 'domains/reporting/state/stats/statsSlice'

import { reducer as agentsReducer } from './agents/reducers'
import { reducer as authsReducer } from './auths/reducers'
import { reducer as billingReducer } from './billing/reducers'
import { reducer as chatsReducer } from './chats/reducers'
import { reducer as currentAccountReducer } from './currentAccount/reducers'
import { DefaultExportCurrentCompanySlice as currentCompanyReducer } from './currentCompany/reducers'
import { reducer as currentUserReducer } from './currentUser/reducers'
import { reducer as customersReducer } from './customers/reducers'
import { entitiesReducers as entities } from './entities/reducers'
import { reducer as facebookAdsReducer } from './facebookAds/reducers'
import { reducer as infobarReducer } from './infobar/reducers'
import { DefaultExportReducers as infobarActionsReducer } from './infobarActions/reducers'
import { reducer as integrationsReducer } from './integrations/reducers'
import { reducer as layoutReducer } from './layout/reducers'
import { reducer as macrosReducer } from './macro/reducer'
import { reducer as newMessageReducer } from './newMessage/reducers'
import { reducer as queriesReducer } from './queries/reducers'
import { reducer as schemasReducer } from './schemas/reducers'
import { reducer as tagsReducer } from './tags/reducers'
import { reducer as teamReducer } from './teams/reducers'
import { reducer as ticketReducer } from './ticket/reducers'
import { reducer as ticketsReducer } from './tickets/reducers'
import type { StoreState } from './types'
import { uiReducers as ui } from './ui/reducers'
import { reducer as viewsReducer } from './views/reducers'
import { reducer as widgetsReducer } from './widgets/reducers'

const rootReducer = combineReducers<StoreState>({
    agents: agentsReducer,
    auths: authsReducer,
    billing: billingReducer,
    chats: chatsReducer,
    currentAccount: currentAccountReducer,
    currentCompany: currentCompanyReducer,
    currentUser: currentUserReducer,
    customers: customersReducer,
    entities,
    facebookAds: facebookAdsReducer,
    infobar: infobarReducer,
    infobarActions: infobarActionsReducer,
    integrations: integrationsReducer,
    layout: layoutReducer,
    macros: macrosReducer,
    newMessage: newMessageReducer,
    // @ts-ignore
    notifications: notificationsReducer(),
    schemas: schemasReducer,
    [statsSlice.name]: statsSlice.reducer,
    tags: tagsReducer,
    teams: teamReducer,
    ticket: ticketReducer,
    tickets: ticketsReducer,
    ui,
    views: viewsReducer,
    widgets: widgetsReducer,
    queries: queriesReducer,
})

export { rootReducer }
