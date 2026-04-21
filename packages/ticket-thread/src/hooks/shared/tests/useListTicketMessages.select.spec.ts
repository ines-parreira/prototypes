import { useListAllMessages } from '@gorgias/helpdesk-queries'

import { renderHook } from '../../../tests/render.utils'
import { useListTicketMessages } from '../useListTicketMessages'

vi.mock('@gorgias/helpdesk-queries', async () => {
    const actual = await vi.importActual('@gorgias/helpdesk-queries')

    return {
        ...actual,
        useListAllMessages: vi.fn(),
    }
})

describe('useListTicketMessages fallback', () => {
    afterEach(() => {
        vi.clearAllMocks()
    })

    it('returns an empty array when the exhausted query has no data yet', () => {
        vi.mocked(useListAllMessages).mockReturnValue({
            items: undefined,
        } as any)

        const { result } = renderHook(() =>
            useListTicketMessages({ ticketId: 456 }),
        )

        expect(useListAllMessages).toHaveBeenCalledWith(
            expect.objectContaining({
                ticket_id: 456,
                limit: 100,
            }),
            expect.objectContaining({
                exhaustPages: true,
                query: expect.objectContaining({
                    enabled: true,
                }),
            }),
        )
        expect(result.current).toEqual([])
    })
})
