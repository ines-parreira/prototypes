import { act, waitFor } from '@testing-library/react'

import { HttpResponse } from 'msw'

import {
    mockCustomField,
    mockListCustomFieldsHandler,
    mockListCustomFieldsResponse,
    mockListTicketCustomFieldsHandler,
    mockListTicketCustomFieldsResponse,
    mockTicketCustomField,
    mockTicketCustomFieldValue,
    mockUpdateTicketCustomFieldHandler,
    mockUpdateTicketCustomFieldResponse,
} from '@gorgias/helpdesk-mocks'
import { ObjectType } from '@gorgias/helpdesk-types'

import { renderHook } from '../../../../../../tests/render.utils'
import { server } from '../../../../../../tests/server'
import { useCustomFieldDefinitions } from '../useCustomFieldDefinitions'
import { useTicketCustomFieldsValues } from '../useTicketCustomFieldsValues'
import { useUpdateTicketFieldValue } from '../useUpdateTicketFieldValue'

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

function renderUseUpdateTicketFieldValue(ticketId: number) {
    return renderHook(() => {
        const mutation = useUpdateTicketFieldValue(ticketId)
        const customFieldDefinitions = useCustomFieldDefinitions({
            archived: false,
            object_type: ObjectType.Ticket,
        })
        const ticketFieldValues = useTicketCustomFieldsValues(ticketId)

        return {
            customFieldDefinitions,
            mutation,
            ticketFieldValues,
        }
    })
}

