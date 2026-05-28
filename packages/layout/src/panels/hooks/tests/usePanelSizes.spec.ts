import { act, renderHook } from '@testing-library/react'
import { vi } from 'vitest'

import { usePanelSizes } from '../usePanelSizes'

describe('usePanelSizes', () => {
    const persistSizes = vi.fn()

    beforeEach(() => {
        persistSizes.mockClear()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('should return an empty object if there are no panels', () => {
        const configs = {}
        const order: string[] = []
        const savedSizes = { current: {} }
        const { result } = renderHook(() =>
            usePanelSizes(600, configs, savedSizes, persistSizes, order),
        )
        expect(result.current).toEqual([{}, expect.any(Function)])
        expect(persistSizes).not.toHaveBeenCalled()
    })

    it('should calculate panel sizes', () => {
        const configs = {
            panel1: { defaultSize: 200, minSize: 100, maxSize: 300 },
            panel2: { defaultSize: 200, minSize: 100, maxSize: 300 },
            panel3: { defaultSize: 200, minSize: 100, maxSize: 300 },
        }
        const order = ['panel1', 'panel2', 'panel3']
        const savedSizes = { current: {} }
        const { result } = renderHook(() =>
            usePanelSizes(600, configs, savedSizes, persistSizes, order),
        )
        expect(result.current[0]).toEqual({
            panel1: 200,
            panel2: 200,
            panel3: 200,
        })
        expect(persistSizes).toHaveBeenCalledWith({
            panel1: 200,
            panel2: 200,
            panel3: 200,
        })
    })

    it('should persist missing finite defaults without overwriting saved sizes', () => {
        const configs = {
            panel1: { defaultSize: 200, minSize: 100, maxSize: 300 },
            panel2: { defaultSize: 250, minSize: 100, maxSize: 300 },
            panel3: { defaultSize: Infinity, minSize: 100, maxSize: Infinity },
        }
        const order = ['panel1', 'panel2', 'panel3']
        const savedSizes = { current: { panel1: 220 } }

        renderHook(() =>
            usePanelSizes(600, configs, savedSizes, persistSizes, order),
        )

        expect(persistSizes).toHaveBeenCalledWith({
            panel2: 250,
        })
    })

    it('should scale current sizes while resizing', () => {
        vi.useFakeTimers()

        const configs = {
            panel1: { defaultSize: 300, minSize: 100, maxSize: 900 },
            panel2: { defaultSize: 300, minSize: 100, maxSize: 900 },
            panel3: {
                defaultSize: Infinity,
                minSize: 100,
                maxSize: Infinity,
            },
        }
        const order = ['panel1', 'panel2', 'panel3']
        const savedSizes = { current: { panel1: 300, panel2: 300 } }

        const { result, rerender } = renderHook(
            ({ availableSize }) =>
                usePanelSizes(
                    availableSize,
                    configs,
                    savedSizes,
                    persistSizes,
                    order,
                ),
            { initialProps: { availableSize: 1000 } },
        )

        expect(result.current[0]).toEqual({
            panel1: 300,
            panel2: 300,
            panel3: 400,
        })

        persistSizes.mockClear()

        rerender({ availableSize: 2000 })

        expect(result.current[0]).toEqual({
            panel1: 600,
            panel2: 600,
            panel3: 800,
        })
        expect(persistSizes).not.toHaveBeenCalled()

        act(() => {
            vi.advanceTimersByTime(49)
        })
        expect(persistSizes).not.toHaveBeenCalled()

        act(() => {
            vi.advanceTimersByTime(1)
        })

        expect(result.current[0]).toEqual({
            panel1: 600,
            panel2: 600,
            panel3: 800,
        })
        expect(persistSizes).toHaveBeenCalledWith({
            panel1: 600,
            panel2: 600,
            panel3: 800,
        })
    })

    it('should keep the resize snapshot alive until resizing settles', () => {
        vi.useFakeTimers()

        const configs = {
            panel1: { defaultSize: 300, minSize: 100, maxSize: 900 },
            panel2: { defaultSize: 300, minSize: 100, maxSize: 900 },
            panel3: {
                defaultSize: Infinity,
                minSize: 100,
                maxSize: Infinity,
            },
        }
        const order = ['panel1', 'panel2', 'panel3']
        const savedSizes = { current: { panel1: 300, panel2: 300 } }

        const { result, rerender } = renderHook(
            ({ availableSize }) =>
                usePanelSizes(
                    availableSize,
                    configs,
                    savedSizes,
                    persistSizes,
                    order,
                ),
            { initialProps: { availableSize: 1000 } },
        )

        rerender({ availableSize: 1200 })
        expect(result.current[0]).toEqual({
            panel1: 360,
            panel2: 360,
            panel3: 480,
        })
        persistSizes.mockClear()

        act(() => {
            vi.advanceTimersByTime(49)
        })
        rerender({ availableSize: 1500 })
        expect(result.current[0]).toEqual({
            panel1: 450,
            panel2: 450,
            panel3: 600,
        })
        expect(persistSizes).not.toHaveBeenCalled()

        act(() => {
            vi.advanceTimersByTime(49)
        })

        expect(result.current[0]).toEqual({
            panel1: 450,
            panel2: 450,
            panel3: 600,
        })

        act(() => {
            vi.advanceTimersByTime(1)
        })

        expect(result.current[0]).toEqual({
            panel1: 450,
            panel2: 450,
            panel3: 600,
        })
        expect(persistSizes).toHaveBeenCalledWith({
            panel1: 450,
            panel2: 450,
            panel3: 600,
        })
    })
})
