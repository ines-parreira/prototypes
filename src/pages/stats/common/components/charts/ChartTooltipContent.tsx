import React from 'react'

import { TooltipLabelStyle, TooltipModel } from 'chart.js'

import { NOT_AVAILABLE_TEXT } from 'pages/stats/common/utils'

import css from './ChartTooltip.less'

type Props = {
    tooltip: TooltipModel
    showZeroAsNA?: boolean
}

export const ChartTooltipContent = ({
    tooltip: { labelColors, dataPoints },
    showZeroAsNA,
}: Props) => {
    return (
        <>
            {dataPoints.map((item, index) => {
                const currentLabel = labelColors[index] as unknown as Record<
                    keyof TooltipLabelStyle,
                    string
                >

                return (
                    <div key={item.dataset.label} className={css.tooltipItem}>
                        <div
                            className={css.tooltipItemBox}
                            style={{
                                backgroundColor: currentLabel.backgroundColor,
                                borderWidth: currentLabel.borderWidth,
                                borderColor: currentLabel.borderColor,
                                borderRadius: currentLabel.borderRadius,
                            }}
                        />
                        <span>{item.dataset.label}:</span>
                        <span className={css.tooltipItemValue}>
                            {showZeroAsNA && item.formattedValue === '0'
                                ? NOT_AVAILABLE_TEXT
                                : item.formattedValue}
                        </span>
                    </div>
                )
            })}
        </>
    )
}
