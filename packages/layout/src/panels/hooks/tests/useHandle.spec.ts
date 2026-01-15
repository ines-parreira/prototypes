import { act, renderHook } from '@testing-library/react'
import { vi } from 'vitest'

import type { ContextValue } from '../../Context'
import type { HandleState } from '../../types'
import { useHandle } from '../useHandle'
import { usePanels } from '../usePanels'

vi.mock('../usePanels', () => ({ usePanels: vi.fn() }))
const usePanelsMock = vi.mocked(usePanels)

describe('useHandle', () => {
    let addHandle: ReturnType<typeof vi.fn>

    beforeEach(() => {
        addHandle = vi.fn()
        usePanelsMock.mockReturnValue({ addHandle } as unknown as ContextValue)
    })

    it('should return the default handle state', () => {
        const { result } = renderHook(() => useHandle('123'))
        expect(result.current).toEqual({})
    })

    it('should return the updated handle state when the listener is called', () => {
        const { result } = renderHook(() => useHandle('123'))
        expect(addHandle).toHaveBeenCalledWith('123', expect.any(Function))
        const [[, listener]] = addHandle.mock.calls as [
            string,
            (state: HandleState) => void,
        ][]
        act(() => {
            listener({ onResizeStart: vi.fn() })
        })
        expect(result.current).toEqual({ onResizeStart: expect.any(Function) })
    })
})
