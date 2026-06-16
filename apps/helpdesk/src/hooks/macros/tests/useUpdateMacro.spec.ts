import { renderHook } from '@repo/testing'
import { screen } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockUpdateMacroHandler,
    mockUpdateMacroResponse,
} from '@gorgias/helpdesk-mocks'

import { useUpdateMacro } from '../useUpdateMacro'

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
        const toastEl = await screen.findByRole('status', {
            name: 'Successfully updated macro',
        })
        expect(toastEl).toHaveAttribute('data-intent', 'success')
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

        const toastEl = await screen.findByRole('status', {
            name: errorMessage,
        })
        expect(toastEl).toHaveAttribute('data-intent', 'destructive')
    })
})
