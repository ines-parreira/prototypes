import { Box, Button, Text } from '@gorgias/axiom'

import css from '../DonutChart.less'

type LegendItem = {
    name: string
    color: string
    percentage: string
}

type DonutChartLegendProps = {
    items: LegendItem[]
    hiddenSegments: Set<string>
    onToggleSegment: (name: string) => void
}

export const DonutChartLegend = ({
    items,
    hiddenSegments,
    onToggleSegment,
}: DonutChartLegendProps) => {
    return (
        <Box flexDirection="column" className={css.legend}>
            {items.map((item) => {
                const isHidden = hiddenSegments.has(item.name)
                return (
                    <Button
                        key={item.name}
                        size="sm"
                        variant="tertiary"
                        onClick={() => onToggleSegment(item.name)}
                    >
                        <Box
                            display="flex"
                            alignItems="center"
                            gap="xs"
                            className={css.legendLabel}
                        >
                            <span
                                className={css.legendDot}
                                style={{
                                    backgroundColor: item.color,
                                    opacity: isHidden ? 0.3 : 1,
                                }}
                            />
                            <span
                                style={{
                                    opacity: isHidden ? 0.5 : 1,
                                }}
                            >
                                <Text
                                    size="sm"
                                    variant="regular"
                                    className={css.legendText}
                                >
                                    {item.name}
                                </Text>
                            </span>
                            <span
                                style={{
                                    opacity: isHidden ? 0.5 : 1,
                                }}
                            >
                                <Text
                                    size="sm"
                                    variant="regular"
                                    className={css.legendValue}
                                >
                                    {item.percentage}
                                </Text>
                            </span>
                        </Box>
                    </Button>
                )
            })}
        </Box>
    )
}
