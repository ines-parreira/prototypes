import { act, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { renderHook } from '../../tests/render.utils'
import { useTicketViewNavigation } from '../useTicketViewNavigation'

describe('useTicketViewNavigation', () => {
    describe('when not in a view context', () => {
        it('should return ticket view navigation state', () => {
            const { result } = renderHook(() => useTicketViewNavigation(), {
                initialEntries: ['/app/ticket/123'],
                path: '/app/ticket/:ticketId',
            })

            expect(result.current.ticketViewNavigation).toBeDefined()
        })

        it('should navigate to ticket without viewId', () => {
            const { result } = renderHook(() => useTicketViewNavigation(), {
                initialEntries: ['/app/ticket/123'],
                path: '/app/ticket/:ticketId',
            })

            act(() => {
                result.current.navigateToTicket(456)
            })

            waitFor(() => {
                expect(window.location.pathname).toBe('/app/ticket/456')
            })
        })
    })

    describe('when in a view context', () => {
        it('should navigate to previous ticket in view', () => {
            const { result } = renderHook(() => useTicketViewNavigation(), {
                initialEntries: ['/app/views/1/123'],
                path: '/app/views/:viewId/:ticketId',
                ticketViewNavigation: {
                    shouldDisplay: true,
                    shouldUseLegacyFunctions: false,
                    previousTicketId: 122,
                    nextTicketId: 124,
                    legacyGoToPrevTicket: vi.fn(),
                    isPreviousEnabled: true,
                    legacyGoToNextTicket: vi.fn(),
                    isNextEnabled: true,
                },
            })

            act(() => {
                result.current.handleGoToPreviousViewTicket()
            })

            waitFor(() => {
                expect(window.location.pathname).toBe('/app/views/1/122')
            })
        })

        it('should navigate to next ticket in view', () => {
            const { result } = renderHook(() => useTicketViewNavigation(), {
                initialEntries: ['/app/views/1/123'],
                path: '/app/views/:viewId/:ticketId',
                ticketViewNavigation: {
                    shouldDisplay: true,
                    shouldUseLegacyFunctions: false,
                    previousTicketId: 122,
                    nextTicketId: 124,
                    legacyGoToPrevTicket: vi.fn(),
                    isPreviousEnabled: true,
                    legacyGoToNextTicket: vi.fn(),
                    isNextEnabled: true,
                },
            })

            act(() => {
                result.current.handleGoToNextViewTicket()
            })

            waitFor(() => {
                expect(window.location.pathname).toBe('/app/views/1/124')
            })
        })

        it('should navigate to ticket with viewId', () => {
            const { result } = renderHook(() => useTicketViewNavigation(), {
                initialEntries: ['/app/views/1/123'],
                path: '/app/views/:viewId/:ticketId',
            })

            act(() => {
                result.current.navigateToTicket(456)
            })

            waitFor(() => {
                expect(window.location.pathname).toBe('/app/views/1/456')
            })
        })
    })

    describe('legacy navigation fallback', () => {
        it('should call legacyGoToPrevTicket when shouldUseLegacyFunctions is true', () => {
            const legacyGoToPrevTicket = vi.fn()
            const { result } = renderHook(() => useTicketViewNavigation(), {
                initialEntries: ['/app/views/1/123'],
                path: '/app/views/:viewId/:ticketId',
                ticketViewNavigation: {
                    shouldDisplay: true,
                    shouldUseLegacyFunctions: true,
                    previousTicketId: 122,
                    nextTicketId: 124,
                    legacyGoToPrevTicket,
                    isPreviousEnabled: true,
                    legacyGoToNextTicket: vi.fn(),
                    isNextEnabled: true,
                },
            })

            act(() => {
                result.current.handleGoToPreviousViewTicket()
            })

            expect(legacyGoToPrevTicket).toHaveBeenCalledTimes(1)
        })

        it('should call legacyGoToNextTicket when shouldUseLegacyFunctions is true', () => {
            const legacyGoToNextTicket = vi.fn()
            const { result } = renderHook(() => useTicketViewNavigation(), {
                initialEntries: ['/app/views/1/123'],
                path: '/app/views/:viewId/:ticketId',
                ticketViewNavigation: {
                    shouldDisplay: true,
                    shouldUseLegacyFunctions: true,
                    previousTicketId: 122,
                    nextTicketId: 124,
                    legacyGoToPrevTicket: vi.fn(),
                    isPreviousEnabled: true,
                    legacyGoToNextTicket,
                    isNextEnabled: true,
                },
            })

            act(() => {
                result.current.handleGoToNextViewTicket()
            })

            expect(legacyGoToNextTicket).toHaveBeenCalledTimes(1)
        })
    })

    describe('edge cases', () => {
        it('should not navigate when viewId is missing and previousTicketId is available', () => {
            const { result } = renderHook(() => useTicketViewNavigation(), {
                initialEntries: ['/app/ticket/123'],
                path: '/app/ticket/:ticketId',
                ticketViewNavigation: {
                    shouldDisplay: true,
                    shouldUseLegacyFunctions: false,
                    previousTicketId: 122,
                    nextTicketId: 124,
                    legacyGoToPrevTicket: vi.fn(),
                    isPreviousEnabled: true,
                    legacyGoToNextTicket: vi.fn(),
                    isNextEnabled: true,
                },
            })

            const initialPathname = window.location.pathname

            act(() => {
                result.current.handleGoToPreviousViewTicket()
            })

            expect(window.location.pathname).toBe(initialPathname)
        })

        it('should not navigate when viewId is missing and nextTicketId is available', () => {
            const { result } = renderHook(() => useTicketViewNavigation(), {
                initialEntries: ['/app/ticket/123'],
                path: '/app/ticket/:ticketId',
                ticketViewNavigation: {
                    shouldDisplay: true,
                    shouldUseLegacyFunctions: false,
                    previousTicketId: 122,
                    nextTicketId: 124,
                    legacyGoToPrevTicket: vi.fn(),
                    isPreviousEnabled: true,
                    legacyGoToNextTicket: vi.fn(),
                    isNextEnabled: true,
                },
            })

            const initialPathname = window.location.pathname

            act(() => {
                result.current.handleGoToNextViewTicket()
            })

            expect(window.location.pathname).toBe(initialPathname)
        })
    })
})
