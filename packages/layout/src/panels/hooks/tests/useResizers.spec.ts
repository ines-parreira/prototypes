import { renderHook } from '@testing-library/react'
import { vi } from 'vitest'

import { useResizers } from '../useResizers'

describe('usePanelGroup', () => {
    const configs = {
        panel1: {
            defaultSize: 200,
            minSize: 100,
            maxSize: 300,
        },
        panel2: {
            defaultSize: 200,
            minSize: 100,
            maxSize: 300,
        },
        panel3: {
            defaultSize: 200,
            minSize: 100,
            maxSize: 300,
        },
    }
    const order = ['panel1', 'panel2', 'panel3']

    let createResizer: Parameters<typeof useResizers>[0]

    beforeEach(() => {
        createResizer = vi.fn((__index: number) => vi.fn())
    })

    it('should create a resizer for each eligible panel', () => {
        const { result } = renderHook(() =>
            useResizers(createResizer, configs, order),
        )
        expect(result.current).toEqual({
            panel1: undefined,
            panel2: expect.any(Function),
            panel3: expect.any(Function),
        })
        expect(createResizer).toHaveBeenCalledTimes(2)
        expect(createResizer).toHaveBeenNthCalledWith(1, 1)
        expect(createResizer).toHaveBeenNthCalledWith(2, 2)
    })

    it('should return empty object for empty order', () => {
        const { result } = renderHook(() => useResizers(createResizer, {}, []))

        expect(result.current).toEqual({})
        expect(createResizer).not.toHaveBeenCalled()
    })

    it('should not create resizers when left panels are fixed size', () => {
        const fixedConfigs = {
            panel1: { defaultSize: 200, minSize: 200, maxSize: 200 },
            panel2: { defaultSize: 200, minSize: 200, maxSize: 200 },
            panel3: { defaultSize: 200, minSize: 200, maxSize: 200 },
        }

        const { result } = renderHook(() =>
            useResizers(createResizer, fixedConfigs, order),
        )

        expect(result.current).toEqual({
            panel1: undefined,
            panel2: undefined,
            panel3: undefined,
        })
        expect(createResizer).not.toHaveBeenCalled()
    })
})
