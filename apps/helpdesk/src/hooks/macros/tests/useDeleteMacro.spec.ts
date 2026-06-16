import { renderHook } from '@repo/testing'
import { screen } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockDeleteMacroHandler } from '@gorgias/helpdesk-mocks'

import { useDeleteMacro } from '../useDeleteMacro'

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

function renderUseDeleteMacro() {
    return renderHook(() => useDeleteMacro())
}

describe('useDeleteMacro', () => {
    it('should delete a macro and notify on success', async () => {
        const deleteMacroMock = mockDeleteMacroHandler()
        const waitForDeleteMacroRequest = deleteMacroMock.waitForRequest(server)
        server.use(deleteMacroMock.handler)
        const { result } = renderUseDeleteMacro()

        await result.current.mutateAsync({ id: 111 })

        await waitForDeleteMacroRequest((request) => {
            expect(new URL(request.url).pathname).toContain('/macros/111')
        })
        const toastEl = await screen.findByRole('status', {
            name: 'Successfully deleted macro',
        })
        expect(toastEl).toHaveAttribute('data-intent', 'success')
    })

    it('should handle failed request', async () => {
        const msg = 'nope'
        server.use(
            mockDeleteMacroHandler(async () =>
                HttpResponse.json({ error: { msg } } as never, { status: 400 }),
            ).handler,
        )
        const { result } = renderUseDeleteMacro()

        await expect(
            result.current.mutateAsync({ id: 111 }),
        ).rejects.toBeDefined()

        const toastEl = await screen.findByRole('status', {
            name: msg,
        })
        expect(toastEl).toHaveAttribute('data-intent', 'destructive')
    })
})
