import { useCallback, useEffect, useRef, useState } from 'react'

import { Button, Tooltip, TooltipContent } from '@gorgias/axiom'

import { useDonutChartHover } from '../context/DonutChartHoverContext'

import css from '../DonutChart.less'

type DonutChartLegendItemProps = {
    name: string
    color: string
    legendValue: string | null
    isHidden: boolean
    onToggle: () => void
}

export const DonutChartLegendItem = ({
    name,
    color,
    legendValue,
    isHidden,
    onToggle,
}: DonutChartLegendItemProps) => {
    const textRef = useRef<HTMLSpanElement>(null)
    const [isTruncated, setIsTruncated] = useState(false)
    const { setHoveredLegendItem } = useDonutChartHover()

    const checkTruncation = useCallback(() => {
        if (textRef.current) {
            const { scrollWidth, clientWidth } = textRef.current
            setIsTruncated(scrollWidth > clientWidth)
        }
    }, [])

    useEffect(() => {
        checkTruncation()

        const resizeObserver = new ResizeObserver(() => {
            checkTruncation()
        })

        if (textRef.current) {
            resizeObserver.observe(textRef.current)
        }

        return () => {
            resizeObserver.disconnect()
        }
    }, [checkTruncation, name])

    const handleMouseEnter = () => {
        setHoveredLegendItem(name)
    }

    const handleMouseLeave = () => {
        setHoveredLegendItem(null)
    }

    const textSpan = (
        <span
            ref={textRef}
            className={css.legendText}
            style={{ opacity: isHidden ? 0.5 : 1 }}
        >
            {name}
        </span>
    )

    return (
        <div
            className={css.legendItemWrapper}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <Button size="sm" variant="tertiary" onClick={onToggle}>
                <span className={css.legendButtonContent}>
                    <span
                        className={css.legendDot}
                        style={{
                            backgroundColor: color,
                            opacity: isHidden ? 0.3 : 1,
                        }}
                    />
                    <Tooltip isDisabled={!isTruncated} trigger={textSpan}>
                        <TooltipContent title={name} />
                    </Tooltip>
                    <span
                        className={css.legendValue}
                        style={{ opacity: isHidden ? 0.5 : 1 }}
                    >
                        {legendValue}
                    </span>
                </span>
            </Button>
        </div>
    )
}
