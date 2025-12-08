import { Box, Text } from '@gorgias/axiom'

import css from '../../BarChart/BarChart.less'

type BarChartTooltipProps = {
    name: string
    value: number
    color: string
}

export const BarChartTooltip = ({
    name,
    value,
    color,
}: BarChartTooltipProps) => {
    return (
        <Box className={css.tooltip}>
            <Box className={css.tooltipContent}>
                <span
                    style={{
                        width: 10,
                        height: 10,
                        borderRadius: 2,
                        backgroundColor: color,
                        flexShrink: 0,
                    }}
                />
                <Text size="sm" variant="regular">
                    {name}
                </Text>
                <Text size="sm" variant="bold">
                    {value.toLocaleString()}
                </Text>
            </Box>
        </Box>
    )
}
