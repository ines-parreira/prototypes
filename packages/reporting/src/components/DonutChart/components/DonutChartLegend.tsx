import { useCallback, useEffect, useRef, useState } from 'react'

import { Box } from '@gorgias/axiom'

import { DonutChartLegendItem } from './DonutChartLegendItem'

import css from '../DonutChart.less'

type LegendItem = {
    name: string
    color: string
    percentage: string | number
    legendValue: string | null
}

type DonutChartLegendProps = {
    items: LegendItem[]
    hiddenSegments: Set<string>
    onToggleSegment: (name: string) => void
}

const TWO_COLUMN_BREAKPOINT = 400

export const DonutChartLegend = ({
    items,
    hiddenSegments,
    onToggleSegment,
}: DonutChartLegendProps) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const [useTwoColumns, setUseTwoColumns] = useState(false)

    const checkContainerWidth = useCallback(() => {
        if (containerRef.current) {
            const width = containerRef.current.offsetWidth
            setUseTwoColumns(width >= TWO_COLUMN_BREAKPOINT)
        }
    }, [])

    useEffect(() => {
        checkContainerWidth()

        const resizeObserver = new ResizeObserver(() => {
            checkContainerWidth()
        })

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current)
        }

        return () => {
            resizeObserver.disconnect()
        }
    }, [checkContainerWidth])

    const leftColumnItems = items.filter((_, index) => index % 2 === 0)
    const rightColumnItems = items.filter((_, index) => index % 2 === 1)

    return (
        <div ref={containerRef} className={css.legend}>
            {useTwoColumns ? (
                <div className={css.legendGrid}>
                    <div className={css.legendColumn}>
                        {leftColumnItems.map((item) => (
                            <DonutChartLegendItem
                                key={item.name}
                                name={item.name}
                                color={item.color}
                                legendValue={item.legendValue}
                                isHidden={hiddenSegments.has(item.name)}
                                onToggle={() => onToggleSegment(item.name)}
                            />
                        ))}
                    </div>
                    <div className={css.legendColumn}>
                        {rightColumnItems.map((item) => (
                            <DonutChartLegendItem
                                key={item.name}
                                name={item.name}
                                color={item.color}
                                legendValue={item.legendValue}
                                isHidden={hiddenSegments.has(item.name)}
                                onToggle={() => onToggleSegment(item.name)}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <Box flexDirection="column">
                    {items.map((item) => (
                        <DonutChartLegendItem
                            key={item.name}
                            name={item.name}
                            color={item.color}
                            legendValue={item.legendValue}
                            isHidden={hiddenSegments.has(item.name)}
                            onToggle={() => onToggleSegment(item.name)}
                        />
                    ))}
                </Box>
            )}
        </div>
    )
}
