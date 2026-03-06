import { act } from '@testing-library/react'

import { mockTicketCompact } from '@gorgias/helpdesk-mocks'

import { renderHook } from '../../../tests/render.utils'
import { useTicketSelection } from '../useTicketSelection'

const tickets = [
    mockTicketCompact({ id: 1 }),
    mockTicketCompact({ id: 2 }),
    mockTicketCompact({ id: 3 }),
]

function setup() {
    return renderHook(() => useTicketSelection(tickets))
}

describe('useTicketSelection', () => {
    it('returns empty initial state', () => {
        const { result } = setup()

        expect(result.current.hasSelectedAll).toBe(false)
        expect(result.current.selectedTicketIds.size).toBe(0)
        expect(result.current.selectionCount).toBe(0)
        expect(result.current.hasAnySelection).toBe(false)
    })

    it('onSelect adds a ticket id and sets hasAnySelection', () => {
        const { result } = setup()

        act(() => result.current.onSelect({ id: 1, selected: true }))

        expect(result.current.selectedTicketIds.has(1)).toBe(true)
        expect(result.current.selectionCount).toBe(1)
        expect(result.current.hasAnySelection).toBe(true)
    })

    it('onSelect deselects a ticket id', () => {
        const { result } = setup()

        act(() => result.current.onSelect({ id: 1, selected: true }))
        act(() => result.current.onSelect({ id: 1, selected: false }))

        expect(result.current.selectedTicketIds.has(1)).toBe(false)
        expect(result.current.selectionCount).toBe(0)
        expect(result.current.hasAnySelection).toBe(false)
    })

    describe('onSelectAll', () => {
        it.each([
            { selected: true, expected: true },
            { selected: false, expected: false },
        ])(
            'sets hasSelectedAll to $expected when called with $selected',
            ({ selected, expected }) => {
                const { result } = setup()

                act(() => result.current.onSelectAll(selected))

                expect(result.current.hasSelectedAll).toBe(expected)
            },
        )

        it('clears selectedTicketIds when selecting all', () => {
            const { result } = setup()

            act(() => result.current.onSelect({ id: 1, selected: true }))
            act(() => result.current.onSelectAll(true))

            expect(result.current.selectedTicketIds.size).toBe(0)
            expect(result.current.hasSelectedAll).toBe(true)
        })
    })

    it('shift+click selects a range between previous and current ticket', () => {
        const { result } = setup()

        act(() =>
            result.current.onSelect({ id: 1, selected: true, shiftKey: false }),
        )
        act(() =>
            result.current.onSelect({ id: 3, selected: true, shiftKey: true }),
        )

        expect(result.current.selectedTicketIds.has(1)).toBe(true)
        expect(result.current.selectedTicketIds.has(2)).toBe(true)
        expect(result.current.selectedTicketIds.has(3)).toBe(true)
        expect(result.current.selectionCount).toBe(3)
    })

    it('selecting while hasSelectedAll=true clears hasSelectedAll and starts fresh', () => {
        const { result } = setup()

        act(() => result.current.onSelectAll(true))
        act(() => result.current.onSelect({ id: 1, selected: true }))

        expect(result.current.hasSelectedAll).toBe(false)
        expect(result.current.selectedTicketIds.size).toBe(0)
    })

    it('clear resets all selection state', () => {
        const { result } = setup()

        act(() => result.current.onSelect({ id: 1, selected: true }))
        act(() => result.current.onSelectAll(true))
        act(() => result.current.clear())

        expect(result.current.hasSelectedAll).toBe(false)
        expect(result.current.selectedTicketIds.size).toBe(0)
        expect(result.current.hasAnySelection).toBe(false)
    })
})
