import type { ReactNode } from 'react'

import { createElement } from 'react'

import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockAnalyticsCustomReport,
    mockListAnalyticsCustomReportsHandler,
    mockListAnalyticsCustomReportsResponse,
} from '@gorgias/helpdesk-mocks'

import { useDashboardNameValidation } from 'domains/reporting/hooks/dashboards/useDashboardNameValidation'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

const server = setupServer()
let queryClient = mockQueryClient()

const mockDashboards = [
    mockAnalyticsCustomReport({ name: 'Existing Dashboard', id: 1 }),
    mockAnalyticsCustomReport({ name: 'Another Dashboard', id: 2 }),
]

const createWrapper = () => {
    queryClient = mockQueryClient()

    return ({ children }: { children?: ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children)
}

const useDashboardsHandler = (dashboards = mockDashboards) => {
    server.use(
        mockListAnalyticsCustomReportsHandler(async () =>
            HttpResponse.json(
                mockListAnalyticsCustomReportsResponse({
                    data: dashboards,
                }),
            ),
        ).handler,
    )
}

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    useDashboardsHandler()
})

afterEach(() => {
    server.resetHandlers()
    queryClient.clear()
})

afterAll(() => {
    server.close()
})

describe('useValidateDashboardName', () => {
    it('should return error for names shorter than 3 characters', async () => {
        const { result } = renderHook(() => useDashboardNameValidation('ab'), {
            wrapper: createWrapper(),
        })

        await waitFor(() =>
            expect(result.current.error).toBe(
                'Name must be at least 3 characters long',
            ),
        )
    })

    it('should return error for duplicate dashboard names', async () => {
        const { result } = renderHook(
            () => useDashboardNameValidation('Existing Dashboard'),
            { wrapper: createWrapper() },
        )

        await waitFor(() =>
            expect(result.current.error).toBe(
                'Existing Dashboard already exists. Please create a unique name to save.',
            ),
        )
    })

    it('should return error for duplicate dashboard names with different spacing', async () => {
        const { result } = renderHook(
            () => useDashboardNameValidation('  Existing Dashboard  '),
            { wrapper: createWrapper() },
        )

        await waitFor(() =>
            expect(result.current.error).toBe(
                'Existing Dashboard already exists. Please create a unique name to save.',
            ),
        )
    })

    it('should return null for valid dashboard names', async () => {
        const { result } = renderHook(
            () => useDashboardNameValidation('New Valid Dashboard'),
            { wrapper: createWrapper() },
        )

        await waitFor(() => expect(result.current.isValid).toBe(true))
        expect(result.current.error).toBeUndefined()
        expect(result.current.isInvalid).toBe(false)
    })

    it('should handle empty dashboards list', async () => {
        useDashboardsHandler([])

        const { result } = renderHook(
            () => useDashboardNameValidation('New Dashboard'),
            { wrapper: createWrapper() },
        )

        await waitFor(() => expect(result.current.error).toBeUndefined())
    })

    it('should handle no dashboards data', async () => {
        server.use(
            mockListAnalyticsCustomReportsHandler(async () =>
                HttpResponse.json({} as never),
            ).handler,
        )

        const { result } = renderHook(
            () => useDashboardNameValidation('New Dashboard'),
            { wrapper: createWrapper() },
        )

        await waitFor(() => expect(result.current.error).toBeUndefined())
    })

    it('should allow the same name if it matches the initialName', async () => {
        const { result } = renderHook(
            () =>
                useDashboardNameValidation(
                    'Existing Dashboard',
                    'Existing Dashboard',
                ),
            { wrapper: createWrapper() },
        )

        await waitFor(() => expect(result.current.isValid).toBe(true))
        expect(result.current.error).toBeUndefined()
        expect(result.current.isInvalid).toBe(false)
    })

    it('should allow the same name with different spacing if it matches the initialName', async () => {
        const { result } = renderHook(
            () =>
                useDashboardNameValidation(
                    '  Existing Dashboard  ',
                    'Existing Dashboard',
                ),
            { wrapper: createWrapper() },
        )

        await waitFor(() => expect(result.current.isValid).toBe(true))
        expect(result.current.error).toBeUndefined()
        expect(result.current.isInvalid).toBe(false)
    })
})
