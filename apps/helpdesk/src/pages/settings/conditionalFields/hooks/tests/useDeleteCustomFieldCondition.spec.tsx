import { renderHook } from '@repo/testing'
import { act, screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { toast } from '@gorgias/axiom'
import { mockDeleteCustomFieldConditionHandler } from '@gorgias/helpdesk-mocks'

import { customFieldCondition } from 'fixtures/customFieldCondition'

import { useDeleteCustomFieldCondition } from '../useDeleteCustomFieldCondition'

const server = setupServer()

function renderUseDeleteCustomFieldCondition() {
    return renderHook(() => useDeleteCustomFieldCondition())
}

describe('useDeleteCustomFieldCondition', () => {
    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    beforeEach(() => {
        jest.resetAllMocks()
        server.use(
            mockDeleteCustomFieldConditionHandler(async () =>
                HttpResponse.json(undefined),
            ).handler,
        )
    })

    afterEach(() => {
        server.resetHandlers()
        toast.dismiss()
    })

    afterAll(() => {
        server.close()
    })

    it('should show success toast on success', async () => {
        const { result } = renderUseDeleteCustomFieldCondition()

        await act(async () => {
            await result.current.mutateAsync({
                id: customFieldCondition.id,
            } as never)
        })

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Successfully deleted condition',
                }),
            ).toHaveAttribute('data-intent', 'success')
        })
    })

    it('should show failure toast on error', async () => {
        server.use(
            mockDeleteCustomFieldConditionHandler(
                async () => new HttpResponse(null, { status: 500 }),
            ).handler,
        )
        const { result } = renderUseDeleteCustomFieldCondition()

        await act(async () => {
            await result.current
                .mutateAsync({ id: customFieldCondition.id } as never)
                .catch(() => undefined)
        })

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Failed to delete condition',
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })
})
