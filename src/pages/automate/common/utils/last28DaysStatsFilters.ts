import moment from 'moment'
import {FilterKey, StatsFilters} from 'models/stat/types'

export const last28DaysStatsFilters = (): Pick<
    StatsFilters,
    FilterKey.Period
> => ({
    period: {
        // subtract 27 days, not 28, because we include today as the 28th day
        start_datetime: moment().subtract(27, 'days').startOf('day').format(),
        end_datetime: moment().endOf('day').format(),
    },
})
