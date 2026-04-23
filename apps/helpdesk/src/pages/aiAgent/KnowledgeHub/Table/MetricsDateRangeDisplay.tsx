import { Text } from '@gorgias/axiom'

import css from './MetricsDateRangeDisplay.less'

type MetricsDateRangeDisplayProps = {
    days: number
}

export const MetricsDateRangeDisplay = ({
    days,
}: MetricsDateRangeDisplayProps) => {
    return (
        <Text size="sm" variant="medium" className={css.dateRange}>
            Metrics from last {days} days
        </Text>
    )
}
