import moment from 'moment'

import { FilterKey, StatsFilters } from 'domains/reporting/models/stat/types'

export const last7DaysStatsFilters = (): Pick<
    StatsFilters,
    FilterKey.Period
> => ({
    period: {
        // subtract 6 days, not 7, because we include today as the 7th day
        start_datetime: moment().subtract(6, 'days').startOf('day').format(),
        end_datetime: moment().endOf('day').format(),
    },
})
