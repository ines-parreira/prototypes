import type { TooltipContentProps } from 'recharts'

import { Box, Card } from '@gorgias/axiom'

import css from './ChatTooltip.less'

export const ChartTooltip = ({
    active,
    payload,
    label,
    formatter,
}: TooltipContentProps<string | number, string>) => {
    const isVisible = active && payload?.length
    return (
        <div style={{ visibility: isVisible ? 'visible' : 'hidden' }}>
            {isVisible && (
                <Card className={css.card}>
                    <Box gap="xxs" flexDirection="column">
                        {payload?.map((entry, index) => {
                            let finalValue = entry.value
                            let finalName = entry.name
                            if (formatter) {
                                const formatted = formatter(
                                    entry.value,
                                    entry.name,
                                    entry,
                                    index,
                                    payload,
                                )
                                if (Array.isArray(formatted)) {
                                    ;[finalValue, finalName] = formatted
                                } else if (formatted !== null) {
                                    finalValue = formatted
                                } else {
                                    return null
                                }
                            }

                            return (
                                <Box
                                    key={`tooltip-${entry.dataKey}`}
                                    gap="xxs"
                                    justifyContent="space-between"
                                >
                                    <Box gap="xxs" alignItems="center">
                                        <div
                                            className={css.dot}
                                            style={{
                                                backgroundColor: entry.color,
                                            }}
                                        />
                                        <div className={css.name}>
                                            {finalName}
                                        </div>
                                    </Box>
                                    <div className={css.value}>
                                        {finalValue}
                                    </div>
                                </Box>
                            )
                        })}
                        <div className={css.label}>{label}</div>
                    </Box>
                </Card>
            )}
        </div>
    )
}
