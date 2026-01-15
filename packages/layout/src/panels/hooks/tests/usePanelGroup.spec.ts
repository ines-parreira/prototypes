import { renderHook } from '@testing-library/react'
import { vi } from 'vitest'

import type { ContextValue } from '../../Context'
import { usePanelGroup } from '../usePanelGroup'
import { usePanels } from '../usePanels'

vi.mock('../usePanels', () => ({ usePanels: vi.fn() }))
const usePanelsMock = vi.mocked(usePanels)

describe('usePanelGroup', () => {
    let subtractSize: ReturnType<typeof vi.fn>

    beforeEach(() => {
        subtractSize = vi.fn()
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
