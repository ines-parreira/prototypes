import { renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'
import { setupServer } from 'msw/node'

import { mockListAnalyticsFiltersHandler } from '@gorgias/helpdesk-mocks'

import { useSavedFilterById } from 'domains/reporting/hooks/filters/useSavedFilterById'
import { fromApiFormatted } from 'domains/reporting/pages/common/filters/helpers'

const server = setupServer()

const renderHookWithQueryClient = (filterId: number) =>
    renderHook(() => useSavedFilterById(filterId))

describe('useSavedFilterById', () => {
    beforeAll(() => server.listen())
    afterEach(() => {
        server.resetHandlers()
    })
    afterAll(() => server.close())

    it('returns filter with a given id', async () => {
        const listAnalyticsFiltersHandler = mockListAnalyticsFiltersHandler()
        server.use(listAnalyticsFiltersHandler.handler)

        const firstFilter = listAnalyticsFiltersHandler.data.data[0]

        const { result } = renderHookWithQueryClient(firstFilter.id)

        await waitFor(() => {
            const expected = fromApiFormatted(firstFilter as any)

            expect(result.current.data).toEqual(expected)
        })
    })

    it('returns null if invalid filter id', async () => {
        const listAnalyticsFiltersHandler = mockListAnalyticsFiltersHandler()
        server.use(listAnalyticsFiltersHandler.handler)

        const { result } = renderHookWithQueryClient(-123)

        await waitFor(() => {
            expect(result.current.data).toBeNull()
        })
    })
})
