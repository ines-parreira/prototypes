import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockGetCustomFieldHandler } from '@gorgias/helpdesk-mocks'
import { queryKeys } from '@gorgias/helpdesk-queries'

import { ticketDropdownFieldDefinition } from 'fixtures/customField'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import {
    STALE_TIME_MS,
    useCustomFieldDefinition,
} from '../useCustomFieldDefinition'

const server = setupServer()
let queryClient = mockQueryClient()
const customFieldId = 123

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

describe('useCustomFieldDefinition', () => {
    it('should request the provided id and select the response data', async () => {
        const getCustomFieldMock = mockGetCustomFieldHandler(async () =>
            HttpResponse.json(ticketDropdownFieldDefinition),
        )
        const waitForGetCustomFieldRequest =
            getCustomFieldMock.waitForRequest(server)
        server.use(getCustomFieldMock.handler)

        const { result } = renderHook(
            () => useCustomFieldDefinition(customFieldId),
            { wrapper: createWrapper() },
        )

        await waitForGetCustomFieldRequest((request) => {
            expect(new URL(request.url).pathname).toContain(
                String(customFieldId),
            )
        })
        await waitFor(() =>
            expect(result.current.data).toEqual(ticketDropdownFieldDefinition),
        )
    })

    it('should provide staleTime, refetch, and meta options', () => {
        server.use(mockGetCustomFieldHandler().handler)

        renderHook(() => useCustomFieldDefinition(customFieldId), {
            wrapper: createWrapper(),
        })

        const query = queryClient
            .getQueryCache()
            .find(queryKeys.customFields.getCustomField(customFieldId))
        const queryOptions = query?.options as
            | { staleTime?: number; refetchOnWindowFocus?: boolean }
            | undefined

        expect(queryOptions?.staleTime).toBe(STALE_TIME_MS)
        expect(queryOptions?.refetchOnWindowFocus).toBe(false)
        expect(query?.options.meta?.errorMessage).toBe(
            'Failed to fetch custom field',
        )
    })
})
