import { useEffect, useRef, useState } from 'react'

export const useChartWrapperWidth = (isDisabled: boolean) => {
    const chartWrapperRef = useRef<HTMLDivElement>(null)
    const [chartWrapperWidth, setChartWrapperWidth] = useState<number>()

    useEffect(() => {
        if (isDisabled) return undefined

        const chartWrapper = chartWrapperRef.current

        if (!chartWrapper) return undefined

        const updateChartWrapperWidth = (width: number) => {
            const nextWidth = width > 0 ? width : undefined

            setChartWrapperWidth((currentWidth) =>
                currentWidth === nextWidth ? currentWidth : nextWidth,
            )
        }

        updateChartWrapperWidth(chartWrapper.getBoundingClientRect().width)

        if (typeof ResizeObserver === 'undefined') return undefined

        const resizeObserver = new ResizeObserver((entries) => {
            updateChartWrapperWidth(entries[0]?.contentRect.width ?? 0)
        })

        resizeObserver.observe(chartWrapper)

        return () => resizeObserver.disconnect()
    }, [isDisabled])

    return { chartWrapperRef, chartWrapperWidth }
}