describe('useUpdateTicketFieldValue', () => {
    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    afterEach(() => {
        server.resetHandlers()
    })

    afterAll(() => {
        server.close()
    })

    it('optimistically updates an existing value by custom field id', async () => {
        const ticketId = 123
        const fieldId = 42
        const fieldDefinition = mockCustomField({
            id: fieldId,
            object_type: ObjectType.Ticket,
        })
        const otherFieldDefinition = mockCustomField({
            id: 84,
            object_type: ObjectType.Ticket,
        })
        const ticketValueField = mockTicketCustomField({ id: fieldId })
        const otherTicketValueField = mockTicketCustomField({ id: 84 })
        const existingValue = mockTicketCustomFieldValue({
            id: 9001,
            field: ticketValueField,
            value: 111,
        })
        const otherValue = mockTicketCustomFieldValue({
            id: 9002,
            field: otherTicketValueField,
            value: 'kept',
        })
        const updateResponse = createDeferred()
        const mockUpdateTicketCustomField = mockUpdateTicketCustomFieldHandler(
            async () => {
                await updateResponse.promise

                return HttpResponse.json(
                    mockUpdateTicketCustomFieldResponse({
                        field: ticketValueField,
                        value: 23645239,
                    }),
                )
            },
        )

        server.use(
            mockListCustomFieldsHandler(async () =>
                HttpResponse.json(
                    mockListCustomFieldsResponse({
                        data: [fieldDefinition, otherFieldDefinition],
                    }),
                ),
            ).handler,
            mockListTicketCustomFieldsHandler(async () =>
                HttpResponse.json(
                    mockListTicketCustomFieldsResponse({
                        data: [existingValue, otherValue],
                    }),
                ),
            ).handler,
            mockUpdateTicketCustomField.handler,
        )
        const waitForUpdateTicketCustomFieldRequest =
            mockUpdateTicketCustomField.waitForRequest(server)

        const { result } = renderUseUpdateTicketFieldValue(ticketId)

        await waitFor(() => {
            expect(result.current.customFieldDefinitions.data?.data).toEqual([
                fieldDefinition,
                otherFieldDefinition,
            ])
            expect(result.current.ticketFieldValues.data?.data).toEqual([
                existingValue,
                otherValue,
            ])
        })

        const mutationPromise = startMutation(() =>
            result.current.mutation.mutateAsync({
                ticketId,
                id: fieldId,
                data: JSON.stringify(23645239),
            }),
        )

        await waitFor(() => {
            expect(result.current.ticketFieldValues.data?.data).toEqual([
                {
                    ...existingValue,
                    value: 23645239,
                },
                otherValue,
            ])
        })

        updateResponse.resolve()
        await waitForUpdateTicketCustomFieldRequest(async (request) => {
            const url = new URL(request.url)
            expect(request.method).toBe('PUT')
            expect(url.pathname).toContain(`/tickets/${ticketId}`)
            expect(url.pathname).toContain(`/custom-fields/${fieldId}`)
            expect(await request.text()).toBe('23645239')
        })

        await act(async () => {
            await mutationPromise
        })
    })

    it('optimistically adds a first value when other ticket fields already exist', async () => {
        const ticketId = 123
        const fieldId = 42
        const fieldDefinition = mockCustomField({
            id: fieldId,
            object_type: ObjectType.Ticket,
        })
        const otherFieldDefinition = mockCustomField({
            id: 84,
            object_type: ObjectType.Ticket,
        })
        const otherTicketValueField = mockTicketCustomField({ id: 84 })
        const otherValue = mockTicketCustomFieldValue({
            id: 9002,
            field: otherTicketValueField,
            value: 'kept',
        })
        const updateResponse = createDeferred()
        const mockUpdateTicketCustomField = mockUpdateTicketCustomFieldHandler(
            async () => {
                await updateResponse.promise

                return HttpResponse.json(
                    mockUpdateTicketCustomFieldResponse({
                        field: mockTicketCustomField({ id: fieldId }),
                        value: 23645239,
                    }),
                )
            },
        )

        server.use(
            mockListCustomFieldsHandler(async () =>
                HttpResponse.json(
                    mockListCustomFieldsResponse({
                        data: [fieldDefinition, otherFieldDefinition],
                    }),
                ),
            ).handler,
            mockListTicketCustomFieldsHandler(async () =>
                HttpResponse.json(
                    mockListTicketCustomFieldsResponse({
                        data: [otherValue],
                    }),
                ),
            ).handler,
            mockUpdateTicketCustomField.handler,
        )
        const waitForUpdateTicketCustomFieldRequest =
            mockUpdateTicketCustomField.waitForRequest(server)

        const { result } = renderUseUpdateTicketFieldValue(ticketId)

        await waitFor(() => {
            expect(result.current.customFieldDefinitions.data?.data).toEqual([
                fieldDefinition,
                otherFieldDefinition,
            ])
            expect(result.current.ticketFieldValues.data?.data).toEqual([
                otherValue,
            ])
        })

        const mutationPromise = startMutation(() =>
            result.current.mutation.mutateAsync({
                ticketId,
                id: fieldId,
                data: JSON.stringify(23645239),
            }),
        )

        await waitFor(() => {
            expect(result.current.ticketFieldValues.data?.data).toEqual([
                otherValue,
                {
                    field: fieldDefinition,
                    value: 23645239,
                },
            ])
        })

        updateResponse.resolve()
        await waitForUpdateTicketCustomFieldRequest(async (request) => {
            const url = new URL(request.url)
            expect(request.method).toBe('PUT')
            expect(url.pathname).toContain(`/tickets/${ticketId}`)
            expect(url.pathname).toContain(`/custom-fields/${fieldId}`)
            expect(await request.text()).toBe('23645239')
        })

        await act(async () => {
            await mutationPromise
        })
    })

    it('optimistically adds a first value when the ticket has no field values', async () => {
        const ticketId = 123
        const fieldId = 42
        const fieldDefinition = mockCustomField({
            id: fieldId,
            object_type: ObjectType.Ticket,
        })
        const updateResponse = createDeferred()
        const mockUpdateTicketCustomField = mockUpdateTicketCustomFieldHandler(
            async () => {
                await updateResponse.promise

                return HttpResponse.json(
                    mockUpdateTicketCustomFieldResponse({
                        field: mockTicketCustomField({ id: fieldId }),
                        value: 23645239,
                    }),
                )
            },
        )

        server.use(
            mockListCustomFieldsHandler(async () =>
                HttpResponse.json(
                    mockListCustomFieldsResponse({
                        data: [fieldDefinition],
                    }),
                ),
            ).handler,
            mockListTicketCustomFieldsHandler(async () =>
                HttpResponse.json(
                    mockListTicketCustomFieldsResponse({
                        data: [],
                    }),
                ),
            ).handler,
            mockUpdateTicketCustomField.handler,
        )
        const waitForUpdateTicketCustomFieldRequest =
            mockUpdateTicketCustomField.waitForRequest(server)

        const { result } = renderUseUpdateTicketFieldValue(ticketId)

        await waitFor(() => {
            expect(result.current.customFieldDefinitions.data?.data).toEqual([
                fieldDefinition,
            ])
            expect(result.current.ticketFieldValues.data?.data).toEqual([])
        })

        const mutationPromise = startMutation(() =>
            result.current.mutation.mutateAsync({
                ticketId,
                id: fieldId,
                data: JSON.stringify(23645239),
            }),
        )

        await waitFor(() => {
            expect(result.current.ticketFieldValues.data?.data).toEqual([
                {
                    field: fieldDefinition,
                    value: 23645239,
                },
            ])
        })

        updateResponse.resolve()
        await waitForUpdateTicketCustomFieldRequest(async (request) => {
            expect(await request.text()).toBe('23645239')
        })

        await act(async () => {
            await mutationPromise
        })
    })

    it('does not optimistically update when the field definition is missing', async () => {
        const ticketId = 123
        const fieldId = 42
        const ticketValueField = mockTicketCustomField({ id: fieldId })
        const existingValue = mockTicketCustomFieldValue({
            id: 9001,
            field: ticketValueField,
            value: 111,
        })
        const updateResponse = createDeferred()
        const mockUpdateTicketCustomField = mockUpdateTicketCustomFieldHandler(
            async () => {
                await updateResponse.promise

                return HttpResponse.json(
                    mockUpdateTicketCustomFieldResponse({
                        field: ticketValueField,
                        value: 23645239,
                    }),
                )
            },
        )

        server.use(
            mockListCustomFieldsHandler(async () =>
                HttpResponse.json(
                    mockListCustomFieldsResponse({
                        data: [],
                    }),
                ),
            ).handler,
            mockListTicketCustomFieldsHandler(async () =>
                HttpResponse.json(
                    mockListTicketCustomFieldsResponse({
                        data: [existingValue],
                    }),
                ),
            ).handler,
            mockUpdateTicketCustomField.handler,
        )
        const waitForUpdateTicketCustomFieldRequest =
            mockUpdateTicketCustomField.waitForRequest(server)

        const { result } = renderUseUpdateTicketFieldValue(ticketId)

        await waitFor(() => {
            expect(result.current.customFieldDefinitions.data?.data).toEqual([])
            expect(result.current.ticketFieldValues.data?.data).toEqual([
                existingValue,
            ])
        })

        const mutationPromise = startMutation(() =>
            result.current.mutation.mutateAsync({
                ticketId,
                id: fieldId,
                data: JSON.stringify(23645239),
            }),
        )

        expect(result.current.ticketFieldValues.data?.data).toEqual([
            existingValue,
        ])

        updateResponse.resolve()
        await waitForUpdateTicketCustomFieldRequest(async (request) => {
            expect(await request.text()).toBe('23645239')
        })

        await act(async () => {
            await mutationPromise
        })
    })

    it('keeps a raw string value when the mutation body is not JSON', async () => {
        const ticketId = 123
        const fieldId = 42
        const fieldDefinition = mockCustomField({
            id: fieldId,
            object_type: ObjectType.Ticket,
        })
        const ticketValueField = mockTicketCustomField({ id: fieldId })
        const existingValue = mockTicketCustomFieldValue({
            id: 9001,
            field: ticketValueField,
            value: 'old value',
        })
        const updateResponse = createDeferred()
        const mockUpdateTicketCustomField = mockUpdateTicketCustomFieldHandler(
            async () => {
                await updateResponse.promise

                return HttpResponse.json(
                    mockUpdateTicketCustomFieldResponse({
                        field: ticketValueField,
                        value: 'raw-value',
                    }),
                )
            },
        )

        server.use(
            mockListCustomFieldsHandler(async () =>
                HttpResponse.json(
                    mockListCustomFieldsResponse({
                        data: [fieldDefinition],
                    }),
                ),
            ).handler,
            mockListTicketCustomFieldsHandler(async () =>
                HttpResponse.json(
                    mockListTicketCustomFieldsResponse({
                        data: [existingValue],
                    }),
                ),
            ).handler,
            mockUpdateTicketCustomField.handler,
        )
        const waitForUpdateTicketCustomFieldRequest =
            mockUpdateTicketCustomField.waitForRequest(server)

        const { result } = renderUseUpdateTicketFieldValue(ticketId)

        await waitFor(() => {
            expect(result.current.customFieldDefinitions.data?.data).toEqual([
                fieldDefinition,
            ])
            expect(result.current.ticketFieldValues.data?.data).toEqual([
                existingValue,
            ])
        })

        const mutationPromise = startMutation(() =>
            result.current.mutation.mutateAsync({
                ticketId,
                id: fieldId,
                data: 'raw-value',
            }),
        )

        await waitFor(() => {
            expect(result.current.ticketFieldValues.data?.data).toEqual([
                {
                    ...existingValue,
                    value: 'raw-value',
                },
            ])
        })

        updateResponse.resolve()
        await waitForUpdateTicketCustomFieldRequest(async (request) => {
            expect(await request.text()).toBe('"raw-value"')
        })

        await act(async () => {
            await mutationPromise
        })
    })

    it('rolls back optimistic values when the update fails', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined)

        const ticketId = 123
        const fieldId = 42
        const fieldDefinition = mockCustomField({
            id: fieldId,
            object_type: ObjectType.Ticket,
        })
        const ticketValueField = mockTicketCustomField({ id: fieldId })
        const existingValue = mockTicketCustomFieldValue({
            id: 9001,
            field: ticketValueField,
            value: 111,
        })
        const updateResponse = createDeferred()
        const mockUpdateTicketCustomField = mockUpdateTicketCustomFieldHandler(
            async () => {
                await updateResponse.promise

                return new HttpResponse(null, { status: 500 })
            },
        )

        server.use(
            mockListCustomFieldsHandler(async () =>
                HttpResponse.json(
                    mockListCustomFieldsResponse({
                        data: [fieldDefinition],
                    }),
                ),
            ).handler,
            mockListTicketCustomFieldsHandler(async () =>
                HttpResponse.json(
                    mockListTicketCustomFieldsResponse({
                        data: [existingValue],
                    }),
                ),
            ).handler,
            mockUpdateTicketCustomField.handler,
        )
        const waitForUpdateTicketCustomFieldRequest =
            mockUpdateTicketCustomField.waitForRequest(server)

        const { result } = renderUseUpdateTicketFieldValue(ticketId)

        await waitFor(() => {
            expect(result.current.customFieldDefinitions.data?.data).toEqual([
                fieldDefinition,
            ])
            expect(result.current.ticketFieldValues.data?.data).toEqual([
                existingValue,
            ])
        })

        const mutationPromise = startMutation(() =>
            result.current.mutation.mutateAsync({
                ticketId,
                id: fieldId,
                data: JSON.stringify(23645239),
            }),
        )
        mutationPromise.catch(() => undefined)

        await waitFor(() => {
            expect(result.current.ticketFieldValues.data?.data).toEqual([
                {
                    ...existingValue,
                    value: 23645239,
                },
            ])
        })

        updateResponse.resolve()
        await waitForUpdateTicketCustomFieldRequest(async (request) => {
            expect(await request.text()).toBe('23645239')
        })

        await expect(mutationPromise).rejects.toThrow()

        await waitFor(() => {
            expect(result.current.ticketFieldValues.data?.data).toEqual([
                existingValue,
            ])
        })
    })
})
