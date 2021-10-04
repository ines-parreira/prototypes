import {combineReducers} from 'redux'

import editor from './editor/reducer'
import {EditorState} from './editor/types'
import stats from './stats/reducer'
import {StatsState} from './stats/types'
import ticketNavbar from './ticketNavbar/reducer'
import {TicketNavbarState} from './ticketNavbar/types'
import views from './views/reducer'
import {ViewsState} from './views/types'
import {SelfServiceConfigurationsState} from './selfServiceConfigurations/types'
import selfServiceConfigurations from './selfServiceConfigurations/reducer'

const uiReducers = combineReducers<{
    editor: EditorState
    stats: StatsState
    ticketNavbar: TicketNavbarState
    views: ViewsState
    selfServiceConfigurations: SelfServiceConfigurationsState
}>({
    editor,
    stats,
    ticketNavbar,
    views,
    selfServiceConfigurations,
})

export default uiReducers

export type UIState = ReturnType<typeof uiReducers>
