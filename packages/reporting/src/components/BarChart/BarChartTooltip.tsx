import { Box, Text } from '@gorgias/axiom'

import css from './BarChart.less'

type BarChartTooltipProps = {
    name: string
    value: number
    color: string
    valueFormatter?: (value: number) => string
    period?: {
        start_datetime: string
        end_datetime: string
    }
}

export const BarChartTooltip = ({
    name,
    value,
    color,
    valueFormatter,
    period,
}: BarChartTooltipProps) => {
    return (
        <Box className={css.tooltip}>
            <Text size="sm" variant="regular" className={css.tooltipPeriod}>
                {period ? period.start_datetime : ''} -{' '}
                {period ? period.end_datetime : ''}
            </Text>
            <Box alignItems="center" gap="lg">
                <Box alignItems="center" gap="xs" className={css.tooltipText}>
                    <span
                        className={css.legendDot}
                        style={{ backgroundColor: color }}
                    />
                    <Text
                        size="sm"
                        variant="regular"
                        className={css.tooltipText}
                    >
                        {name}
                    </Text>
                </Box>
                <Text size="sm" variant="regular" className={css.tooltipValue}>
                    {valueFormatter ? valueFormatter(value) : value}
                </Text>
            </Box>
        </Box>
    )
}
