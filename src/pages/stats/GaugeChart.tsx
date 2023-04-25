import React, {useMemo} from 'react'

import colors from 'assets/tokens/colors.json'
import css from './GaugeChart.less'
import {OneDimensionalDataItem} from './types'
import Legend from './Legend'

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
            ...data.reduce((acc, item) => {
                if (displayLabels.includes(item.label)) {
                    acc.push({
                        ...item,
                        color: STAT_COLORS[acc.length],
                    })
                }
                return acc
            }, [] as (OneDimensionalDataItem & {color: string})[]),
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
        return [...displayItems]
            .sort((a, b) => b.value - a.value)
            .map((item) => {
                return {
                    ...item,
                    size: item.value / total,
                }
            })
    }, [total, displayItems])

    return (
        <div className={className}>
            <div className={css.chart}>
                {orderedItems.map(({color, label, size}) => (
                    <div
                        key={label}
                        style={{
                            backgroundColor: color,
                            flexGrow: size,
                        }}
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
        </div>
    )
}
