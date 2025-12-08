import { Box, Text } from '@gorgias/axiom'

import css from '../DonutChart.less'

type DonutChartTooltipProps = {
    name: string
    value: number
    color: string
}

export const DonutChartTooltip = ({
    name,
    value,
    color,
}: DonutChartTooltipProps) => {
    return (
        <Box className={css.tooltip}>
            <Box alignItems="center" gap="xs" className={css.tooltipContent}>
                <Box alignItems="center" gap="xs" className={css.legendLabel}>
                    <span
                        className={css.legendDot}
                        style={{ backgroundColor: color }}
                    />
                    <Text
                        size="sm"
                        variant="regular"
                        className={css.legendText}
                    >
                        {name}
                    </Text>
                </Box>
                <Text size="sm" variant="regular" className={css.legendValue}>
                    {value}
                </Text>
            </Box>
        </Box>
    )
}
