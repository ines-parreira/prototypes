import type { Chart } from 'chart.js'

export type GreyArea = {
    start: string
    end: string
}
const GreyArea = {
    id: 'greyArea',
    beforeDraw(chart: Chart) {
        if (
            !chart.data.labels ||
            !chart.config.options?.plugins?.greyArea?.start ||
            !chart.config.options.plugins.greyArea?.end
        )
            return
        const {
            ctx,
            chartArea: { top, bottom, right, left },
        } = chart
        const xScale = chart.scales['x']
        let startX = left
        let endX = right
        if (
            chart.config.options.plugins.greyArea?.start !==
            chart.config.options.plugins.greyArea?.end
        ) {
            let start = chart.data.labels.indexOf(
                chart.config.options.plugins.greyArea?.start,
            )
            let end = chart.data.labels.indexOf(
                chart.config.options.plugins.greyArea?.end,
            )
            if (start < 0 || end < 0) return
            if (start > end) {
                ;[start, end] = [end, start]
            }
            if (start !== end) {
                startX = xScale.getPixelForValue(start, 10)
                endX = xScale.getPixelForValue(end)
            }
        }

        ctx.strokeStyle = 'grey'
        ctx.lineWidth = 0.5
        const gap = 10

        const drawLine = (
            moveTo: [number, number],
            lineTo: [number, number],
        ) => {
            ctx.beginPath()
            ctx.moveTo(...moveTo)
            ctx.lineTo(...lineTo)
            ctx.stroke()
            ctx.closePath()
        }

        // Fill bottom left
        let lastPositionBottomY = 0,
            lastPositionBottomX = 0
        for (let xy = 0; xy < endX - startX; xy = xy + gap) {
            if (bottom - xy < top) break
            drawLine([startX, bottom - xy], [startX + xy, bottom])
            lastPositionBottomY = bottom - xy
            lastPositionBottomX = startX + xy
        }
        // Fill leftover on Y
        let leftOveronX = gap - (endX - lastPositionBottomX)
        let y = bottom - lastPositionBottomY + gap
        for (y; y < bottom - top; y = y + gap) {
            drawLine([startX, bottom - y], [endX, bottom - leftOveronX])
            leftOveronX += gap
        }

        // Fill leftover on X
        let leftOveronY = gap - (lastPositionBottomY - top)
        let x = lastPositionBottomX + gap
        for (x; x < endX; x = x + gap) {
            drawLine([startX + leftOveronY, top], [x, bottom])
            leftOveronY += gap
        }
        if (leftOveronY > 0) {
            // Fill Top right x is greater
            let temp = x - endX
            for (let i = startX + leftOveronY; i < endX; i = i + gap) {
                drawLine([i, top], [endX, bottom - temp])
                temp += gap
            }
        } else if (leftOveronX > 0) {
            // fill top right if y is greater
            for (let i = startX + (top - (bottom - y)); i < endX; i = i + gap) {
                drawLine([i, top], [endX, bottom - leftOveronX])
                leftOveronX += gap
            }
        }

        // Draw vertical lone
        chart.ctx.save()
        ctx.setLineDash([5, 2])
        drawLine([startX, top], [startX, bottom])
        ctx.restore()
    },
}

export default GreyArea
