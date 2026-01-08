import { Text } from '@gorgias/axiom'

import css from './MetricsDateRangeDisplay.less'

type MetricsDateRangeDisplayProps = {
    dateRange: {
        start_datetime: string
        end_datetime: string
    }
}

export const MetricsDateRangeDisplay = ({
    dateRange,
}: MetricsDateRangeDisplayProps) => {
    const formatMetricsDateRange = (dateRange: {
        start_datetime: string
        end_datetime: string
    }) => {
        const start = new Date(dateRange.start_datetime)
        const end = new Date(dateRange.end_datetime)
        const daysDiff = Math.round(
            (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
        )
        return `last ${daysDiff} days`
    }

    return (
        <Text size="sm" variant="medium" className={css.dateRange}>
            Metrics from {formatMetricsDateRange(dateRange)}
        </Text>
    )
}
