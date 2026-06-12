import { renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockCreateMacroHandler,
    mockCreateMacroResponse,
} from '@gorgias/helpdesk-mocks'

import { useAppDispatch } from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { useCreateMacro } from '../useCreateMacro'

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

function renderUseCreateMacro() {
    return renderHook(() => useCreateMacro())
}

describe('useCreateMacro', () => {
    beforeEach(() => {
        useAppDispatchMock.mockReturnValue(jest.fn())
    })

    it('should create a macro and notify on success', async () => {
        const createMacroMock = mockCreateMacroHandler(async () =>
            HttpResponse.json(mockCreateMacroResponse({ id: 111 })),
        )
        const waitForCreateMacroRequest = createMacroMock.waitForRequest(server)
        server.use(createMacroMock.handler)
        const { result } = renderUseCreateMacro()

        await result.current.mutateAsync({
            data: {
                name: 'New Macro',
            },
        })

        await waitForCreateMacroRequest(async (request) => {
            expect(await request.json()).toEqual({ name: 'New Macro' })
        })
        expect(notify).toHaveBeenNthCalledWith(1, {
            message: 'Successfully created macro',
            status: NotificationStatus.Success,
        })
    })

    it('should handle failed request', async () => {
        const errorMessage = 'nope'
        server.use(
            mockCreateMacroHandler(async () =>
                HttpResponse.json({ error: { msg: errorMessage } } as never, {
                    status: 400,
                }),
            ).handler,
        )
        const { result } = renderUseCreateMacro()

        await expect(
            result.current.mutateAsync({
                data: {
                    name: 'New Macro',
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
