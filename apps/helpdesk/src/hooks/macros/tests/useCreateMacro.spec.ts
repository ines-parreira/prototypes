import { renderHook } from '@repo/testing'
import { screen } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockCreateMacroHandler,
    mockCreateMacroResponse,
} from '@gorgias/helpdesk-mocks'

import { useCreateMacro } from '../useCreateMacro'

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
        const toastEl = await screen.findByRole('status', {
            name: 'Successfully created macro',
        })
        expect(toastEl).toHaveAttribute('data-intent', 'success')
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

        const toastEl = await screen.findByRole('status', {
            name: errorMessage,
        })
        expect(toastEl).toHaveAttribute('data-intent', 'destructive')
    })
})
