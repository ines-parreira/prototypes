import { act, renderHook } from '@testing-library/react'

import { usePlaygroundPanelInKnowledgeEditor } from './usePlaygroundPanelInKnowledgeEditor'

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

            expect(result.current.sidePanelWidth).toBe('66vw')
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

            expect(result.current.sidePanelWidth).toBe('66vw')

            act(() => {
                result.current.onTest()
            })

            expect(result.current.sidePanelWidth).toBe('98vw')
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

            expect(result.current.sidePanelWidth).toBe('98vw')

            act(() => {
                result.current.onClosePlayground()
            })

            expect(result.current.sidePanelWidth).toBe('66vw')
        })
    })

    describe('sidePanelWidth calculation', () => {
        it('should return 66vw when neither fullscreen nor playground is open', () => {
            const { result } = renderHook(() =>
                usePlaygroundPanelInKnowledgeEditor(false),
            )

            expect(result.current.sidePanelWidth).toBe('66vw')
        })

        it('should return 100vw when fullscreen is enabled but playground is closed', () => {
            const { result } = renderHook(() =>
                usePlaygroundPanelInKnowledgeEditor(true),
            )

            expect(result.current.sidePanelWidth).toBe('100vw')
        })

        it('should return 98vw when playground is open regardless of fullscreen', () => {
            const { result } = renderHook(() =>
                usePlaygroundPanelInKnowledgeEditor(false),
            )

            act(() => {
                result.current.onTest()
            })

            expect(result.current.sidePanelWidth).toBe('98vw')
        })

        it('should prioritize playground width over fullscreen width', () => {
            const { result } = renderHook(() =>
                usePlaygroundPanelInKnowledgeEditor(true),
            )

            expect(result.current.sidePanelWidth).toBe('100vw')

            act(() => {
                result.current.onTest()
            })

            expect(result.current.sidePanelWidth).toBe('98vw')
        })

        it('should update width when isFullscreen parameter changes', () => {
            const { result, rerender } = renderHook(
                ({ isFullscreen }) =>
                    usePlaygroundPanelInKnowledgeEditor(isFullscreen),
                { initialProps: { isFullscreen: false } },
            )

            expect(result.current.sidePanelWidth).toBe('66vw')

            rerender({ isFullscreen: true })

            expect(result.current.sidePanelWidth).toBe('100vw')
        })

        it('should maintain playground width even when isFullscreen changes', () => {
            const { result, rerender } = renderHook(
                ({ isFullscreen }) =>
                    usePlaygroundPanelInKnowledgeEditor(isFullscreen),
                { initialProps: { isFullscreen: false } },
            )

            act(() => {
                result.current.onTest()
            })

            expect(result.current.sidePanelWidth).toBe('98vw')

            rerender({ isFullscreen: true })

            expect(result.current.sidePanelWidth).toBe('98vw')
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
            expect(result.current.sidePanelWidth).toBe('98vw')

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

            expect(result.current.sidePanelWidth).toBe('98vw')

            rerender({ isFullscreen: true })

            expect(result.current.sidePanelWidth).toBe('98vw')

            act(() => {
                result.current.onClosePlayground()
            })

            expect(result.current.sidePanelWidth).toBe('100vw')

            rerender({ isFullscreen: false })

            expect(result.current.sidePanelWidth).toBe('66vw')
        })
    })
})
