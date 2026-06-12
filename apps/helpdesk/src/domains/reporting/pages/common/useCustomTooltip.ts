import { useCallback, useState } from 'react'

import type { Chart, ChartType, TooltipModel } from 'chart.js'
import _isEqual from 'lodash/isEqual'

export type TooltipStyle = {
    opacity: number
    left: number
    top: number
}

export const useCustomTooltip = () => {
    const [tooltipData, setTooltipData] = useState<TooltipModel<ChartType>>()
    const [tooltipStyle, setTooltipStyle] = useState<TooltipStyle>({
        opacity: 0,
        left: 0,
        top: 0,
    })

    const customTooltip = useCallback(
        (context: unknown) => {
            const { chart, tooltip: tooltipModel } = context as {
                chart: Chart
                tooltip: TooltipModel<ChartType>
            }
            if (!chart) return

            if (tooltipModel.opacity === 0) {
                if (tooltipStyle?.opacity !== 0)
                    setTooltipStyle((prev) => ({
                        ...prev,
                        opacity: 0,
                    }))
                return
            }

            setTooltipData(tooltipModel)

            const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas

            const canvasPosition =
                tooltipModel.chart.canvas.getBoundingClientRect()

            const newTooltipStyle = {
                opacity: 1,
                left: canvasPosition.x + positionX + tooltipModel.caretX,
                top: canvasPosition.y + positionY + tooltipModel.caretY,
            }

            if (!_isEqual(tooltipStyle, newTooltipStyle))
                setTooltipStyle(newTooltipStyle)
        },
        [tooltipStyle],
    )

    return { customTooltip, tooltipData, tooltipStyle }
}
