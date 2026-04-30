import { useFlag } from '@repo/feature-flags'
import { assumeMock, renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'
import { useLocation } from 'react-router-dom'

import { SplitTicketViewProvider } from 'split-ticket-view-toggle'

import useSplitTicketViewSwitcher from '../useSplitTicketViewSwitcher'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))
const useFlagMock = assumeMock(useFlag)

function useSwitcherLocation() {
    useSplitTicketViewSwitcher()
    return useLocation()
}

function renderSwitcherHook(route: string) {
    return renderHook(() => useSwitcherLocation(), {
        initialEntries: [route],
        wrapper: ({ children }: any) => (
            <SplitTicketViewProvider>{children}</SplitTicketViewProvider>
        ),
    })
}

describe('useSplitTicketViewSwitcher', () => {
    beforeEach(() => {
        useFlagMock.mockReturnValue(false)
    })

    afterAll(() => {
        localStorage.removeItem('split-ticket-view-enabled')
    })

    it('should do nothing is the deprecated ticket routes flag is active', () => {
        useFlagMock.mockReturnValue(true)
        const { result } = renderSwitcherHook('/app')
        expect(result.current.pathname).toBe('/app')
    })

    describe('Split view enabled', () => {
        beforeEach(() => {
            localStorage.setItem('split-ticket-view-enabled', 'true')
        })

        it('should redirect from /app to /app/views', async () => {
            const { result } = renderSwitcherHook('/app')

            await waitFor(() => {
                expect(result.current.pathname).toBe('/app/views')
            })
        })

        it('should keep query parameters', async () => {
            const { result } = renderSwitcherHook('/app?query=value')

            await waitFor(() => {
                expect(result.current.pathname).toBe('/app/views')
                expect(result.current.search).toBe('?query=value')
            })
        })

        it('should redirect from /app/tickets/VIEW_ID to /app/views/VIEW_ID', async () => {
            const { result } = renderSwitcherHook('/app/tickets/123')

            await waitFor(() => {
                expect(result.current.pathname).toBe('/app/views/123')
            })
        })

        it('should not redirect from /app/ticket/TICKET_ID/print', () => {
            const { result } = renderSwitcherHook('/app/ticket/123/print')

            expect(result.current.pathname).toBe('/app/ticket/123/print')
        })
    })

    describe('Split view disabled', () => {
        beforeEach(() => {
            localStorage.setItem('split-ticket-view-enabled', 'false')
        })

        it('should redirect from /app/views to /app', async () => {
            const { result } = renderSwitcherHook('/app/views')

            await waitFor(() => {
                expect(result.current.pathname).toBe('/app')
            })
        })

        it('should keep query parameters', async () => {
            const { result } = renderSwitcherHook('/app/views?query=value')

            await waitFor(() => {
                expect(result.current.pathname).toBe('/app')
                expect(result.current.search).toBe('?query=value')
            })
        })

        it('should redirect from /app/views/VIEW_ID to /app/tickets/VIEW_ID', async () => {
            const { result } = renderSwitcherHook('/app/views/123')

            await waitFor(() => {
                expect(result.current.pathname).toBe('/app/tickets/123')
            })
        })

        it('should redirect from /app/views/VIEW_ID/TICKET_ID to /app/ticket/TICKET_ID', async () => {
            const { result } = renderSwitcherHook('/app/views/123/456')

            await waitFor(() => {
                expect(result.current.pathname).toBe('/app/ticket/456')
            })
        })

        it('should not redirect from /app/ticket/TICKET_ID/print', () => {
            const { result } = renderSwitcherHook('/app/ticket/123/print')

            expect(result.current.pathname).toBe('/app/ticket/123/print')
        })
    })
})
