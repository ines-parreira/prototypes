import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    mockDeleteCustomerCustomFieldValueHandler,
    mockUpdateCustomerCustomFieldValueHandler,
    mockUpdateCustomerCustomFieldValueResponse,
} from '@gorgias/helpdesk-mocks'

import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { useUpdateOrDeleteCustomerFieldValue } from '../useUpdateOrDeleteCustomerFieldValue'

const server = setupServer()
const mockStore = configureMockStore([thunk])()
let queryClient = mockQueryClient()

const dataToMutate = {
    customerId: 1,
    fieldId: 1,
}

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

afterEach(() => {
    server.resetHandlers()
    queryClient.clear()
    mockStore.clearActions()
})

afterAll(() => {
    server.close()
})

describe('useUpdateOrDeleteCustomerFieldValue', () => {
    it('should not do any mutation if disabled', () => {
        const requests: Request[] = []
        server.use(
            mockUpdateCustomerCustomFieldValueHandler(async ({ request }) => {
                requests.push(request)

                return HttpResponse.json(
                    mockUpdateCustomerCustomFieldValueResponse(),
                )
            }).handler,
            mockDeleteCustomerCustomFieldValueHandler(async ({ request }) => {
                requests.push(request)

                return HttpResponse.json(undefined)
            }).handler,
        )

        const { result } = renderHook(
            () =>
                useUpdateOrDeleteCustomerFieldValue({
                    isDisabled: true,
                }),
            { wrapper: createWrapper() },
        )

        result.current.mutate(dataToMutate)

        expect(requests).toHaveLength(0)
    })

    it('should call delete mutation when no value is provided', async () => {
        const deleteMock = mockDeleteCustomerCustomFieldValueHandler()
        const waitForDeleteRequest = deleteMock.waitForRequest(server)
        server.use(
            deleteMock.handler,
            mockUpdateCustomerCustomFieldValueHandler().handler,
        )

        const { result } = renderHook(
            () => useUpdateOrDeleteCustomerFieldValue(),
            { wrapper: createWrapper() },
        )

        act(() => {
            result.current.mutate(dataToMutate)
        })

        await waitForDeleteRequest((request) => {
            const pathname = new URL(request.url).pathname

            expect(pathname).toContain(String(dataToMutate.customerId))
            expect(pathname).toContain(String(dataToMutate.fieldId))
        })
    })

    it('should call update mutation with passed params when a value exists', async () => {
        const updateMock = mockUpdateCustomerCustomFieldValueHandler(async () =>
            HttpResponse.json(mockUpdateCustomerCustomFieldValueResponse()),
        )
        const waitForUpdateRequest = updateMock.waitForRequest(server)
        server.use(
            updateMock.handler,
            mockDeleteCustomerCustomFieldValueHandler().handler,
        )

        const { result } = renderHook(
            () => useUpdateOrDeleteCustomerFieldValue(),
            { wrapper: createWrapper() },
        )

        act(() => {
            result.current.mutate({ ...dataToMutate, value: 'foo' })
        })

        await waitForUpdateRequest(async (request) => {
            const pathname = new URL(request.url).pathname

            expect(pathname).toContain(String(dataToMutate.customerId))
            expect(pathname).toContain(String(dataToMutate.fieldId))
            expect(await request.json()).toBe('foo')
        })
    })

    it('should wrap strings before calling mutation to ensure a string is not casted into number', async () => {
        const updateMock = mockUpdateCustomerCustomFieldValueHandler(async () =>
            HttpResponse.json(mockUpdateCustomerCustomFieldValueResponse()),
        )
        const waitForUpdateRequest = updateMock.waitForRequest(server)
        server.use(updateMock.handler)

        const { result } = renderHook(
            () => useUpdateOrDeleteCustomerFieldValue(),
            { wrapper: createWrapper() },
        )

        act(() => {
            result.current.mutate({
                fieldId: 1,
                customerId: 1,
                value: '1',
            })
        })

        await waitForUpdateRequest(async (request) => {
            expect(await request.json()).toBe('1')
        })
    })
})
