//@flow
import type {MacrosState} from './macros/types'
import type {StatsState} from './stats/types'

export type EntitiesState = {
    macros: MacrosState,
    stats: StatsState,
}
