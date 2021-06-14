import {combineReducers} from 'redux'

import stats from './stats/reducer'
import {StatsState} from './stats/types'
import ticketNavbar from './ticketNavbar/reducer'
import {TicketNavbarState} from './ticketNavbar/types'
import views from './views/reducer'
import {ViewsState} from './views/types'

const uiReducers = combineReducers<{
    stats: StatsState
    ticketNavbar: TicketNavbarState
    views: ViewsState
}>({
    stats,
    ticketNavbar,
    views,
})

export default uiReducers

export type UIState = ReturnType<typeof uiReducers>
