import { Box, Text } from '@gorgias/axiom'

import css from './TimeSeriesChart.less'

type TimeSeriesChartTooltipProps = {
    date: string
    value: number
    valueFormatter?: (value: number) => string
}

export const TimeSeriesChartTooltip = ({
    date,
    value,
    valueFormatter,
}: TimeSeriesChartTooltipProps) => {
    return (
        <Box className={css.tooltip} flexDirection="column" gap="xxxs">
            <Text size="sm" variant="regular" className={css.tooltipText}>
                {date}
            </Text>
            <Text size="sm" variant="bold" className={css.tooltipValue}>
                {valueFormatter ? valueFormatter(value) : value}
            </Text>
        </Box>
    )
}
