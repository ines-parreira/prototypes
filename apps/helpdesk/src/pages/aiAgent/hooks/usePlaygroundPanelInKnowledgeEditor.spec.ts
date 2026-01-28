import { act, renderHook } from '@testing-library/react'

import { usePlaygroundPanelInKnowledgeEditor } from './usePlaygroundPanelInKnowledgeEditor'

// Mock useScreenSize hook
const mockUseScreenSize = jest.fn()
jest.mock('panels/hooks/useScreenSize', () => ({
    __esModule: true,
    default: () => mockUseScreenSize(),
}))

describe('usePlaygroundPanelInKnowledgeEditor', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('shouldHideFullscreenButton', () => {
        it('should be false when width >= 1400', () => {
            mockUseScreenSize.mockReturnValue([1400, 800])

            const { result } = renderHook(() =>
                usePlaygroundPanelInKnowledgeEditor(false),
            )

            // Open playground
            act(() => {
                result.current.onTest()
            })

            expect(result.current.shouldHideFullscreenButton).toBe(false)
        })

        it('should be false when playground is closed', () => {
            mockUseScreenSize.mockReturnValue([1200, 800])

            const { result } = renderHook(() =>
                usePlaygroundPanelInKnowledgeEditor(false),
            )

            // Playground is closed by default
            expect(result.current.isPlaygroundOpen).toBe(false)
            expect(result.current.shouldHideFullscreenButton).toBe(false)
        })

        it('should be true when width < 1400 AND playground is open', () => {
            mockUseScreenSize.mockReturnValue([1399, 800])

            const { result } = renderHook(() =>
                usePlaygroundPanelInKnowledgeEditor(false),
            )

            // Open playground
            act(() => {
                result.current.onTest()
            })

            expect(result.current.isPlaygroundOpen).toBe(true)
            expect(result.current.shouldHideFullscreenButton).toBe(true)
        })

        it('should be true when width is much smaller than 1400 and playground is open', () => {
            mockUseScreenSize.mockReturnValue([800, 600])

            const { result } = renderHook(() =>
                usePlaygroundPanelInKnowledgeEditor(false),
            )

            // Open playground
            act(() => {
                result.current.onTest()
            })

            expect(result.current.shouldHideFullscreenButton).toBe(true)
        })
    })

    describe('effectiveIsFullscreen and width calculations', () => {
        it('should return 100vw width when forced fullscreen (width < 1400, playground open, not manually fullscreen)', () => {
            mockUseScreenSize.mockReturnValue([1200, 800])

            const { result } = renderHook(
                () => usePlaygroundPanelInKnowledgeEditor(false), // isFullscreen = false
            )

            // Open playground - should force fullscreen
            act(() => {
                result.current.onTest()
            })

            expect(result.current.shouldHideFullscreenButton).toBe(true)
            expect(result.current.sidePanelWidth).toBe('100vw')
        })

        it('should return 100vw width when manually fullscreen', () => {
            mockUseScreenSize.mockReturnValue([1400, 800])

            const { result } = renderHook(
                () => usePlaygroundPanelInKnowledgeEditor(true), // isFullscreen = true
            )

            expect(result.current.sidePanelWidth).toBe('100vw')
        })

        it('should respect actual fullscreen state when button shows (width >= 1400)', () => {
            mockUseScreenSize.mockReturnValue([1400, 800])

            const { result } = renderHook(
                () => usePlaygroundPanelInKnowledgeEditor(false), // isFullscreen = false
            )

            // Open playground
            act(() => {
                result.current.onTest()
            })

            // Button should not hide, should not force fullscreen
            expect(result.current.shouldHideFullscreenButton).toBe(false)
            // Width should NOT be 100vw since not fullscreen
            expect(result.current.sidePanelWidth).not.toBe('100vw')
        })

        it('should return calculated width with playground when not fullscreen and width >= 1400', () => {
            mockUseScreenSize.mockReturnValue([1500, 800])

            const { result } = renderHook(() =>
                usePlaygroundPanelInKnowledgeEditor(false),
            )

            const widthWithoutPlayground = result.current.sidePanelWidth

            // Open playground
            act(() => {
                result.current.onTest()
            })

            const widthWithPlayground = result.current.sidePanelWidth

            // Width should include playground width calculation
            expect(widthWithPlayground).toContain('480px')
            expect(widthWithPlayground).not.toBe(widthWithoutPlayground)
        })

        it('should return base width when playground closed and not fullscreen', () => {
            mockUseScreenSize.mockReturnValue([1500, 800])

            const { result } = renderHook(() =>
                usePlaygroundPanelInKnowledgeEditor(false),
            )

            expect(result.current.sidePanelWidth).toContain('calc')
            expect(result.current.sidePanelWidth).not.toBe('100vw')
        })
    })

    describe('playground state management', () => {
        it('should toggle playground open state when onTest is called', () => {
            mockUseScreenSize.mockReturnValue([1500, 800])

            const { result } = renderHook(() =>
                usePlaygroundPanelInKnowledgeEditor(false),
            )

            expect(result.current.isPlaygroundOpen).toBe(false)

            act(() => {
                result.current.onTest()
            })

            expect(result.current.isPlaygroundOpen).toBe(true)

            act(() => {
                result.current.onTest()
            })

            expect(result.current.isPlaygroundOpen).toBe(false)
        })

        it('should close playground when onClosePlayground is called', () => {
            mockUseScreenSize.mockReturnValue([1500, 800])

            const { result } = renderHook(() =>
                usePlaygroundPanelInKnowledgeEditor(false),
            )

            // Open playground
            act(() => {
                result.current.onTest()
            })

            expect(result.current.isPlaygroundOpen).toBe(true)

            // Close playground
            act(() => {
                result.current.onClosePlayground()
            })

            expect(result.current.isPlaygroundOpen).toBe(false)
        })
    })

    describe('state restoration scenarios', () => {
        it('should restore non-fullscreen state when playground closes on small screen', () => {
            mockUseScreenSize.mockReturnValue([1200, 800])

            const { result } = renderHook(
                () => usePlaygroundPanelInKnowledgeEditor(false), // NOT fullscreen initially
            )

            // Initially not fullscreen
            expect(result.current.sidePanelWidth).not.toBe('100vw')

            // Open playground - forces fullscreen
            act(() => {
                result.current.onTest()
            })

            expect(result.current.shouldHideFullscreenButton).toBe(true)
            expect(result.current.sidePanelWidth).toBe('100vw')

            // Close playground - should restore to non-fullscreen
            act(() => {
                result.current.onClosePlayground()
            })

            expect(result.current.shouldHideFullscreenButton).toBe(false)
            expect(result.current.sidePanelWidth).not.toBe('100vw')
        })

        it('should maintain fullscreen state when playground closes on small screen if manually set', () => {
            mockUseScreenSize.mockReturnValue([1200, 800])

            const { result } = renderHook(
                ({ isFullscreen }) =>
                    usePlaygroundPanelInKnowledgeEditor(isFullscreen),
                {
                    initialProps: { isFullscreen: true }, // Manually fullscreen
                },
            )

            // Open playground
            act(() => {
                result.current.onTest()
            })

            expect(result.current.shouldHideFullscreenButton).toBe(true)
            expect(result.current.sidePanelWidth).toBe('100vw')

            // Close playground
            act(() => {
                result.current.onClosePlayground()
            })

            // Should still be fullscreen because it was manually set
            expect(result.current.shouldHideFullscreenButton).toBe(false)
            expect(result.current.sidePanelWidth).toBe('100vw')
        })
    })
})
