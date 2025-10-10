import { renderHook } from '@testing-library/react'

import { measureTextWidth, useTextWidth } from '../useTextWidth'

const mockMeasureText = vi.fn()
const mockGetContext = vi.fn()
const mockGetComputedStyle = vi.fn()

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    value: mockGetContext,
})

const originalCreateElement = document.createElement
document.createElement = vi.fn().mockImplementation((tagName: string) => {
    if (tagName === 'canvas') {
        return {
            getContext: mockGetContext,
        } as any
    }
    if (tagName === 'span') {
        const element = originalCreateElement.call(document, 'span')
        return element
    }
    return originalCreateElement.call(document, tagName)
})

const originalGetComputedStyle = window.getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
    value: mockGetComputedStyle,
    writable: true,
})

beforeEach(() => {
    vi.clearAllMocks()

    // Setup default canvas context mock
    mockGetContext.mockReturnValue({
        measureText: mockMeasureText,
        font: '',
    })

    // Setup default computed style mock
    mockGetComputedStyle.mockReturnValue({
        fontWeight: '400',
        fontSize: '16px',
        fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    })

    // Setup default measureText result
    mockMeasureText.mockReturnValue({ width: 100 })
})

afterAll(() => {
    document.createElement = originalCreateElement
    window.getComputedStyle = originalGetComputedStyle
})

describe('measureTextWidth', () => {
    it('should return 0 for empty text', () => {
        const width = measureTextWidth('')

        expect(width).toBe(0)
        expect(mockGetContext).not.toHaveBeenCalled()
    })

    it('should return 0 for null/undefined text', () => {
        expect(measureTextWidth(null as any)).toBe(0)
        expect(measureTextWidth(undefined as any)).toBe(0)
    })

    it('should measure text width using Canvas API', () => {
        mockMeasureText.mockReturnValue({ width: 85.5 })

        const width = measureTextWidth('Hello World')

        expect(mockGetContext).toHaveBeenCalledWith('2d')
        expect(mockMeasureText).toHaveBeenCalledWith('Hello World')
        expect(width).toBe(86) // Math.ceil(85.5)
    })

    it('should apply custom font size', () => {
        const text = 'Hello World'
        const fontSize = '20px'

        measureTextWidth(text, { fontSize })

        expect(mockMeasureText).toHaveBeenCalledWith(text)
        expect(document.createElement).toHaveBeenCalledWith('span')
        expect(mockGetComputedStyle).toHaveBeenCalled()
    })

    it('should create temporary element to detect font properties', () => {
        const text = 'Hello World'

        measureTextWidth(text)

        expect(document.createElement).toHaveBeenCalledWith('canvas')
        expect(document.createElement).toHaveBeenCalledWith('span')
        expect(mockGetComputedStyle).toHaveBeenCalled()
    })

    it('should fallback to character estimation when canvas context is unavailable', () => {
        mockGetContext.mockReturnValue(null)

        const width = measureTextWidth('Hello')

        expect(width).toBe(40) // 5 characters * 8 pixels
    })

    it('should handle different font sizes', () => {
        const text = 'Test'

        measureTextWidth(text, { fontSize: '12px' })

        expect(document.createElement).toHaveBeenCalledWith('canvas')
        expect(document.createElement).toHaveBeenCalledWith('span')
    })

    it('should apply custom font weight', () => {
        const text = 'Hello World'
        const fontWeight = 'bold'

        measureTextWidth(text, { fontWeight })

        expect(mockMeasureText).toHaveBeenCalledWith(text)
        expect(document.createElement).toHaveBeenCalledWith('span')
        expect(mockGetComputedStyle).toHaveBeenCalled()
    })

    it('should handle different font weights', () => {
        const text = 'Test'

        measureTextWidth(text, { fontWeight: '600' })

        expect(document.createElement).toHaveBeenCalledWith('canvas')
        expect(document.createElement).toHaveBeenCalledWith('span')
    })

    it('should apply both custom font size and font weight', () => {
        const text = 'Hello World'
        const fontSize = '20px'
        const fontWeight = '700'

        measureTextWidth(text, { fontSize, fontWeight })

        expect(mockMeasureText).toHaveBeenCalledWith(text)
        expect(document.createElement).toHaveBeenCalledWith('span')
        expect(mockGetComputedStyle).toHaveBeenCalled()
    })
})

