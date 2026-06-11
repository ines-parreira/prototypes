import { createElement } from 'react'

import { assumeMock, renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockUpdateTeamHandler } from '@gorgias/helpdesk-mocks'

import { useAppDispatch } from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { useUpdateTeam } from '../useUpdateTeam'

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

describe('useUpdateTeam', () => {
    const dispatchMock = jest.fn()

    beforeEach(() => {
        useAppDispatchMock.mockReturnValue(dispatchMock)
    })

    function renderUseUpdateTeam(id = 1) {
        const queryClient = mockQueryClient()
        const invalidateQueriesSpy = jest.spyOn(
            queryClient,
            'invalidateQueries',
        )

        const hook = renderHook(() => useUpdateTeam(id), {
            wrapper: ({ children }) =>
                createElement(
                    QueryClientProvider,
                    { client: queryClient },
                    children,
                ),
        })

        return { ...hook, invalidateQueriesSpy }
    }

    it('should handle settled request', async () => {
        const mockUpdateTeam = mockUpdateTeamHandler()
        server.use(mockUpdateTeam.handler)
        const { result, invalidateQueriesSpy } = renderUseUpdateTeam()

        await result.current.mutateAsync({
            id: 111,
            data: { name: 'Support' },
        })

        expect(invalidateQueriesSpy).toHaveBeenCalled()
    })

    it('should handle failed request', async () => {
        const msg = 'nope'
        const mockUpdateTeam = mockUpdateTeamHandler(async () =>
            HttpResponse.json({ error: { msg } } as never, { status: 500 }),
        )
        server.use(mockUpdateTeam.handler)
        const { result } = renderUseUpdateTeam()

        await expect(
            result.current.mutateAsync({
                id: 111,
                data: { name: 'Support' },
            }),
        ).rejects.toEqual(expect.any(Error))

        await waitFor(() => {
            expect(notify).toHaveBeenNthCalledWith(1, {
                title: msg,
                allowHTML: true,
                message: null,
                status: NotificationStatus.Error,
            })
        })
    })

    it('should handle successful request', async () => {
        const mockUpdateTeam = mockUpdateTeamHandler()
        server.use(mockUpdateTeam.handler)
        const { result } = renderUseUpdateTeam()

        await result.current.mutateAsync({
            id: 111,
            data: { name: 'Support' },
        })

        expect(notify).toHaveBeenNthCalledWith(1, {
            message: 'Successfully updated team',
            status: NotificationStatus.Success,
        })
    })
})
