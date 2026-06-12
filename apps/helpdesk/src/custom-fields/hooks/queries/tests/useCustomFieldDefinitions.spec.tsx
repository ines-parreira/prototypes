import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockListCustomFieldsHandler,
    mockListCustomFieldsResponse,
} from '@gorgias/helpdesk-mocks'
import { queryKeys } from '@gorgias/helpdesk-queries'

import { ticketDropdownFieldDefinition } from 'fixtures/customField'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import {
    STALE_TIME_MS,
    useCustomFieldDefinitions,
} from '../useCustomFieldDefinitions'

const server = setupServer()
let queryClient = mockQueryClient()
const listParams = { archived: false, object_type: 'Ticket' } as const

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

describe('useCustomFieldDefinitions', () => {
    it('should request custom fields with the provided params and select response data', async () => {
        const response = mockListCustomFieldsResponse({
            data: [ticketDropdownFieldDefinition],
        })
        const listCustomFieldsMock = mockListCustomFieldsHandler(async () =>
            HttpResponse.json(response),
        )
        const waitForListCustomFieldsRequest =
            listCustomFieldsMock.waitForRequest(server)
        server.use(listCustomFieldsMock.handler)

        const { result } = renderHook(
            () => useCustomFieldDefinitions(listParams),
            { wrapper: createWrapper() },
        )

        await waitForListCustomFieldsRequest((request) => {
            const searchParams = new URL(request.url).searchParams

            expect(searchParams.get('archived')).toBe('false')
            expect(searchParams.get('object_type')).toBe('Ticket')
        })
        await waitFor(() => expect(result.current.data).toEqual(response))
    })

    it('should provide staleTime, refetch, and meta options', () => {
        server.use(mockListCustomFieldsHandler().handler)

        renderHook(() => useCustomFieldDefinitions(listParams), {
            wrapper: createWrapper(),
        })

        const query = queryClient
            .getQueryCache()
            .find(queryKeys.customFields.listCustomFields(listParams))
        const queryOptions = query?.options as
            | { staleTime?: number; refetchOnWindowFocus?: boolean }
            | undefined

        expect(queryOptions?.staleTime).toBe(STALE_TIME_MS)
        expect(queryOptions?.refetchOnWindowFocus).toBe(false)
        expect(query?.options.meta?.errorMessage).toBe(
            'Failed to fetch custom fields',
        )
    })
})
