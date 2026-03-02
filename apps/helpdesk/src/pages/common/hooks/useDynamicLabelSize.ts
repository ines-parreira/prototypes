import { useCallback, useEffect, useRef } from 'react'

export const useDynamicLabelSize = (threshold = 0.625) => {
    const labelSpan = useRef<HTMLSpanElement>(null)
    const labelContainer = useRef<HTMLDivElement>(null)

    const setDynamicLabelSize = useCallback(() => {
        if (!labelContainer.current || !labelSpan.current) {
            return
        }
        let labelWidth = labelSpan.current.clientWidth
        const containerWidth = labelContainer.current.clientWidth

        while (labelWidth / containerWidth > threshold) {
            labelSpan.current.style.fontSize = `${parseFloat(getComputedStyle(labelSpan.current).fontSize) - 1}px`
            labelWidth = labelSpan.current.clientWidth
        }
    }, [labelContainer, labelSpan, threshold])

    useEffect(() => {
        const handleResize = () => {
            setDynamicLabelSize()
        }

        const resizeObserver = new ResizeObserver(handleResize)
        if (labelSpan.current) {
            resizeObserver.observe(labelSpan.current)
        }

        return () => {
            resizeObserver.disconnect()
        }
    }, [labelContainer, labelSpan, setDynamicLabelSize])

    return { labelSpan, labelContainer }
}
