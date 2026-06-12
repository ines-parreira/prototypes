import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockListCustomerCustomFieldsValuesHandler,
    mockListCustomerCustomFieldsValuesResponse,
} from '@gorgias/helpdesk-mocks'
import { queryKeys } from '@gorgias/helpdesk-queries'

import { ticketDropdownFieldDefinition } from 'fixtures/customField'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import {
    STALE_TIME_MS,
    useCustomerFieldValues,
} from '../useCustomerFieldValues'

const server = setupServer()
let queryClient = mockQueryClient()
const customerId = 420

const createWrapper = () => {
    queryClient = mockQueryClient()

    return ({ children }: { children?: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
    queryClient.clear()
})

afterAll(() => {
    server.close()
})

describe('useCustomerFieldValues', () => {
    it('should request customer field values with the provided id and select response data', async () => {
        const response = mockListCustomerCustomFieldsValuesResponse({
            data: [
                {
                    field: {
                        ...ticketDropdownFieldDefinition,
                        deactivated_datetime: null,
                        description: null,
                    } as never,
                    value: 'value',
                },
            ],
        })
        const listCustomerFieldValuesMock =
            mockListCustomerCustomFieldsValuesHandler(async () =>
                HttpResponse.json(response),
            )
        const waitForListCustomerFieldValuesRequest =
            listCustomerFieldValuesMock.waitForRequest(server)
        server.use(listCustomerFieldValuesMock.handler)

        const { result } = renderHook(
            () => useCustomerFieldValues(customerId),
            {
                wrapper: createWrapper(),
            },
        )

        await waitForListCustomerFieldValuesRequest((request) => {
            expect(new URL(request.url).pathname).toContain(String(customerId))
        })
        await waitFor(() => expect(result.current.data).toEqual(response))
    })

    it('should provide staleTime and meta options', () => {
        server.use(mockListCustomerCustomFieldsValuesHandler().handler)

        renderHook(() => useCustomerFieldValues(customerId), {
            wrapper: createWrapper(),
        })

        const query = queryClient
            .getQueryCache()
            .find(
                queryKeys.customers.listCustomerCustomFieldsValues(customerId),
            )
        const queryOptions = query?.options as
            | { staleTime?: number }
            | undefined

        expect(queryOptions?.staleTime).toBe(STALE_TIME_MS)
        expect(query?.options.meta?.errorMessage).toBe(
            'Failed to fetch custom field values',
        )
    })
})
