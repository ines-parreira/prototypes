import { act, waitFor } from '@testing-library/react'

import { HttpResponse } from 'msw'

import {
    mockDeleteTicketCustomFieldHandler,
    mockListTicketCustomFieldsHandler,
    mockListTicketCustomFieldsResponse,
    mockTicketCustomField,
    mockTicketCustomFieldValue,
} from '@gorgias/helpdesk-mocks'

import { renderHook } from '../../../../../../tests/render.utils'
import { server } from '../../../../../../tests/server'
import { useDeleteTicketFieldValue } from '../useDeleteTicketFieldValue'
import { useTicketCustomFieldsValues } from '../useTicketCustomFieldsValues'

function startMutation<T>(callback: () => Promise<T>) {
    let mutationPromise: Promise<T> | undefined

    act(() => {
        mutationPromise = callback()
    })

    if (!mutationPromise) {
        throw new Error('Mutation did not start')
    }

    return mutationPromise
}

function createDeferred() {
    let resolve: () => void
    const promise = new Promise<void>((resolvePromise) => {
        resolve = resolvePromise
    })

    return {
        promise,
        resolve: resolve!,
    }
}

function renderUseDeleteTicketFieldValue(ticketId: number) {
    return renderHook(() => {
        const mutation = useDeleteTicketFieldValue(ticketId)
        const ticketFieldValues = useTicketCustomFieldsValues(ticketId)

        return { mutation, ticketFieldValues }
    })
}

describe('useDeleteTicketFieldValue', () => {
    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    afterEach(() => {
        server.resetHandlers()
    })

    afterAll(() => {
        server.close()
    })

    it('optimistically deletes by custom field id instead of value row id', async () => {
        const ticketId = 123
        const fieldId = 42
        const fieldDefinition = mockTicketCustomField({ id: fieldId })
        const otherFieldDefinition = mockTicketCustomField({ id: 84 })
        const existingValue = mockTicketCustomFieldValue({
            id: 9001,
            field: fieldDefinition,
            value: 111,
        })
        const otherValue = mockTicketCustomFieldValue({
            id: fieldId,
            field: otherFieldDefinition,
            value: 'kept',
        })
        const deleteResponse = createDeferred()
        const mockDeleteTicketCustomField = mockDeleteTicketCustomFieldHandler(
            async () => {
                await deleteResponse.promise

                return new HttpResponse(null, { status: 204 })
            },
        )

        server.use(
            mockListTicketCustomFieldsHandler(async () =>
                HttpResponse.json(
                    mockListTicketCustomFieldsResponse({
                        data: [existingValue, otherValue],
                    }),
                ),
            ).handler,
            mockDeleteTicketCustomField.handler,
        )
        const waitForDeleteTicketCustomFieldRequest =
            mockDeleteTicketCustomField.waitForRequest(server)

        const { result } = renderUseDeleteTicketFieldValue(ticketId)

        await waitFor(() => {
            expect(result.current.ticketFieldValues.data?.data).toEqual([
                existingValue,
                otherValue,
            ])
        })

        const mutationPromise = startMutation(() =>
            result.current.mutation.mutateAsync({
                ticketId,
                id: fieldId,
            }),
        )

        await waitFor(() => {
            expect(result.current.ticketFieldValues.data?.data).toEqual([
                otherValue,
            ])
        })

        deleteResponse.resolve()
        await waitForDeleteTicketCustomFieldRequest((request) => {
            const url = new URL(request.url)
            expect(request.method).toBe('DELETE')
            expect(url.pathname).toContain(`/tickets/${ticketId}`)
            expect(url.pathname).toContain(`/custom-fields/${fieldId}`)
        })

        await act(async () => {
            await mutationPromise
        })
    })
})