describe('useTextWidth', () => {
    it('should return width and calculatedWidth for enabled hook', () => {
        mockMeasureText.mockReturnValue({ width: 120 })

        const { result } = renderHook(() =>
            useTextWidth('Hello World', { enabled: true, padding: 10 }),
        )

        expect(result.current).toBe(130)
    })

    it('should return 0 when disabled', () => {
        const { result } = renderHook(() =>
            useTextWidth('Hello World', { enabled: false, padding: 10 }),
        )

        expect(result.current).toBe(0)

        expect(mockGetContext).not.toHaveBeenCalled()
    })

    it('should return 0 for empty text', () => {
        const { result } = renderHook(() =>
            useTextWidth('', { enabled: true, padding: 10 }),
        )

        expect(result.current).toBe(0)
    })

    it('should use default options when none provided', () => {
        mockMeasureText.mockReturnValue({ width: 100 })

        const { result } = renderHook(() => useTextWidth('Hello'))

        expect(result.current).toBe(100)
    })

    it('should apply padding correctly', () => {
        mockMeasureText.mockReturnValue({ width: 80 })

        const { result } = renderHook(() =>
            useTextWidth('Test', { padding: 20 }),
        )

        expect(result.current).toBe(100)
    })

    it('should use custom font size', () => {
        mockMeasureText.mockReturnValue({ width: 90 })

        const { result } = renderHook(() =>
            useTextWidth('Test', { fontSize: '18px' }),
        )

        expect(result.current).toBe(90)
        expect(mockMeasureText).toHaveBeenCalledWith('Test')
    })

    it('should use custom font weight', () => {
        mockMeasureText.mockReturnValue({ width: 95 })

        const { result } = renderHook(() =>
            useTextWidth('Test', { fontWeight: 'bold' }),
        )

        expect(result.current).toBe(95)
        expect(mockMeasureText).toHaveBeenCalledWith('Test')
    })

    it('should use custom font size and font weight', () => {
        mockMeasureText.mockReturnValue({ width: 105 })

        const { result } = renderHook(() =>
            useTextWidth('Test', { fontSize: '20px', fontWeight: '600' }),
        )

        expect(result.current).toBe(105)
        expect(mockMeasureText).toHaveBeenCalledWith('Test')
    })

    it('should recalculate when text changes', () => {
        mockMeasureText
            .mockReturnValueOnce({ width: 80 })
            .mockReturnValueOnce({ width: 120 })

        const { result, rerender } = renderHook(
            ({ text }) => useTextWidth(text, { padding: 10 }),
            { initialProps: { text: 'Hello' } },
        )

        expect(result.current).toBe(90)

        rerender({ text: 'Hello World' })

        expect(result.current).toBe(130)
    })

    it('should recalculate when padding changes', () => {
        mockMeasureText.mockReturnValue({ width: 100 })

        const { result, rerender } = renderHook(
            ({ padding }) => useTextWidth('Hello', { padding }),
            { initialProps: { padding: 10 } },
        )

        expect(result.current).toBe(110)

        rerender({ padding: 20 })

        expect(result.current).toBe(120)
    })

    it('should recalculate when fontSize changes', () => {
        mockMeasureText
            .mockReturnValueOnce({ width: 80 })
            .mockReturnValueOnce({ width: 90 })

        const { result, rerender } = renderHook(
            ({ fontSize }) => useTextWidth('Hello', { fontSize }),
            { initialProps: { fontSize: '14px' } },
        )

        expect(result.current).toBe(80)

        rerender({ fontSize: '16px' })

        expect(result.current).toBe(90)
    })

    it('should recalculate when fontWeight changes', () => {
        mockMeasureText
            .mockReturnValueOnce({ width: 75 })
            .mockReturnValueOnce({ width: 85 })

        const { result, rerender } = renderHook(
            ({ fontWeight }) => useTextWidth('Hello', { fontWeight }),
            { initialProps: { fontWeight: '400' } },
        )

        expect(result.current).toBe(75)

        rerender({ fontWeight: 'bold' })

        expect(result.current).toBe(85)
    })

    it('should handle enabled state changes', () => {
        mockMeasureText.mockReturnValue({ width: 100 })

        const { result, rerender } = renderHook(
            ({ enabled }) => useTextWidth('Hello', { enabled, padding: 10 }),
            { initialProps: { enabled: true } },
        )

        expect(result.current).toBe(110)

        rerender({ enabled: false })

        expect(result.current).toBe(0)

        rerender({ enabled: true })

        expect(result.current).toBe(110)
    })
})

describe('edge cases', () => {
    it('should handle very long text', () => {
        const longText = 'A'.repeat(1000)
        mockMeasureText.mockReturnValue({ width: 5000 })

        const { result } = renderHook(() =>
            useTextWidth(longText, { padding: 50 }),
        )

        expect(result.current).toBe(5050)
    })

    it('should handle special characters', () => {
        const specialText = '🚀 Hello 世界 @#$%'
        mockMeasureText.mockReturnValue({ width: 150 })

        const { result } = renderHook(() => useTextWidth(specialText))

        expect(result.current).toBe(150)
        expect(mockMeasureText).toHaveBeenCalledWith(String(specialText))
    })

    it('should handle zero padding', () => {
        mockMeasureText.mockReturnValue({ width: 100 })

        const { result } = renderHook(() =>
            useTextWidth('Hello', { padding: 0 }),
        )

        expect(result.current).toBe(100)
    })

    it('should handle negative padding', () => {
        mockMeasureText.mockReturnValue({ width: 100 })

        const { result } = renderHook(() =>
            useTextWidth('Hello', { padding: -10 }),
        )

        expect(result.current).toBe(90)
    })

    it('should handle different font weight values', () => {
        mockMeasureText.mockReturnValue({ width: 110 })

        const { result } = renderHook(() =>
            useTextWidth('Bold Text', { fontWeight: '700', fontSize: '18px' }),
        )

        expect(result.current).toBe(110)
        expect(mockMeasureText).toHaveBeenCalledWith('Bold Text')
    })

    it('should handle numeric font weight values', () => {
        mockMeasureText.mockReturnValue({ width: 85 })

        const { result } = renderHook(() =>
            useTextWidth('Light Text', { fontWeight: '300' }),
        )

        expect(result.current).toBe(85)
    })
})
