import {Chart, TooltipModel} from 'chart.js'
import _isEqual from 'lodash/isEqual'
import {useCallback, useState} from 'react'

export type TooltipStyle = {
    opacity: number
    left: number
    top: number
}

export const useCustomTooltip = () => {
    const [tooltipData, setTooltipData] = useState<TooltipModel>()
    const [tooltipStyle, setTooltipStyle] = useState<TooltipStyle>({
        opacity: 0,
        left: 0,
        top: 0,
    })

    const customTooltip = useCallback(
        (context: {chart: Chart; tooltip: TooltipModel}) => {
            const tooltipModel = context.tooltip
            if (!context.chart) return

            if (tooltipModel.opacity === 0) {
                if (tooltipStyle?.opacity !== 0)
                    setTooltipStyle((prev) => ({
                        ...prev,
                        opacity: 0,
                    }))
                return
            }

            setTooltipData(tooltipModel)

            const {offsetLeft: positionX, offsetTop: positionY} =
                context.chart.canvas

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
        [tooltipStyle]
    )

    return {customTooltip, tooltipData, tooltipStyle}
}
