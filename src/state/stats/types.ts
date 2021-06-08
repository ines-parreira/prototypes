import {Map} from 'immutable'

import {TicketChannel} from '../../business/types/ticket'

export type StatsState = Map<any, any>

export type StatFilters = {
    period: {
        end_datetime: string
        start_datetime: string
    }
    integrations?: number[]
    tags?: number[]
    agents?: number[]
    channels?: TicketChannel[]
}
