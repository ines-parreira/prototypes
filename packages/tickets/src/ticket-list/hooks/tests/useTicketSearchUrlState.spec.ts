import { useSearchParams } from '@repo/routing'
import { renderHook } from '@testing-library/react'
import { compressToEncodedURIComponent } from 'lz-string'

import { useTicketSearchUrlState } from '../useTicketSearchUrlState'

vi.mock('@repo/routing', () => ({
    useSearchParams: vi.fn(),
}))

describe('useTicketSearchUrlState', () => {
    const setSearchParamsMock = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('reads query, compressed filters, and cursor from the URL state', () => {
        vi.mocked(useSearchParams).mockReturnValue([
            new URLSearchParams({
                q: 'hello',
                filters: compressToEncodedURIComponent(
                    "eq(ticket.channel, 'chat')",
                ),
                cursor: 'next-page',
            }),
            setSearchParamsMock,
        ])

        const { result } = renderHook(() => useTicketSearchUrlState())

        expect(result.current.query).toBe('hello')
        expect(result.current.filters).toBe("eq(ticket.channel, 'chat')")
        expect(result.current.cursor).toBe('next-page')
    })

    it('sets the query and clears the cursor', () => {
        vi.mocked(useSearchParams).mockReturnValue([
            new URLSearchParams('q=old&cursor=next-page'),
            setSearchParamsMock,
        ])

        const { result } = renderHook(() => useTicketSearchUrlState())

        result.current.setQuery('updated')

        expect(setSearchParamsMock).toHaveBeenCalledOnce()

        const updater = setSearchParamsMock.mock.calls[0]?.[0] as ({
            draft,
        }: {
            draft: Record<string, string>
        }) => Record<string, string>

        expect(updater({ draft: { q: 'old', cursor: 'next-page' } })).toEqual({
            q: 'updated',
        })
    })

    it('removes the query and cursor when the query is cleared', () => {
        vi.mocked(useSearchParams).mockReturnValue([
            new URLSearchParams('q=old&cursor=next-page'),
            setSearchParamsMock,
        ])

        const { result } = renderHook(() => useTicketSearchUrlState())

        result.current.setQuery('')

        const updater = setSearchParamsMock.mock.calls[0]?.[0] as ({
            draft,
        }: {
            draft: Record<string, string>
        }) => Record<string, string>

        expect(updater({ draft: { q: 'old', cursor: 'next-page' } })).toEqual(
            {},
        )
    })

    it('sets and clears the cursor without touching the query', () => {
        vi.mocked(useSearchParams).mockReturnValue([
            new URLSearchParams('q=hello'),
            setSearchParamsMock,
        ])

        const { result } = renderHook(() => useTicketSearchUrlState())

        result.current.setCursor('next-page')
        let updater = setSearchParamsMock.mock.calls[0]?.[0] as ({
            draft,
        }: {
            draft: Record<string, string>
        }) => Record<string, string>
        expect(updater({ draft: { q: 'hello' } })).toEqual({
            q: 'hello',
            cursor: 'next-page',
        })

        result.current.setCursor(undefined)
        updater = setSearchParamsMock.mock.calls[1]?.[0] as ({
            draft,
        }: {
            draft: Record<string, string>
        }) => Record<string, string>
        expect(updater({ draft: { q: 'hello', cursor: 'next-page' } })).toEqual(
            {
                q: 'hello',
            },
        )
    })
})
