import {combineReducers} from 'redux'

import ticketNavbar from './ticketNavbar/reducer'
import {TicketNavbarState} from './ticketNavbar/types'
import views from './views/reducer'
import {ViewsState} from './views/types'

const uiReducers = combineReducers<{
    ticketNavbar: TicketNavbarState
    views: ViewsState
}>({
    ticketNavbar,
    views,
})

export default uiReducers

export type UIState = ReturnType<typeof uiReducers>
