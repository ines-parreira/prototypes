//@flow
import type {UserPreferences} from '../../../config/types/user'

export type OptimisticSettings = {
    'ticket-views': UserPreferences,
    'view-sections': UserPreferences,
}

export type TicketNavbarState = {
    optimisticSettings: OptimisticSettings,
}
