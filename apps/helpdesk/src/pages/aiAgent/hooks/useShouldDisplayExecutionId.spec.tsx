import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockGetCurrentUserHandler } from '@gorgias/helpdesk-mocks'

import { UserRole } from 'config/types/user'

import { useShouldDisplayExecutionId } from './useShouldDisplayExecutionId'

const server = setupServer()
const mockGetCurrentUser = mockGetCurrentUserHandler()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'warn' })
})

beforeEach(() => {
    server.use(mockGetCurrentUser.handler)
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('useShouldDisplayExecutionId', () => {
    const createWrapper = () => {
        const queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
            },
        })

        return ({ children }: { children: React.ReactNode }) => (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        )
    }

    it('returns true when the current user is a Gorgias agent', async () => {
        const { handler } = mockGetCurrentUserHandler(async () =>
            HttpResponse.json({
                ...mockGetCurrentUser.data,
                role: { name: UserRole.GorgiasAgent },
            }),
        )
        server.use(handler)

        const { result } = renderHook(() => useShouldDisplayExecutionId(), {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(result.current).toBe(true)
        })
    })

    it('returns false when the current user is not a Gorgias agent', async () => {
        const { handler } = mockGetCurrentUserHandler(async () =>
            HttpResponse.json({
                ...mockGetCurrentUser.data,
                role: { name: UserRole.Admin },
            }),
        )
        server.use(handler)

        const { result } = renderHook(() => useShouldDisplayExecutionId(), {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(result.current).toBe(false)
        })
    })
})
