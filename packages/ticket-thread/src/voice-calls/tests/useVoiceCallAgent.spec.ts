import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'

import {
    mockListUsersHandler,
    mockListUsersResponse,
    mockUser,
} from '@gorgias/helpdesk-mocks'

import { renderHook } from '../../tests/render.utils'
import { server } from '../../tests/server'
import { useVoiceCallAgent } from '../hooks/useVoiceCallAgent'

const testAgent = mockUser({ id: 42, name: 'Test Agent' })

beforeEach(() => {
    server.use(
        mockListUsersHandler(async () =>
            HttpResponse.json(
                mockListUsersResponse({
                    data: [testAgent],
                    meta: { prev_cursor: null, next_cursor: null },
                }),
            ),
        ).handler,
    )
})

describe('useVoiceCallAgent', () => {
    it('returns the agent matching the given id', async () => {
        const { result } = renderHook(() => useVoiceCallAgent(42))
        await waitFor(() => {
            expect(result.current).toBeDefined()
        })
        expect(result.current?.id).toBe(42)
        expect(result.current?.name).toBe('Test Agent')
    })

    it('returns undefined when agentId is null', async () => {
        const { result } = renderHook(() => useVoiceCallAgent(null))
        await waitFor(() => {
            expect(result.current).toBeUndefined()
        })
    })

    it('returns undefined when agentId is not in the list', async () => {
        const { result } = renderHook(() => useVoiceCallAgent(99))
        await waitFor(() => {
            expect(result.current).toBeUndefined()
        })
    })
})
