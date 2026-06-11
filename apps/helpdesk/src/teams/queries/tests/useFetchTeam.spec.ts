import { createElement } from 'react'

import { assumeMock, renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockGetTeamHandler } from '@gorgias/helpdesk-mocks'

import { useAppDispatch } from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { useFetchTeam } from '../useFetchTeam'

jest.mock('hooks/useAppDispatch', () => ({ useAppDispatch: jest.fn() }))
const useAppDispatchMock = assumeMock(useAppDispatch)

jest.mock('state/notifications/actions')

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
    jest.clearAllMocks()
})

afterAll(() => {
    server.close()
})

describe('useFetchTeam', () => {
    const dispatchMock = jest.fn()

    beforeEach(() => {
        useAppDispatchMock.mockReturnValue(dispatchMock)
    })

    function renderUseFetchTeam(id: number) {
        const queryClient = mockQueryClient()

        return renderHook(() => useFetchTeam(id), {
            wrapper: ({ children }) =>
                createElement(
                    QueryClientProvider,
                    { client: queryClient },
                    children,
                ),
        })
    }

    it('should handle request', async () => {
        const id = 1
        const mockGetTeam = mockGetTeamHandler()
        const waitForGetTeamRequest = mockGetTeam.waitForRequest(server)
        server.use(mockGetTeam.handler)

        renderUseFetchTeam(id)

        await waitForGetTeamRequest((request) => {
            expect(new URL(request.url).pathname).toContain(`/teams/${id}`)
        })

        expect(notify).not.toHaveBeenCalled()
    })

    it('should handle failed request', async () => {
        const id = 1
        const msg = 'nope'
        const mockGetTeam = mockGetTeamHandler(async () =>
            HttpResponse.json({ error: { msg } } as never, { status: 500 }),
        )
        server.use(mockGetTeam.handler)

        renderUseFetchTeam(id)

        await waitFor(() => {
            expect(notify).toHaveBeenNthCalledWith(1, {
                title: msg,
                allowHTML: true,
                message: null,
                status: NotificationStatus.Error,
            })
        })
    })
})
