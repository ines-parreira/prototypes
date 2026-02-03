import type { ReactNode } from 'react'

import { renderHook } from '@repo/testing'

import { TicketModalProvider } from '../../components/TicketModalProvider'
import { useTicketModalContext } from '../useTicketModalContext'

describe('useTicketModalContext', () => {
    it('returns default values when used outside the provider', () => {
        const { result } = renderHook(() => useTicketModalContext())

        expect(result.current.isInsideTicketModal).toBe(false)
        expect(result.current.containerRef).toBeNull()
    })

    it('returns context values when used inside the provider', () => {
        const wrapper = ({ children }: { children?: ReactNode }) => (
            <TicketModalProvider>{children}</TicketModalProvider>
        )

        const { result } = renderHook(() => useTicketModalContext(), {
            wrapper,
        })

        expect(result.current.isInsideTicketModal).toBe(true)
        expect(result.current.containerRef).not.toBeNull()
        expect(result.current.containerRef?.current).toBeInstanceOf(
            HTMLDivElement,
        )
        expect(result.current.containerRef?.current).toHaveClass('container')
    })

    it('returns stable reference to containerRef', () => {
        const wrapper = ({ children }: { children?: ReactNode }) => (
            <TicketModalProvider>{children}</TicketModalProvider>
        )

        const { result, rerender } = renderHook(() => useTicketModalContext(), {
            wrapper,
        })

        const firstRef = result.current.containerRef

        rerender()

        const secondRef = result.current.containerRef

        expect(firstRef).toBe(secondRef)
    })
})
