import {act, renderHook} from '@testing-library/react-hooks'

import {TicketSummary} from '../../types'
import useSelection from '../useSelection'

describe('useSelection', () => {
    const dummyTickets = [
        {id: 1},
        {id: 2},
        {id: 3},
        {id: 4},
        {id: 5},
        {id: 6},
        {id: 7},
        {id: 8},
        {id: 9},
        {id: 10},
    ] as TicketSummary[]

    it('should return a map of selected tickets and a function to select tickets', () => {
        const {result} = renderHook(() => useSelection(dummyTickets))

        expect(result.current).toEqual({
            onSelect: expect.any(Function),
            selectedTickets: {},
        })
    })

    it('should select a single ticket', () => {
        const {result} = renderHook(() => useSelection(dummyTickets))
        act(() => {
            result.current.onSelect(1, true, false)
        })

        expect(result.current.selectedTickets).toEqual({1: true})
    })

    it('should deselect a single ticket', () => {
        const {result} = renderHook(() => useSelection(dummyTickets))
        act(() => {
            result.current.onSelect(1, true, false)
        })
        act(() => {
            result.current.onSelect(1, false, false)
        })

        expect(result.current.selectedTickets).toEqual({})
    })

    it('should select a range of tickets', () => {
        const {result} = renderHook(() => useSelection(dummyTickets))
        act(() => {
            result.current.onSelect(1, true, false)
        })
        act(() => {
            result.current.onSelect(5, true, true)
        })

        expect(result.current.selectedTickets).toEqual({
            1: true,
            2: true,
            3: true,
            4: true,
            5: true,
        })
    })

    it('should deselect a range of tickets', () => {
        const {result} = renderHook(() => useSelection(dummyTickets))
        act(() => {
            result.current.onSelect(1, true, false)
        })
        act(() => {
            result.current.onSelect(5, true, true)
        })
        act(() => {
            result.current.onSelect(2, false, false)
        })
        act(() => {
            result.current.onSelect(4, false, true)
        })

        expect(result.current.selectedTickets).toEqual({
            1: true,
            5: true,
        })
    })

    it('should return the currently selected tickets if a selected ticket is not in the ticket list', () => {
        const {result} = renderHook(() => useSelection(dummyTickets))
        act(() => {
            result.current.onSelect(1, true, false)
        })
        act(() => {
            result.current.onSelect(11, true, true)
        })

        expect(result.current.selectedTickets).toEqual({
            1: true,
        })
    })
})
