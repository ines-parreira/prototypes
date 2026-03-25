import { act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderHook } from '../../tests/render.utils'
import * as useCachedTicketViewNavigationModule from '../useCachedTicketViewNavigation'
import { useTicketViewNavigation } from '../useTicketViewNavigation'

const mockPush = vi.fn()

const { useHistory } = vi.hoisted(() => ({
    useHistory: vi.fn(),
}))

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useHistory,
    }
})

describe('useTicketViewNavigation', () => {
    beforeEach(() => {
        vi.restoreAllMocks()
        mockPush.mockReset()
        useHistory.mockReturnValue({ push: mockPush })
    })

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

            expect(mockPush).toHaveBeenCalledWith('/app/ticket/456')
            expect(mockPush).toHaveBeenCalledTimes(1)
        })
    })

    describe('when in a view context', () => {
        it('should navigate to previous ticket in view from cache', () => {
            vi.spyOn(
                useCachedTicketViewNavigationModule,
                'useCachedTicketViewNavigation',
            ).mockReturnValue({
                shouldDisplay: true,
                shouldUseLegacyFunctions: false,
                previousTicketId: 122,
                nextTicketId: 124,
                legacyGoToPrevTicket: vi.fn(),
                isPreviousEnabled: true,
                legacyGoToNextTicket: vi.fn(),
                isNextEnabled: true,
            })

            const { result } = renderHook(() => useTicketViewNavigation(), {
                initialEntries: ['/app/views/1/123'],
                path: '/app/views/:viewId/:ticketId',
            })

            act(() => {
                result.current.handleGoToPreviousViewTicket()
            })

            expect(mockPush).toHaveBeenCalledWith('/app/views/1/122')
            expect(mockPush).toHaveBeenCalledTimes(1)
        })

        it('should navigate to next ticket in view from cache', () => {
            vi.spyOn(
                useCachedTicketViewNavigationModule,
                'useCachedTicketViewNavigation',
            ).mockReturnValue({
                shouldDisplay: true,
                shouldUseLegacyFunctions: false,
                previousTicketId: 122,
                nextTicketId: 124,
                legacyGoToPrevTicket: vi.fn(),
                isPreviousEnabled: true,
                legacyGoToNextTicket: vi.fn(),
                isNextEnabled: true,
            })

            const { result } = renderHook(() => useTicketViewNavigation(), {
                initialEntries: ['/app/views/1/123'],
                path: '/app/views/:viewId/:ticketId',
            })

            act(() => {
                result.current.handleGoToNextViewTicket()
            })

            expect(mockPush).toHaveBeenCalledWith('/app/views/1/124')
            expect(mockPush).toHaveBeenCalledTimes(1)
        })

        it('should navigate to ticket with viewId', () => {
            const { result } = renderHook(() => useTicketViewNavigation(), {
                initialEntries: ['/app/views/1/123'],
                path: '/app/views/:viewId/:ticketId',
            })

            act(() => {
                result.current.navigateToTicket(456)
            })

            expect(mockPush).toHaveBeenCalledWith('/app/views/1/456')
            expect(mockPush).toHaveBeenCalledTimes(1)
        })

        it('should prefer cache navigation over legacy hidden state', () => {
            vi.spyOn(
                useCachedTicketViewNavigationModule,
                'useCachedTicketViewNavigation',
            ).mockReturnValue({
                shouldDisplay: true,
                shouldUseLegacyFunctions: false,
                previousTicketId: 122,
                nextTicketId: 124,
                legacyGoToPrevTicket: vi.fn(),
                isPreviousEnabled: true,
                legacyGoToNextTicket: vi.fn(),
                isNextEnabled: true,
            })

            const { result } = renderHook(() => useTicketViewNavigation(), {
                initialEntries: ['/app/views/1/123'],
                path: '/app/views/:viewId/:ticketId',
                ticketViewNavigation: {
                    shouldDisplay: false,
                    shouldUseLegacyFunctions: true,
                    previousTicketId: undefined,
                    nextTicketId: undefined,
                    legacyGoToPrevTicket: vi.fn(),
                    isPreviousEnabled: false,
                    legacyGoToNextTicket: vi.fn(),
                    isNextEnabled: false,
                },
            })

            expect(result.current.ticketViewNavigation).toMatchObject({
                shouldDisplay: true,
                shouldUseLegacyFunctions: false,
                previousTicketId: 122,
                nextTicketId: 124,
                isPreviousEnabled: true,
                isNextEnabled: true,
            })
        })

        it('should keep using legacy navigation until list-derived navigation becomes available', () => {
            const cachedNavigationState = {
                current: undefined as
                    | ReturnType<
                          typeof useCachedTicketViewNavigationModule.useCachedTicketViewNavigation
                      >
                    | undefined,
            }

            vi.spyOn(
                useCachedTicketViewNavigationModule,
                'useCachedTicketViewNavigation',
            ).mockImplementation(() => cachedNavigationState.current)

            const { result, rerender } = renderHook(
                () => useTicketViewNavigation(),
                {
                    initialEntries: ['/app/views/1/123'],
                    path: '/app/views/:viewId/:ticketId',
                    ticketViewNavigation: {
                        shouldDisplay: true,
                        shouldUseLegacyFunctions: true,
                        previousTicketId: 900,
                        nextTicketId: 901,
                        legacyGoToPrevTicket: vi.fn(),
                        isPreviousEnabled: true,
                        legacyGoToNextTicket: vi.fn(),
                        isNextEnabled: true,
                    },
                },
            )

            expect(result.current.ticketViewNavigation).toMatchObject({
                shouldUseLegacyFunctions: true,
                previousTicketId: 900,
                nextTicketId: 901,
            })

            cachedNavigationState.current = {
                shouldDisplay: true,
                shouldUseLegacyFunctions: false,
                previousTicketId: 122,
                nextTicketId: 124,
                legacyGoToPrevTicket: vi.fn(),
                isPreviousEnabled: true,
                legacyGoToNextTicket: vi.fn(),
                isNextEnabled: true,
            }

            rerender()

            expect(result.current.ticketViewNavigation).toMatchObject({
                shouldUseLegacyFunctions: false,
                previousTicketId: 122,
                nextTicketId: 124,
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

            act(() => {
                result.current.handleGoToPreviousViewTicket()
            })

            expect(mockPush).not.toHaveBeenCalled()
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

            act(() => {
                result.current.handleGoToNextViewTicket()
            })

            expect(mockPush).not.toHaveBeenCalled()
        })
    })
})
