import React, { useMemo } from 'react'

import { TooltipModel } from 'chart.js'

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
    const tooltipItem = dataPoints[0]
    const currentLabel = labelColors[0]
    const value = Number(tooltipItem.raw)
    const percentFromTotal = (value * 100) / total

    const tooltipColorBoxStyle = useMemo(() => {
        const backgroundColor =
            typeof currentLabel.backgroundColor === 'string'
                ? currentLabel.backgroundColor
                : 'transparent'

        const borderColor =
            typeof currentLabel.borderColor === 'string'
                ? currentLabel.borderColor
                : 'transparent'

        const borderRadius =
            typeof currentLabel.borderRadius === 'number'
                ? currentLabel.borderRadius
                : 0

        return {
            backgroundColor,
            borderColor,
            borderRadius,
            borderWidth: currentLabel.borderWidth,
        }
    }, [currentLabel])

    return (
        <div key={tooltipItem.label} className={css.container}>
            <div className={css.tooltipColorBox} style={tooltipColorBoxStyle} />
            <div className={css.tooltipText}>
                <span>{tooltipItem.label}:</span>
                <strong>
                    {`${tooltipItem.formattedValue}/${total} (${formatPercentage(
                        percentFromTotal,
                        {
                            maximumFractionDigits: 0,
                        },
                    )})`}
                </strong>
            </div>
        </div>
    )
}
