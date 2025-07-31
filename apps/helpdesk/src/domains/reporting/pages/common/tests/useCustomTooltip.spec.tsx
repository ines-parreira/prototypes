import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'
import { Chart, TooltipModel } from 'chart.js'

import { useCustomTooltip } from 'domains/reporting/pages/common/useCustomTooltip'

describe('useCustomTooltip', () => {
    it('should initialize with default state', () => {
        const { result } = renderHook(() => useCustomTooltip())

        expect(result.current.tooltipData).toBeUndefined()
        expect(result.current.tooltipStyle).toEqual({
            opacity: 0,
            left: 0,
            top: 0,
        })
    })

    it('should not update tooltip when opacity is 0', () => {
        const { result } = renderHook(() => useCustomTooltip())

        act(() => {
            result.current.customTooltip({
                chart: {
                    canvas: {
                        getBoundingClientRect: () => ({ x: 100, y: 50 }),
                    },
                } as Chart,
                tooltip: { opacity: 0 } as TooltipModel,
            })
        })

        expect(result.current.tooltipStyle.opacity).toBe(0)
    })

    it('should update tooltip data and style when tooltip is shown', () => {
        const { result } = renderHook(() => useCustomTooltip())

        const mockTooltipModel = {
            opacity: 1,
            caretX: 50,
            caretY: 30,
            chart: {
                canvas: {
                    offsetLeft: 0,
                    offsetTop: 0,
                    getBoundingClientRect: () => ({ x: 100, y: 50 }),
                },
            },
        } as TooltipModel

        act(() => {
            result.current.customTooltip({
                chart: mockTooltipModel.chart as Chart,
                tooltip: mockTooltipModel,
            })
        })

        expect(result.current.tooltipData).toEqual(mockTooltipModel)
        expect(result.current.tooltipStyle).toEqual({
            opacity: 1,
            left: 150,
            top: 80,
        })
    })

    it('should not update tooltip style if values are equal', () => {
        const { result } = renderHook(() => useCustomTooltip())

        const mockTooltipModel = {
            opacity: 1,
            caretX: 50,
            caretY: 30,
            chart: {
                canvas: { getBoundingClientRect: () => ({ x: 100, y: 50 }) },
            },
        } as TooltipModel

        act(() => {
            result.current.customTooltip({
                chart: mockTooltipModel.chart as Chart,
                tooltip: mockTooltipModel,
            })
        })

        const prevTooltipStyle = result.current.tooltipStyle

        act(() => {
            result.current.customTooltip({
                chart: mockTooltipModel.chart as Chart,
                tooltip: mockTooltipModel,
            })
        })

        expect(result.current.tooltipStyle).toBe(prevTooltipStyle)
    })
})
