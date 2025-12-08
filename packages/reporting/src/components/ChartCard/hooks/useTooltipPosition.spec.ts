import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useTooltipPosition } from './useTooltipPosition'

describe('useTooltipPosition', () => {
    let mockTooltipWrapper: HTMLElement
    let mockTooltipContent: HTMLElement

    beforeEach(() => {
        document.body.innerHTML = ''

        mockTooltipContent = document.createElement('div')
        mockTooltipContent.textContent = 'Tooltip content'

        const contentWrapper = document.createElement('div')
        contentWrapper.appendChild(mockTooltipContent)

        mockTooltipWrapper = document.createElement('div')
        mockTooltipWrapper.className = 'recharts-tooltip-wrapper'
        mockTooltipWrapper.appendChild(contentWrapper)

        mockTooltipWrapper.getBoundingClientRect = vi.fn(() => ({
            width: 100,
            height: 50,
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            x: 0,
            y: 0,
            toJSON: () => ({}),
        }))

        document.body.appendChild(mockTooltipWrapper)

        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 1024,
        })

        Object.defineProperty(window, 'innerHeight', {
            writable: true,
            configurable: true,
            value: 768,
        })
    })

    afterEach(() => {
        document.body.innerHTML = ''
    })

    it('should return a function', () => {
        const { result } = renderHook(() => useTooltipPosition())

        expect(typeof result.current).toBe('function')
    })

    it('should have correct DOM structure', () => {
        const tooltip = document.getElementsByClassName(
            'recharts-tooltip-wrapper',
        )[0] as HTMLElement

        expect(tooltip).toBeTruthy()

        const content = tooltip.querySelector('div > div')
        expect(content).toBeTruthy()
        expect(content?.textContent?.trim()).toBe('Tooltip content')
    })

    it('should handle when tooltip wrapper is not found', () => {
        document.body.innerHTML = ''

        const { result } = renderHook(() => useTooltipPosition())
        const onPieMouseMove = result.current

        const chartState = {
            activeLabel: 'test',
            activeTooltipIndex: 0,
        } as any

        const mockEvent = {
            nativeEvent: {
                clientX: 100,
                clientY: 100,
            } as MouseEvent,
        } as any

        expect(() => onPieMouseMove(chartState, mockEvent)).not.toThrow()
    })

    it('should hide tooltip when event is not provided', () => {
        const { result } = renderHook(() => useTooltipPosition())
        const onPieMouseMove = result.current

        const chartState = { activeLabel: 'test', activeTooltipIndex: 0 } as any

        onPieMouseMove(chartState, undefined as any)

        expect(mockTooltipWrapper.style.opacity).toBe('0')
        expect(mockTooltipWrapper.style.visibility).toBe('hidden')
    })

    it('should hide tooltip when activeLabel is undefined', () => {
        const { result } = renderHook(() => useTooltipPosition())
        const onPieMouseMove = result.current

        const chartState = {
            activeLabel: undefined,
        } as any

        const mockEvent = {
            nativeEvent: {
                clientX: 100,
                clientY: 100,
            } as MouseEvent,
        } as any

        onPieMouseMove(chartState, mockEvent)

        expect(mockTooltipWrapper.style.opacity).toBe('0')
        expect(mockTooltipWrapper.style.visibility).toBe('hidden')
    })

    it('should hide tooltip when activeLabel is null', () => {
        const { result } = renderHook(() => useTooltipPosition())
        const onPieMouseMove = result.current

        const chartState = {
            activeLabel: null,
        } as any

        const mockEvent = {
            nativeEvent: {
                clientX: 100,
                clientY: 100,
            } as MouseEvent,
        } as any

        onPieMouseMove(chartState, mockEvent)

        expect(mockTooltipWrapper.style.opacity).toBe('0')
        expect(mockTooltipWrapper.style.visibility).toBe('hidden')
    })

    it('should hide tooltip when activeTooltipIndex is undefined', () => {
        const { result } = renderHook(() => useTooltipPosition())
        const onPieMouseMove = result.current

        const chartState = {
            activeLabel: 'test',
            activeTooltipIndex: undefined,
        } as any

        const mockEvent = {
            nativeEvent: {
                clientX: 100,
                clientY: 100,
            } as MouseEvent,
        } as any

        onPieMouseMove(chartState, mockEvent)

        expect(mockTooltipWrapper.style.opacity).toBe('0')
        expect(mockTooltipWrapper.style.visibility).toBe('hidden')
    })

    it('should hide tooltip when activeTooltipIndex is -1', () => {
        const { result } = renderHook(() => useTooltipPosition())
        const onPieMouseMove = result.current

        const chartState = {
            activeLabel: 'test',
            activeTooltipIndex: -1,
        } as any

        const mockEvent = {
            nativeEvent: {
                clientX: 100,
                clientY: 100,
            } as MouseEvent,
        } as any

        onPieMouseMove(chartState, mockEvent)

        expect(mockTooltipWrapper.style.opacity).toBe('0')
        expect(mockTooltipWrapper.style.visibility).toBe('hidden')
    })

    it('should hide tooltip when tooltip content is empty', () => {
        mockTooltipContent.textContent = '   '

        const { result } = renderHook(() => useTooltipPosition())
        const onPieMouseMove = result.current

        const chartState = {
            activeLabel: 'test',
            activeTooltipIndex: 0,
        } as any

        const mockEvent = {
            nativeEvent: {
                clientX: 100,
                clientY: 100,
            } as MouseEvent,
        } as any

        onPieMouseMove(chartState, mockEvent)

        expect(mockTooltipWrapper.style.opacity).toBe('0')
        expect(mockTooltipWrapper.style.visibility).toBe('hidden')
    })

    it('should position tooltip with offset when there is enough space', () => {
        const { result } = renderHook(() => useTooltipPosition())
        const onPieMouseMove = result.current

        const tooltip = document.getElementsByClassName(
            'recharts-tooltip-wrapper',
        )[0] as HTMLElement

        const chartState = {
            activeLabel: 'test',
            activeTooltipIndex: 0,
        } as any

        const mockEvent = {
            nativeEvent: {
                clientX: 100,
                clientY: 100,
            } as MouseEvent,
        } as any

        onPieMouseMove(chartState, mockEvent)

        expect(tooltip.style.position).toBe('fixed')
        expect(tooltip.style.top).toBe('110px')
        expect(tooltip.style.left).toBe('110px')
        expect(tooltip.style.visibility).toBe('visible')
        expect(tooltip.style.opacity).toBe('1')
        expect(tooltip.style.pointerEvents).toBe('none')
    })

    it('should position tooltip to the left when it would overflow right edge', () => {
        const tooltip = document.getElementsByClassName(
            'recharts-tooltip-wrapper',
        )[0] as HTMLElement
        tooltip.getBoundingClientRect = vi.fn(() => ({
            width: 100,
            height: 50,
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            x: 0,
            y: 0,
            toJSON: () => ({}),
        }))

        const { result } = renderHook(() => useTooltipPosition())
        const onPieMouseMove = result.current

        const chartState = {
            activeLabel: 'test',
            activeTooltipIndex: 0,
        } as any

        const mockEvent = {
            nativeEvent: {
                clientX: 950,
                clientY: 100,
            } as MouseEvent,
        } as any

        onPieMouseMove(chartState, mockEvent)

        expect(parseInt(tooltip.style.left)).toBeLessThan(950)
    })

    it('should position tooltip above when it would overflow bottom edge', () => {
        const tooltip = document.getElementsByClassName(
            'recharts-tooltip-wrapper',
        )[0] as HTMLElement
        tooltip.getBoundingClientRect = vi.fn(() => ({
            width: 100,
            height: 50,
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            x: 0,
            y: 0,
            toJSON: () => ({}),
        }))

        const { result } = renderHook(() => useTooltipPosition())
        const onPieMouseMove = result.current

        const chartState = {
            activeLabel: 'test',
            activeTooltipIndex: 0,
        } as any

        const mockEvent = {
            nativeEvent: {
                clientX: 100,
                clientY: 750,
            } as MouseEvent,
        } as any

        onPieMouseMove(chartState, mockEvent)

        expect(parseInt(tooltip.style.top)).toBeLessThan(750)
    })

    it('should keep tooltip within left boundary when x would be negative', () => {
        const tooltip = document.getElementsByClassName(
            'recharts-tooltip-wrapper',
        )[0] as HTMLElement
        tooltip.getBoundingClientRect = vi.fn(() => ({
            width: 800,
            height: 50,
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            x: 0,
            y: 0,
            toJSON: () => ({}),
        }))

        const { result } = renderHook(() => useTooltipPosition())
        const onPieMouseMove = result.current

        const chartState = {
            activeLabel: 'test',
            activeTooltipIndex: 0,
        } as any

        const mockEvent = {
            nativeEvent: {
                clientX: 500,
                clientY: 100,
            } as MouseEvent,
        } as any

        onPieMouseMove(chartState, mockEvent)

        expect(tooltip.style.left).toBe('10px')
    })

    it('should keep tooltip within top boundary when y would be negative', () => {
        const tooltip = document.getElementsByClassName(
            'recharts-tooltip-wrapper',
        )[0] as HTMLElement
        tooltip.getBoundingClientRect = vi.fn(() => ({
            width: 100,
            height: 600,
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            x: 0,
            y: 0,
            toJSON: () => ({}),
        }))

        const { result } = renderHook(() => useTooltipPosition())
        const onPieMouseMove = result.current

        const chartState = {
            activeLabel: 'test',
            activeTooltipIndex: 0,
        } as any

        const mockEvent = {
            nativeEvent: {
                clientX: 100,
                clientY: 400,
            } as MouseEvent,
        } as any

        onPieMouseMove(chartState, mockEvent)

        expect(tooltip.style.top).toBe('10px')
    })
})
