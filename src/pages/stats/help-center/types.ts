import {StatsFilters} from 'models/stat/types'

export type HelpCenterStatsFilters = Omit<StatsFilters, 'helpCenters'> & {
    helpCenters: number[]
}
