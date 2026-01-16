import { act, renderHook } from '@testing-library/react'

import { usePlaygroundPanelInKnowledgeEditor } from './usePlaygroundPanelInKnowledgeEditor'

// Mock useScreenSize hook
jest.mock('panels/hooks/useScreenSize', () => ({
    __esModule: true,
    default: jest.fn(() => [1920, 1080]),
}))

const mockUseScreenSize = require('panels/hooks/useScreenSize')
    .default as jest.Mock

describe('usePlaygroundPanelInKnowledgeEditor', () => {
    describe('initial state', () => {
        it('should initialize with playground closed', () => {
            const { result } = renderHook(() =>
                usePlaygroundPanelInKnowledgeEditor(false),
            )

            expect(result.current.isPlaygroundOpen).toBe(false)
        })

        it('should calculate side panel width based on isFullscreen parameter', () => {
            const { result } = renderHook(() =>
                usePlaygroundPanelInKnowledgeEditor(false),
            )

            expect(result.current.sidePanelWidth).toBe(
                'calc(calc(max(920px, 66vw)) + calc(var(--spacing-xs) * 2))',
            )
        })

        it('should calculate side panel width for fullscreen mode', () => {
            const { result } = renderHook(() =>
                usePlaygroundPanelInKnowledgeEditor(true),
            )

            expect(result.current.sidePanelWidth).toBe('100vw')
        })
    })

    describe('onTest', () => {
        it('should toggle playground from closed to open', () => {
            const { result } = renderHook(() =>
                usePlaygroundPanelInKnowledgeEditor(false),
            )

            expect(result.current.isPlaygroundOpen).toBe(false)

            act(() => {
                result.current.onTest()
            })

            expect(result.current.isPlaygroundOpen).toBe(true)
        })

        it('should toggle playground from open to closed', () => {
            const { result } = renderHook(() =>
                usePlaygroundPanelInKnowledgeEditor(false),
            )

            act(() => {
                result.current.onTest()
            })

            expect(result.current.isPlaygroundOpen).toBe(true)

            act(() => {
                result.current.onTest()
            })

            expect(result.current.isPlaygroundOpen).toBe(false)
        })

        it('should update side panel width when playground is toggled', () => {
            const { result } = renderHook(() =>
                usePlaygroundPanelInKnowledgeEditor(false),
            )

            expect(result.current.sidePanelWidth).toBe(
                'calc(calc(max(920px, 66vw)) + calc(var(--spacing-xs) * 2))',
            )

            act(() => {
                result.current.onTest()
            })

            expect(result.current.sidePanelWidth).toBe(
                'calc(min(calc(calc(calc(max(920px, 66vw)) + calc(var(--spacing-xs) * 2)) + 480px + var(--layout-spacing-xs)), 98vw)',
            )
        })
    })

    describe('onClosePlayground', () => {
        it('should close the playground when open', () => {
            const { result } = renderHook(() =>
                usePlaygroundPanelInKnowledgeEditor(false),
            )

            act(() => {
                result.current.onTest()
            })

            expect(result.current.isPlaygroundOpen).toBe(true)

            act(() => {
                result.current.onClosePlayground()
            })

            expect(result.current.isPlaygroundOpen).toBe(false)
        })

        it('should have no effect when playground is already closed', () => {
            const { result } = renderHook(() =>
                usePlaygroundPanelInKnowledgeEditor(false),
            )

            expect(result.current.isPlaygroundOpen).toBe(false)

            act(() => {
                result.current.onClosePlayground()
            })

            expect(result.current.isPlaygroundOpen).toBe(false)
        })

        it('should update side panel width when playground is closed', () => {
            const { result } = renderHook(() =>
                usePlaygroundPanelInKnowledgeEditor(false),
            )

            act(() => {
                result.current.onTest()
            })

            expect(result.current.sidePanelWidth).toBe(
                'calc(min(calc(calc(calc(max(920px, 66vw)) + calc(var(--spacing-xs) * 2)) + 480px + var(--layout-spacing-xs)), 98vw)',
            )

            act(() => {
                result.current.onClosePlayground()
            })

            expect(result.current.sidePanelWidth).toBe(
                'calc(calc(max(920px, 66vw)) + calc(var(--spacing-xs) * 2))',
            )
        })
    })

    describe('sidePanelWidth calculation', () => {
        it('should return calc(calc(max(920px, 66vw)) + calc(var(--spacing-xs) * 2)) when neither fullscreen nor playground is open', () => {
            const { result } = renderHook(() =>
                usePlaygroundPanelInKnowledgeEditor(false),
            )

            expect(result.current.sidePanelWidth).toBe(
                'calc(calc(max(920px, 66vw)) + calc(var(--spacing-xs) * 2))',
            )
        })

        it('should return 100vw when fullscreen is enabled but playground is closed', () => {
            const { result } = renderHook(() =>
                usePlaygroundPanelInKnowledgeEditor(true),
            )

            expect(result.current.sidePanelWidth).toBe('100vw')
        })

        it('should add playground width (480px + gap) to base width when playground is open', () => {
            const { result } = renderHook(() =>
                usePlaygroundPanelInKnowledgeEditor(false),
            )

            act(() => {
                result.current.onTest()
            })

            expect(result.current.sidePanelWidth).toBe(
                'calc(min(calc(calc(calc(max(920px, 66vw)) + calc(var(--spacing-xs) * 2)) + 480px + var(--layout-spacing-xs)), 98vw)',
            )
        })

        it('should prioritize fullscreen width over playground width', () => {
            const { result } = renderHook(() =>
                usePlaygroundPanelInKnowledgeEditor(true),
            )

            expect(result.current.sidePanelWidth).toBe('100vw')

            act(() => {
                result.current.onTest()
            })

            // Fullscreen takes priority, even when playground is open
            expect(result.current.sidePanelWidth).toBe('100vw')
        })

        it('should update width when isFullscreen parameter changes', () => {
            const { result, rerender } = renderHook(
                ({ isFullscreen }) =>
                    usePlaygroundPanelInKnowledgeEditor(isFullscreen),
                { initialProps: { isFullscreen: false } },
            )

            expect(result.current.sidePanelWidth).toBe(
                'calc(calc(max(920px, 66vw)) + calc(var(--spacing-xs) * 2))',
            )

            rerender({ isFullscreen: true })

            expect(result.current.sidePanelWidth).toBe('100vw')
        })

        it('should prioritize fullscreen when isFullscreen changes even with playground open', () => {
            const { result, rerender } = renderHook(
                ({ isFullscreen }) =>
                    usePlaygroundPanelInKnowledgeEditor(isFullscreen),
                { initialProps: { isFullscreen: false } },
            )

            act(() => {
                result.current.onTest()
            })

            expect(result.current.sidePanelWidth).toBe(
                'calc(min(calc(calc(calc(max(920px, 66vw)) + calc(var(--spacing-xs) * 2)) + 480px + var(--layout-spacing-xs)), 98vw)',
            )

            // When fullscreen is enabled, it takes priority over playground
            rerender({ isFullscreen: true })

            expect(result.current.sidePanelWidth).toBe('100vw')
        })
    })

    describe('callback stability', () => {
        it('should maintain stable callback references on rerender', () => {
            const { result, rerender } = renderHook(() =>
                usePlaygroundPanelInKnowledgeEditor(false),
            )

            const firstOnTest = result.current.onTest
            const firstOnClosePlayground = result.current.onClosePlayground

            rerender()

            expect(result.current.onTest).toBe(firstOnTest)
            expect(result.current.onClosePlayground).toBe(
                firstOnClosePlayground,
            )
        })

        it('should maintain stable callbacks when isPlaygroundOpen state changes', () => {
            const { result } = renderHook(() =>
                usePlaygroundPanelInKnowledgeEditor(false),
            )

            const firstOnTest = result.current.onTest
            const firstOnClosePlayground = result.current.onClosePlayground

            act(() => {
                result.current.onTest()
            })

            expect(result.current.onTest).toBe(firstOnTest)
            expect(result.current.onClosePlayground).toBe(
                firstOnClosePlayground,
            )
        })
    })

    describe('edge cases', () => {
        it('should handle multiple rapid onTest calls', () => {
            const { result } = renderHook(() =>
                usePlaygroundPanelInKnowledgeEditor(false),
            )

            act(() => {
                result.current.onTest()
                result.current.onTest()
                result.current.onTest()
            })

            expect(result.current.isPlaygroundOpen).toBe(true)
        })

        it('should handle multiple rapid onClosePlayground calls', () => {
            const { result } = renderHook(() =>
                usePlaygroundPanelInKnowledgeEditor(false),
            )

            act(() => {
                result.current.onTest()
            })

            expect(result.current.isPlaygroundOpen).toBe(true)

            act(() => {
                result.current.onClosePlayground()
                result.current.onClosePlayground()
                result.current.onClosePlayground()
            })

            expect(result.current.isPlaygroundOpen).toBe(false)
        })

        it('should handle mixed rapid calls', () => {
            const { result } = renderHook(() =>
                usePlaygroundPanelInKnowledgeEditor(false),
            )

            act(() => {
                result.current.onTest()
                result.current.onClosePlayground()
                result.current.onTest()
            })

            expect(result.current.isPlaygroundOpen).toBe(true)
        })
    })

    describe('interaction with isFullscreen parameter', () => {
        it('should correctly handle playground toggle with fullscreen enabled', () => {
            const { result } = renderHook(() =>
                usePlaygroundPanelInKnowledgeEditor(true),
            )

            expect(result.current.sidePanelWidth).toBe('100vw')

            act(() => {
                result.current.onTest()
            })

            expect(result.current.isPlaygroundOpen).toBe(true)
            // Fullscreen takes priority even when playground is open
            expect(result.current.sidePanelWidth).toBe('100vw')

            act(() => {
                result.current.onClosePlayground()
            })

            expect(result.current.isPlaygroundOpen).toBe(false)
            expect(result.current.sidePanelWidth).toBe('100vw')
        })

        it('should handle changing isFullscreen while playground is open', () => {
            const { result, rerender } = renderHook(
                ({ isFullscreen }) =>
                    usePlaygroundPanelInKnowledgeEditor(isFullscreen),
                { initialProps: { isFullscreen: false } },
            )

            act(() => {
                result.current.onTest()
            })

            expect(result.current.sidePanelWidth).toBe(
                'calc(min(calc(calc(calc(max(920px, 66vw)) + calc(var(--spacing-xs) * 2)) + 480px + var(--layout-spacing-xs)), 98vw)',
            )

            // When fullscreen is enabled, it takes priority
            rerender({ isFullscreen: true })

            expect(result.current.sidePanelWidth).toBe('100vw')

            act(() => {
                result.current.onClosePlayground()
            })

            expect(result.current.sidePanelWidth).toBe('100vw')

            rerender({ isFullscreen: false })

            expect(result.current.sidePanelWidth).toBe(
                'calc(calc(max(920px, 66vw)) + calc(var(--spacing-xs) * 2))',
            )
        })
    })

    describe('viewport width responsive behavior', () => {
        beforeEach(() => {
            mockUseScreenSize.mockReturnValue([1920, 1080])
        })

        it('should use calc(calc(max(920px, 66vw)) + calc(var(--spacing-xs) * 2)) when viewport >= 918px and not fullscreen', () => {
            mockUseScreenSize.mockReturnValue([1920, 1080])

            const { result } = renderHook(() =>
                usePlaygroundPanelInKnowledgeEditor(false),
            )

            expect(result.current.sidePanelWidth).toBe(
                'calc(calc(max(920px, 66vw)) + calc(var(--spacing-xs) * 2))',
            )
        })

        it('should use 100vw when viewport < 918px (auto-fullscreen)', () => {
            mockUseScreenSize.mockReturnValue([900, 600])

            const { result } = renderHook(() =>
                usePlaygroundPanelInKnowledgeEditor(false),
            )

            expect(result.current.sidePanelWidth).toBe('100vw')
        })

        it('should prioritize manual fullscreen over viewport-based logic', () => {
            mockUseScreenSize.mockReturnValue([1920, 1080])

            const { result } = renderHook(() =>
                usePlaygroundPanelInKnowledgeEditor(true),
            )

            expect(result.current.sidePanelWidth).toBe('100vw')
        })

        it('should keep 100vw width on small viewports even when playground opens', () => {
            mockUseScreenSize.mockReturnValue([900, 600])

            const { result } = renderHook(() =>
                usePlaygroundPanelInKnowledgeEditor(false),
            )

            // Initially should be 100vw due to viewport < 918px
            expect(result.current.sidePanelWidth).toBe('100vw')

            // When playground opens on small viewport, keep 100vw to avoid horizontal scroll
            // The playground will overlay with z-index instead
            act(() => {
                result.current.onTest()
            })

            expect(result.current.sidePanelWidth).toBe('100vw')

            // When playground closes, remains 100vw
            act(() => {
                result.current.onClosePlayground()
            })

            expect(result.current.sidePanelWidth).toBe('100vw')
        })

        it('should respond to viewport width changes', () => {
            mockUseScreenSize.mockReturnValue([1920, 1080])

            const { result, rerender } = renderHook(() =>
                usePlaygroundPanelInKnowledgeEditor(false),
            )

            expect(result.current.sidePanelWidth).toBe(
                'calc(calc(max(920px, 66vw)) + calc(var(--spacing-xs) * 2))',
            )

            // Simulate viewport shrinking below 918px
            mockUseScreenSize.mockReturnValue([900, 600])
            rerender()

            expect(result.current.sidePanelWidth).toBe('100vw')

            // Simulate viewport expanding above 918px
            mockUseScreenSize.mockReturnValue([1920, 1080])
            rerender()

            expect(result.current.sidePanelWidth).toBe(
                'calc(calc(max(920px, 66vw)) + calc(var(--spacing-xs) * 2))',
            )
        })
    })

    describe('fullscreen priority behavior', () => {
        it('should always return 100vw when fullscreen is true, regardless of other states', () => {
            mockUseScreenSize.mockReturnValue([1920, 1080])

            const { result } = renderHook(() =>
                usePlaygroundPanelInKnowledgeEditor(true),
            )

            // Fullscreen without playground
            expect(result.current.sidePanelWidth).toBe('100vw')

            // Fullscreen with playground open
            act(() => {
                result.current.onTest()
            })
            expect(result.current.sidePanelWidth).toBe('100vw')

            // Fullscreen with playground closed
            act(() => {
                result.current.onClosePlayground()
            })
            expect(result.current.sidePanelWidth).toBe('100vw')
        })

        it('should switch from playground width to fullscreen width when fullscreen is enabled', () => {
            const { result, rerender } = renderHook(
                ({ isFullscreen }) =>
                    usePlaygroundPanelInKnowledgeEditor(isFullscreen),
                { initialProps: { isFullscreen: false } },
            )

            // Open playground in non-fullscreen mode
            act(() => {
                result.current.onTest()
            })

            expect(result.current.sidePanelWidth).toBe(
                'calc(min(calc(calc(calc(max(920px, 66vw)) + calc(var(--spacing-xs) * 2)) + 480px + var(--layout-spacing-xs)), 98vw)',
            )

            // Enable fullscreen - should override playground width
            rerender({ isFullscreen: true })

            expect(result.current.sidePanelWidth).toBe('100vw')

            // Disable fullscreen - should return to playground width
            rerender({ isFullscreen: false })

            expect(result.current.sidePanelWidth).toBe(
                'calc(min(calc(calc(calc(max(920px, 66vw)) + calc(var(--spacing-xs) * 2)) + 480px + var(--layout-spacing-xs)), 98vw)',
            )
        })
    })
})
