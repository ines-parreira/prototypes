import { renderHook } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { listVoiceCalls } from '@gorgias/helpdesk-client'
import { queryKeys } from '@gorgias/helpdesk-queries'
import type { VoiceCall } from '@gorgias/helpdesk-types'

import { useExhaustEndpoint } from 'hooks/useExhaustEndpoint'
import { TICKET_QUERIES_DEFAULT_CONFIG } from 'tickets/ticket-detail/constants'

import { useAllVoiceCalls } from '../useAllVoiceCalls'

jest.mock('@gorgias/helpdesk-client', () => ({
    listVoiceCalls: jest.fn(),
}))
const listVoiceCallsMock = listVoiceCalls as jest.Mock

jest.mock('hooks/useExhaustEndpoint', () => ({
    useExhaustEndpoint: jest.fn(),
}))
const useExhaustEndpointMock = useExhaustEndpoint as jest.Mock

function createWrapper() {
    const queryClient = new QueryClient()
    return ({ children }: { children?: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}

describe('useAllVoiceCalls', () => {
    it('calls useExhaustEndpoint with correct params and returns transformed result', async () => {
        const mockData = [{ id: 1 }, { id: 2 }] as VoiceCall[]
        useExhaustEndpointMock.mockReturnValue({
            data: mockData,
            isLoading: false,
        })

        const { result } = renderHook(() => useAllVoiceCalls(123), {
            wrapper: createWrapper(),
        })

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

    it('calls listVoiceCalls with the correct params', () => {
        useExhaustEndpointMock.mockReturnValue({ data: [], isLoading: true })
        renderHook(() => useAllVoiceCalls(123), { wrapper: createWrapper() })

        const [[, fetchData]] = useExhaustEndpointMock.mock.calls as [
            [VoiceCall[], (cursor?: string) => void],
        ]
        fetchData()

        expect(listVoiceCallsMock).toHaveBeenCalledWith({
            cursor: undefined,
            ticket_id: 123,
            limit: 100,
        })
    })

    it('returns loading state when endpoint hook is loading', async () => {
        useExhaustEndpointMock.mockReturnValue({ data: [], isLoading: true })
        const { result } = renderHook(() => useAllVoiceCalls(123), {
            wrapper: createWrapper(),
        })

        expect(result.current).toEqual({ voiceCalls: [], isLoading: true })
    })
})
