import { Duration } from '@gorgias/toolkit'
export enum RecentItems {
    Tickets = 'tickets',
    Customers = 'customers',
    Calls = 'calls',
}

export const DEBOUNCE_TIME = Duration.millis(300)
