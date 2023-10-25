import React from 'react'
import {TooltipLabelStyle, TooltipModel} from 'chart.js'

import css from './LineChartTooltip.less'

type Props = {
    tooltip: TooltipModel
}

export const LineChartTooltip = ({
    tooltip: {labelColors, dataPoints},
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
                            {item.formattedValue}
                        </span>
                    </div>
                )
            })}
        </>
    )
}
