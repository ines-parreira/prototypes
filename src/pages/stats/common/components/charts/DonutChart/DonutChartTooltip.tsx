import React from 'react'

import { TooltipLabelStyle, TooltipModel } from 'chart.js'

import { formatPercentage } from 'pages/common/utils/numbers'

import css from './DonutChartTooltip.less'

type Props = {
    tooltip: TooltipModel
    total: number
}

export const DonutChartTooltip = ({
    tooltip: { labelColors, dataPoints },
    total,
}: Props) => {
    return (
        <>
            {dataPoints.map((item, index) => {
                const currentLabel = labelColors[index] as unknown as Record<
                    keyof TooltipLabelStyle,
                    string
                >
                const value = Number(item.raw)
                const percentFromTotal = (value * 100) / total

                return (
                    <div key={item.label} className={css.container}>
                        <div
                            className={css.tooltipItem}
                            style={{
                                backgroundColor: currentLabel.backgroundColor,
                                borderWidth: currentLabel.borderWidth,
                                borderColor: currentLabel.borderColor,
                                borderRadius: currentLabel.borderRadius,
                            }}
                        />
                        <span>
                            {item.label}{' '}
                            <strong>
                                {item.formattedValue} (
                                {formatPercentage(percentFromTotal, {
                                    maximumFractionDigits: 0,
                                })}
                                )
                            </strong>
                        </span>
                    </div>
                )
            })}
        </>
    )
}
