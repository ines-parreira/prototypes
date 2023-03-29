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
}

export default function GaugeChart({className, data}: Props) {
    const total = useMemo(
        () => data.reduce((acc, {value}) => acc + value, 0),
        [data]
    )
    const orderedItems = useMemo(
        () =>
            data
                .reduce(
                    (
                        acc: (OneDimensionalDataItem & {
                            color: string
                            size: number
                        })[],
                        item,
                        index
                    ) => {
                        acc.push({
                            ...item,
                            color: STAT_COLORS[index],
                            size: item.value / total,
                        })

                        return acc
                    },
                    []
                )
                .sort((a, b) => b.value - a.value),
        [data, total]
    )

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
                items={data.map(({label}, index) => ({
                    label,
                    color: STAT_COLORS[index],
                }))}
            />
        </div>
    )
}
