import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    mockUpdateCustomFieldHandler,
    mockUpdateCustomFieldResponse,
} from '@gorgias/helpdesk-mocks'
import type { UpdateCustomField } from '@gorgias/helpdesk-queries'
import { queryKeys } from '@gorgias/helpdesk-queries'

import { OBJECT_TYPE_SETTINGS, OBJECT_TYPES } from 'custom-fields/constants'
import { ticketDropdownFieldDefinition } from 'fixtures/customField'
import { NotificationStatus } from 'state/notifications/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { useUpdateCustomFieldDefinition } from '../useUpdateCustomFieldDefinition'

const server = setupServer()
const mockStore = configureMockStore([thunk])()
let queryClient = mockQueryClient()

const createWrapper = () => {
    return ({ children }: { children?: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            <Provider store={mockStore}>{children}</Provider>
        </QueryClientProvider>
    )
}

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    mockStore.clearActions()
})

afterEach(() => {
    server.resetHandlers()
    queryClient.clear()
})

afterAll(() => {
    server.close()
})

describe('useUpdateCustomFieldDefinition', () => {
    it.each(Object.values(OBJECT_TYPES))(
        'should dispatch success notification on success and invalidate proper query data',
        async (objectType) => {
            const fieldDefinition = {
                ...ticketDropdownFieldDefinition,
                object_type: objectType,
            }
            const updateCustomFieldMock = mockUpdateCustomFieldHandler(
                async () =>
                    HttpResponse.json(
                        mockUpdateCustomFieldResponse(fieldDefinition),
                    ),
            )
            const waitForUpdateCustomFieldRequest =
                updateCustomFieldMock.waitForRequest(server)
            server.use(updateCustomFieldMock.handler)

            const invalidateQueryMock = jest.spyOn(
                queryClient,
                'invalidateQueries',
            )
            const { result } = renderHook(
                () => useUpdateCustomFieldDefinition(),
                { wrapper: createWrapper() },
            )

            await act(async () => {
                await result.current.mutateAsync({
                    id: fieldDefinition.id,
                    data: fieldDefinition as UpdateCustomField,
                })
            })

            await waitForUpdateCustomFieldRequest(async (request) => {
                expect(new URL(request.url).pathname).toContain(
                    String(fieldDefinition.id),
                )
                expect(await request.json()).toEqual(fieldDefinition)
            })
            expect(invalidateQueryMock).toHaveBeenLastCalledWith({
                queryKey: queryKeys.customFields.all(),
            })

            expect(mockStore.getActions()).toMatchObject([
                {
                    payload: {
                        message: `${OBJECT_TYPE_SETTINGS[objectType].TITLE_LABEL} field updated successfully.`,
                        status: NotificationStatus.Success,
                    },
                },
            ])
        },
    )

    it('should dispatch failure notification on error', async () => {
        server.use(
            mockUpdateCustomFieldHandler(async () =>
                HttpResponse.json(
                    { error: 'Failed to update custom field' } as never,
                    { status: 500 },
                ),
            ).handler,
        )

        const { result } = renderHook(() => useUpdateCustomFieldDefinition(), {
            wrapper: createWrapper(),
        })

        await act(async () => {
            await expect(
                result.current.mutateAsync({
                    id: ticketDropdownFieldDefinition.id,
                    data: ticketDropdownFieldDefinition as UpdateCustomField,
                }),
            ).rejects.toBeDefined()
        })

        await waitFor(() =>
            expect(mockStore.getActions()).toMatchObject([
                {
                    payload: {
                        status: NotificationStatus.Error,
                    },
                },
            ]),
        )
    })
})
