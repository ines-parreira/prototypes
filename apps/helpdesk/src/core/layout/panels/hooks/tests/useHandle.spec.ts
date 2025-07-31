import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import { assumeMock } from 'utils/testing'

import type { ContextValue } from '../../Context'
import type { HandleState } from '../../types'
import useHandle from '../useHandle'
import usePanels from '../usePanels'

jest.mock('../usePanels', () => jest.fn())
const usePanelsMock = assumeMock(usePanels)

describe('useHandle', () => {
    let addHandle: jest.Mock

    beforeEach(() => {
        addHandle = jest.fn()
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
            listener({ onResizeStart: jest.fn() })
        })
        expect(result.current).toEqual({ onResizeStart: expect.any(Function) })
    })
})
