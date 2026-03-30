import { renderHook } from '@testing-library/react'

import { usePanels } from '../usePanels'

describe('usePanels', () => {
    it('should return a default context value when used outside a provider', () => {
        const { result } = renderHook(() => usePanels())

        expect(result.current).toEqual({
            addHandle: expect.any(Function),
            addPanel: expect.any(Function),
            subtractSize: expect.any(Function),
            totalSize: 0,
        })
    })

    it('should return noop cleanup functions from default context methods', () => {
        const { result } = renderHook(() => usePanels())

        const cleanupHandle = result.current.addHandle('id', () => {})
        const cleanupPanel = result.current.addPanel(
            'name',
            { defaultSize: 100, minSize: 0, maxSize: 200 },
            () => {},
        )
        const cleanupSize = result.current.subtractSize(100)

        expect(cleanupHandle).toEqual(expect.any(Function))
        expect(cleanupPanel).toEqual(expect.any(Function))
        expect(cleanupSize).toEqual(expect.any(Function))
    })
})
