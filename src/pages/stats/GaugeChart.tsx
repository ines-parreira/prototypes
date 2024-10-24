import colors from '@gorgias/design-tokens/dist/tokens/colors.json'
import {Tooltip} from '@gorgias/ui-kit'
import React, {useMemo, useRef} from 'react'

import {DEFAULT_LOCALE, formatNumber} from './common/utils'
import css from './GaugeChart.less'
import Legend from './Legend'
import {OneDimensionalDataItem} from './types'

const STAT_COLORS = Object.freeze([
    colors['📺 Classic'].Main.Variations.Primary_3.value,
    colors['📺 Classic'].Feedback.Variations.Error_3.value,
    colors['📺 Classic'].Feedback.Variations.Warning_3.value,
    colors['📺 Classic'].Accessory.Purple_text.value,
    colors['📺 Classic'].Neutral.Grey_5.value,
])

type Props = {
    className?: string
    data: OneDimensionalDataItem[]
    restLabel?: string
}

export default function GaugeChart({
    className,
    data,
    restLabel = 'Others',
}: Props) {
    const total = useMemo(
        () => data.reduce((acc, {value}) => acc + value, 0),
        [data]
    )
    const displayItems = useMemo(() => {
        if (data.length <= STAT_COLORS.length) {
            return data.map((item, index) => ({
                ...item,
                color: STAT_COLORS[index],
            }))
        }
        const sortedItems = [...data].sort((a, b) => b.value - a.value)
        const displayLabels = sortedItems
            .slice(0, STAT_COLORS.length - 1)
            .map((item) => item.label)
        return [
            ...data.reduce(
                (acc, item) => {
                    if (displayLabels.includes(item.label)) {
                        acc.push({
                            ...item,
                            color: STAT_COLORS[acc.length],
                        })
                    }
                    return acc
                },
                [] as (OneDimensionalDataItem & {color: string})[]
            ),
            {
                label: restLabel,
                value: sortedItems
                    .slice(STAT_COLORS.length - 1)
                    .reduce((acc, item) => acc + item.value, 0),
                color: STAT_COLORS[STAT_COLORS.length - 1],
            },
        ]
    }, [data, restLabel])
    const orderedItems = useMemo(() => {
        return [...displayItems].sort((a, b) => b.value - a.value)
    }, [displayItems])

    return (
        <div className={className}>
            {orderedItems.length > 0 ? (
                <>
                    <div className={css.chart}>
                        {orderedItems.map((item) => (
                            <BarSegment
                                key={item.label}
                                total={total}
                                {...item}
                            />
                        ))}
                    </div>
                    <Legend
                        className={css.legend}
                        items={displayItems.map(({label, color}) => ({
                            label,
                            color,
                        }))}
                    />
                </>
            ) : (
                <div className={css.noData}>
                    <p className={css.noDataTitle}>
                        No data available for the selected period
                    </p>
                    <p>Try filtering for another date range to get results.</p>
                </div>
            )}
        </div>
    )
}

type BarSegmentProps = {
    color: string
    value: number
    total: number
    label: string
}

function BarSegment({color, label, value, total}: BarSegmentProps) {
    const ref = useRef<HTMLDivElement>(null)
    return (
        <>
            <div
                ref={ref}
                title={label}
                style={{
                    backgroundColor: color,
                    flexGrow: value / total,
                }}
            />
            <Tooltip target={ref} className={css.tooltip} aria-label={label}>
                <TooltipContent label={label} value={value} total={total} />
            </Tooltip>
        </>
    )
}

type TooltipContentProps = {
    label: string
    value: number
    total: number
}
const TooltipContent = ({label, value, total}: TooltipContentProps) => {
    return (
        <>
            {label}:{' '}
            <strong>
                {formatNumber(value)} (
                {new Intl.NumberFormat(DEFAULT_LOCALE, {
                    maximumFractionDigits: 0,
                }).format((value / total) * 100)}
                %)
            </strong>
        </>
    )
}
