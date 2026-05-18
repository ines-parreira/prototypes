import { renderHook } from '@testing-library/react'
import { vi } from 'vitest'

import { usePanelSizes } from '../usePanelSizes'

describe('usePanelSizes', () => {
    const persistSizes = vi.fn()

    beforeEach(() => {
        persistSizes.mockClear()
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
})
