import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    mockCreateCustomFieldHandler,
    mockCreateCustomFieldResponse,
} from '@gorgias/helpdesk-mocks'
import type { CreateCustomField } from '@gorgias/helpdesk-queries'
import { queryKeys } from '@gorgias/helpdesk-queries'

import { OBJECT_TYPE_SETTINGS, OBJECT_TYPES } from 'custom-fields/constants'
import { ticketDropdownFieldDefinition } from 'fixtures/customField'
import { NotificationStatus } from 'state/notifications/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { useCreateCustomFieldDefinition } from '../useCreateCustomFieldDefinition'

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

describe('useCreateCustomFieldDefinition', () => {
    it.each(Object.values(OBJECT_TYPES))(
        'should dispatch success notification on success and invalidate proper query data',
        async (objectType) => {
            const fieldDefinition = {
                ...ticketDropdownFieldDefinition,
                object_type: objectType,
            } as CreateCustomField
            const createCustomFieldMock = mockCreateCustomFieldHandler(
                async () =>
                    HttpResponse.json(
                        mockCreateCustomFieldResponse(fieldDefinition as never),
                    ),
            )
            const waitForCreateCustomFieldRequest =
                createCustomFieldMock.waitForRequest(server)
            server.use(createCustomFieldMock.handler)

            const invalidateQueryMock = jest.spyOn(
                queryClient,
                'invalidateQueries',
            )
            const { result } = renderHook(
                () => useCreateCustomFieldDefinition(),
                { wrapper: createWrapper() },
            )

            await act(async () => {
                await result.current.mutateAsync({ data: fieldDefinition })
            })

            await waitForCreateCustomFieldRequest(async (request) => {
                expect(await request.json()).toEqual(fieldDefinition)
            })
            expect(invalidateQueryMock).toHaveBeenLastCalledWith({
                queryKey: queryKeys.customFields.all(),
            })

            expect(mockStore.getActions()).toMatchObject([
                {
                    payload: {
                        message: `${OBJECT_TYPE_SETTINGS[objectType].TITLE_LABEL} field created successfully.`,
                        status: NotificationStatus.Success,
                    },
                },
            ])
        },
    )

    it('should dispatch failure notification on error', async () => {
        server.use(
            mockCreateCustomFieldHandler(async () =>
                HttpResponse.json(
                    { error: 'Failed to create custom field' } as never,
                    { status: 500 },
                ),
            ).handler,
        )

        const { result } = renderHook(() => useCreateCustomFieldDefinition(), {
            wrapper: createWrapper(),
        })

        await act(async () => {
            await expect(
                result.current.mutateAsync({
                    data: ticketDropdownFieldDefinition as CreateCustomField,
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
