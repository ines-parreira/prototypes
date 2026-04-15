import { useListMessages } from '@gorgias/helpdesk-queries'

import { renderHook } from '../../../tests/render.utils'
import { useListTicketMessages } from '../useListTicketMessages'

vi.mock('@gorgias/helpdesk-queries', async () => {
    const actual = await vi.importActual('@gorgias/helpdesk-queries')

    return {
        ...actual,
        useListMessages: vi.fn(),
    }
})

describe('useListTicketMessages select fallback', () => {
    afterEach(() => {
        vi.clearAllMocks()
    })

    it('returns an empty array when the selected response has no nested message list', () => {
        vi.mocked(useListMessages).mockImplementation((_params, options) => {
            return {
                data: options?.query?.select?.({
                    data: undefined,
                } as any),
            } as any
        })

        const { result } = renderHook(() =>
            useListTicketMessages({ ticketId: 456 }),
        )

        expect(useListMessages).toHaveBeenCalledWith(
            { ticket_id: 456 },
            expect.objectContaining({
                query: expect.objectContaining({
                    select: expect.any(Function),
                }),
            }),
        )
        expect(result.current).toEqual([])
    })
})
