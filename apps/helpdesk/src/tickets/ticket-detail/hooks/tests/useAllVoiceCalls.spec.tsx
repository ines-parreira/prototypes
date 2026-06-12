import { renderHook } from '@repo/testing'

import { setupServer } from 'msw/node'
import { mockListVoiceCallsHandler } from '@gorgias/helpdesk-mocks'
import { queryKeys } from '@gorgias/helpdesk-queries'
import type { VoiceCall } from '@gorgias/helpdesk-types'

import { useExhaustEndpoint } from 'hooks/useExhaustEndpoint'
import { TICKET_QUERIES_DEFAULT_CONFIG } from 'tickets/ticket-detail/constants'

import { useAllVoiceCalls } from '../useAllVoiceCalls'

jest.mock('hooks/useExhaustEndpoint', () => ({
    useExhaustEndpoint: jest.fn(),
}))
const useExhaustEndpointMock = useExhaustEndpoint as jest.Mock

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('useAllVoiceCalls', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('calls useExhaustEndpoint with correct params and returns transformed result', async () => {
        const mockData = [{ id: 1 }, { id: 2 }] as VoiceCall[]
        useExhaustEndpointMock.mockReturnValue({
            data: mockData,
            isLoading: false,
        })

        const { result } = renderHook(() => useAllVoiceCalls(123))

        expect(useExhaustEndpointMock).toHaveBeenCalledWith(
            queryKeys.voiceCalls.listVoiceCalls({
                ticket_id: 123,
                limit: 100,
            }),
            expect.any(Function),
            TICKET_QUERIES_DEFAULT_CONFIG,
        )
        expect(result.current).toEqual({
            voiceCalls: mockData,
            isLoading: false,
        })
    })

    it('calls listVoiceCalls with the correct params', async () => {
        const listVoiceCallsMock = mockListVoiceCallsHandler()
        server.use(listVoiceCallsMock.handler)
        const waitForListVoiceCallsRequest =
            listVoiceCallsMock.waitForRequest(server)
        useExhaustEndpointMock.mockReturnValue({ data: [], isLoading: true })
        renderHook(() => useAllVoiceCalls(123))

        const [[, fetchData]] = useExhaustEndpointMock.mock.calls as [
            [VoiceCall[], (cursor?: string) => Promise<unknown>],
        ]
        void fetchData()

        await waitForListVoiceCallsRequest((request) => {
            const url = new URL(request.url)
            expect(url.searchParams.get('ticket_id')).toBe('123')
            expect(url.searchParams.get('limit')).toBe('100')
            expect(url.searchParams.get('cursor')).toBeNull()
        })
    })

    it('returns loading state when endpoint hook is loading', async () => {
        useExhaustEndpointMock.mockReturnValue({ data: [], isLoading: true })
        const { result } = renderHook(() => useAllVoiceCalls(123))

        expect(result.current).toEqual({ voiceCalls: [], isLoading: true })
    })
})
