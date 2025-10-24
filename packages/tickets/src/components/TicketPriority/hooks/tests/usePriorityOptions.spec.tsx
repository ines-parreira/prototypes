import { TicketPriority } from '@gorgias/helpdesk-queries'

import { renderHook } from '../../../../tests/render.utils'
import { usePriorityOptions } from '../usePriorityOptions'

describe('usePriorityOptions', () => {
    it('should return all priority options', () => {
        const { result } = renderHook(() =>
            usePriorityOptions({ currentPriority: undefined }),
        )

        expect(result.current.priorityOptions).toHaveLength(4)
        expect(result.current.priorityOptions).toEqual([
            { id: TicketPriority.Low, label: 'Low' },
            { id: TicketPriority.Normal, label: 'Normal' },
            { id: TicketPriority.High, label: 'High' },
            { id: TicketPriority.Critical, label: 'Critical' },
        ])
    })

    it('should return "Normal" as selected option when no priority is provided', () => {
        const { result } = renderHook(() =>
            usePriorityOptions({ currentPriority: undefined }),
        )

        expect(result.current.selectedOption).toEqual({
            id: TicketPriority.Normal,
            label: 'Normal',
        })
    })

    it('should return correct selected option when priority is "low"', () => {
        const { result } = renderHook(() =>
            usePriorityOptions({ currentPriority: TicketPriority.Low }),
        )

        expect(result.current.selectedOption).toEqual({
            id: TicketPriority.Low,
            label: 'Low',
        })
    })

    it('should update selected option when priority changes', () => {
        const { result, rerender } = renderHook(
            ({ priority }: { priority: TicketPriority }) =>
                usePriorityOptions({ currentPriority: priority }),
            {
                initialProps: {
                    priority: TicketPriority.Low as TicketPriority,
                },
            },
        )

        expect(result.current.selectedOption).toEqual({
            id: TicketPriority.Low,
            label: 'Low',
        })

        rerender({ priority: TicketPriority.Critical })

        expect(result.current.selectedOption).toEqual({
            id: TicketPriority.Critical,
            label: 'Critical',
        })
    })
})
