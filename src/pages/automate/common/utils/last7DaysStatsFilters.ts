import moment from 'moment'
import {StatsFilters} from 'models/stat/types'

export const last7DaysStatsFilters = (): Pick<StatsFilters, 'period'> => ({
    period: {
        // subtract 6 days, not 7, because we include today as the 7th day
        start_datetime: moment().subtract(6, 'days').startOf('day').format(),
        end_datetime: moment().endOf('day').format(),
    },
})
