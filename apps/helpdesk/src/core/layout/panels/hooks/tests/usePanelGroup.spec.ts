import { renderHook } from '@repo/testing'

import { assumeMock } from 'utils/testing'

import type { ContextValue } from '../../Context'
import usePanelGroup from '../usePanelGroup'
import usePanels from '../usePanels'

jest.mock('../usePanels', () => jest.fn())
const usePanelsMock = assumeMock(usePanels)

describe('usePanelGroup', () => {
    let subtractSize: jest.Mock

    beforeEach(() => {
        subtractSize = jest.fn()
        usePanelsMock.mockReturnValue({
            subtractSize,
        } as unknown as ContextValue)
    })

    it('should not subtract any size if none is given', () => {
        renderHook(() => usePanelGroup())
        expect(subtractSize).not.toHaveBeenCalled()
    })

    it('should subtract size if given', () => {
        renderHook(() => usePanelGroup(10))
        expect(subtractSize).toHaveBeenCalledWith(10)
    })
})
