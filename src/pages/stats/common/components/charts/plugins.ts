import {Chart, Plugin, Tick} from 'chart.js'
import moment, {Moment} from 'moment'

export type highlightOptions = {
    timeRanges: [[Moment, Moment]]
    defaultColor: string
    highlightColor: string
}

export const highlightTimeRanges: Plugin = {
    id: 'highlight_time_ranges',
    afterDraw: (
        chart: Chart,
        args,
        {
            timeRanges,
            defaultColor = '#f4f5f7',
            highlightColor = '#ffffff',
        }: highlightOptions
    ) => {
        if (!chart.canvas || !timeRanges) {
            return
        }
        const xScale = chart.scales['x']
        const yScale = chart.scales['y']

        timeRanges.map((range) => {
            const ctx = chart.canvas.getContext(
                '2d'
            ) as CanvasRenderingContext2D
            ctx.save()
            const ticksValues = xScale.ticks
                .map((tick: Tick) =>
                    parseInt(xScale.getLabelForValue(tick.value))
                )
                .map((value: number) => moment.unix(value).utc().format('h a'))

            const leftIndex = ticksValues.findIndex(
                (item: string) => item === range[0].format('h a')
            )
            const rightIndex = ticksValues.findIndex(
                (item: string) => item === range[1].format('h a')
            )

            if (leftIndex === -1 || rightIndex === -1) {
                return
            }

            const left = xScale.getPixelForValue(
                xScale.ticks[leftIndex].value,
                leftIndex
            )
            const right = xScale.getPixelForValue(
                xScale.ticks[rightIndex].value,
                rightIndex
            )
            const top = yScale.top
            const bottom = yScale.bottom

            ctx.globalCompositeOperation = 'destination-over'
            ctx.fillStyle = highlightColor
            ctx.fillRect(left, top, right - left, bottom - top)
            ctx.restore()
        })
        if (!chart.canvas) {
            return
        }
        const ctx = chart.canvas.getContext('2d') as CanvasRenderingContext2D
        ctx.save()
        ctx.globalCompositeOperation = 'destination-over'
        ctx.fillStyle = defaultColor
        ctx.fillRect(xScale.left, yScale.top, xScale.width, yScale.height)
        ctx.restore()
    },
}
