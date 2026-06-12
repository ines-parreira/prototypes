import { renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockUpdateMacroHandler,
    mockUpdateMacroResponse,
} from '@gorgias/helpdesk-mocks'

import { useAppDispatch } from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { useUpdateMacro } from '../useUpdateMacro'

jest.mock('hooks/useAppDispatch', () => ({ useAppDispatch: jest.fn() }))
const useAppDispatchMock = jest.mocked(useAppDispatch)

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

function renderUseUpdateMacro(errorMessage?: string) {
    return renderHook(() => useUpdateMacro(errorMessage))
}

describe('useUpdateMacro', () => {
    beforeEach(() => {
        useAppDispatchMock.mockReturnValue(jest.fn())
    })

    it('should update a macro and notify on success', async () => {
        const updateMacroMock = mockUpdateMacroHandler(async () =>
            HttpResponse.json(mockUpdateMacroResponse({ id: 111 })),
        )
        const waitForUpdateMacroRequest = updateMacroMock.waitForRequest(server)
        server.use(updateMacroMock.handler)
        const { result } = renderUseUpdateMacro()

        await result.current.mutateAsync({
            id: 1,
            data: {
                name: 'New Name',
            },
        })

        await waitForUpdateMacroRequest(async (request) => {
            expect(new URL(request.url).pathname).toContain('/macros/1')
            expect(await request.json()).toEqual({ name: 'New Name' })
        })
        expect(notify).toHaveBeenNthCalledWith(1, {
            message: 'Successfully updated macro',
            status: NotificationStatus.Success,
        })
    })

    it('should handle failed request', async () => {
        const errorMessage = 'nope'
        server.use(
            mockUpdateMacroHandler(async () =>
                HttpResponse.json({ error: {} } as never, { status: 400 }),
            ).handler,
        )
        const { result } = renderUseUpdateMacro(errorMessage)

        await expect(
            result.current.mutateAsync({
                id: 1,
                data: {
                    name: 'New Name',
                },
            }),
        ).rejects.toBeDefined()

        await waitFor(() => {
            expect(notify).toHaveBeenNthCalledWith(1, {
                title: errorMessage,
                status: NotificationStatus.Error,
                allowHTML: true,
                message: null,
            })
        })
    })
})
