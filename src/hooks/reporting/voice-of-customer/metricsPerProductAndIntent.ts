import { MetricWithDecile } from 'hooks/reporting/useMetricPerDimension'
import { OrderDirection } from 'models/api/types'
import { StatsFilters } from 'models/stat/types'

export type MetricPerProductAndIntentQueryHook = (
    statsFilters: StatsFilters,
    timezone: string,
    product: string,
    intent: string,
    sorting?: OrderDirection,
) => MetricWithDecile
