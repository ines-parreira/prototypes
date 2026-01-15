import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'

import type { ContextValue } from '../../Context'
import { useContextValue } from '../../hooks/useContextValue'
import { Panels } from '../Panels'

vi.mock('../../hooks/useContextValue', () => ({ useContextValue: vi.fn() }))
const useContextValueMock = vi.mocked(useContextValue)

describe('Panels', () => {
    beforeEach(() => {
        useContextValueMock.mockReturnValue({ totalSize: 1000 } as ContextValue)
    })

    it('should render the panels and call the context', () => {
        render(<Panels size={1000}>boop</Panels>)
        const el = screen.getByText('boop')
        expect(el).toBeInTheDocument()
        expect(useContextValue).toHaveBeenCalledWith(el, 1000)
    })
})
