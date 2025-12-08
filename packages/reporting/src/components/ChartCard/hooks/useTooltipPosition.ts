import type { CategoricalChartFunc } from 'recharts/types/chart/types'

const TOOLTIP_OFFSET = 10

const calculateTooltipPosition = (
    mouseX: number,
    mouseY: number,
    tooltipRect: DOMRect,
): { x: number; y: number } => {
    let x = mouseX + TOOLTIP_OFFSET
    let y = mouseY + TOOLTIP_OFFSET

    if (x + tooltipRect.width > window.innerWidth) {
        x = mouseX - tooltipRect.width - TOOLTIP_OFFSET
    }
    if (y + tooltipRect.height > window.innerHeight) {
        y = mouseY - tooltipRect.height - TOOLTIP_OFFSET
    }
    if (x < 0) {
        x = TOOLTIP_OFFSET
    }
    if (y < 0) {
        y = TOOLTIP_OFFSET
    }

    return { x, y }
}

const applyTooltipStyles = (
    tooltipWrapper: HTMLElement,
    x: number,
    y: number,
): void => {
    tooltipWrapper.style.setProperty('position', 'fixed', 'important')
    tooltipWrapper.style.setProperty('top', `${y}px`, 'important')
    tooltipWrapper.style.setProperty('left', `${x}px`, 'important')
    tooltipWrapper.style.visibility = 'visible'
    tooltipWrapper.style.opacity = '1'
    tooltipWrapper.style.pointerEvents = 'none'
}

const hideTooltip = (tooltipWrapper: HTMLElement): void => {
    tooltipWrapper.style.opacity = '0'
    tooltipWrapper.style.visibility = 'hidden'
    tooltipWrapper.style.pointerEvents = 'none'
}

export const useTooltipPosition = (): CategoricalChartFunc => {
    const onPieMouseMove: CategoricalChartFunc = (e, event) => {
        const tooltipWrapper = document.getElementsByClassName(
            'recharts-tooltip-wrapper',
        )[0] as HTMLElement

        if (!tooltipWrapper) return

        if (
            !event ||
            e.activeLabel === undefined ||
            e.activeLabel === null ||
            e.activeTooltipIndex === undefined ||
            e.activeTooltipIndex === -1
        ) {
            hideTooltip(tooltipWrapper)
            return
        }

        const tooltipContent = tooltipWrapper.querySelector('div > div')
        if (!tooltipContent || tooltipContent.textContent?.trim() === '') {
            hideTooltip(tooltipWrapper)
            return
        }

        const mouseEvent = event.nativeEvent as MouseEvent
        const tooltipRect = tooltipWrapper.getBoundingClientRect()

        const { x, y } = calculateTooltipPosition(
            mouseEvent.clientX,
            mouseEvent.clientY,
            tooltipRect,
        )

        applyTooltipStyles(tooltipWrapper, x, y)
    }

    return onPieMouseMove
}
