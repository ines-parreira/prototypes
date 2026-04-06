import { Box, Text } from '@gorgias/axiom'

import type { ChartDataItemWithColor } from '../ChartCard/utils/colorUtils'

import css from './ChartLegend.less'

export const ChartLegend = ({
    seriesWithColors,
}: {
    seriesWithColors: ChartDataItemWithColor[]
}) => {
    return (
        <Box
            flexWrap="wrap"
            gap="sm"
            justifyContent="center"
            paddingBottom="xs"
            paddingTop="xs"
        >
            {seriesWithColors.map((series) => (
                <Box key={series.name} alignItems="center" gap="xxs">
                    <div
                        className={css.legendDot}
                        style={{ backgroundColor: series.color }}
                    />
                    <Text size="sm" color="content-neutral-secondary">
                        {series.name}
                    </Text>
                </Box>
            ))}
        </Box>
    )
}
