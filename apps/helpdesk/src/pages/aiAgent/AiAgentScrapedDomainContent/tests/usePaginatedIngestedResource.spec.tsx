import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import { useListIngestedResources } from 'models/helpCenter/queries'
import { getIngestedResourcesListResponse } from 'pages/aiAgent/fixtures/ingestedResource.fixture'
import { assumeMock } from 'utils/testing'

import { usePaginatedIngestedResources } from '../hooks/usePaginatedIngestedResources'

jest.mock('models/helpCenter/queries', () => ({
    useListIngestedResources: jest.fn(),
}))
const mockUseListIngestedResources = assumeMock(useListIngestedResources)

describe('usePaginatedIngestedResource', () => {
    const mockedHelpCenterId = 1
    const mockedIngestionLogId = 2
    const mockedResponse = getIngestedResourcesListResponse({
        page: 1,
        itemCount: 3,
    })

    beforeEach(() => {
        jest.resetAllMocks()
        mockUseListIngestedResources.mockReturnValue({
            data: mockedResponse,
            isLoading: false,
            isError: false,
        } as unknown as ReturnType<typeof useListIngestedResources>)
    })

    it('should return paginated ingested resources', () => {
        const { result } = renderHook(() =>
            usePaginatedIngestedResources({
                helpCenterId: mockedHelpCenterId,
                ingestionLogId: mockedIngestionLogId,
            }),
        )

        expect(result.current.contents).toEqual(mockedResponse.data)
        expect(result.current.isLoading).toBe(false)
        expect(result.current.isError).toBe(false)
        expect(result.current.hasNextPage).toBe(false)
        expect(result.current.hasPrevPage).toBe(false)
    })

    it('should handle search term', () => {
        const { result } = renderHook(() =>
            usePaginatedIngestedResources({
                helpCenterId: mockedHelpCenterId,
                ingestionLogId: mockedIngestionLogId,
            }),
        )

        act(() => {
            result.current.setSearchTerm('Snippet Title')
        })

        expect(result.current.searchTerm).toBe('Snippet Title')
        expect(result.current.contents).toEqual(mockedResponse.data)
        expect(result.current.isLoading).toBe(false)
        expect(result.current.isError).toBe(false)
        expect(result.current.hasNextPage).toBe(false)
        expect(result.current.hasPrevPage).toBe(false)
    })

    it('should fetch next page and prev page', () => {
        const mockedResponse = getIngestedResourcesListResponse({
            page: 1,
            itemCount: 17,
        })
        mockUseListIngestedResources.mockReturnValue({
            data: mockedResponse,
            isLoading: false,
            isError: false,
        } as unknown as ReturnType<typeof useListIngestedResources>)

        const { result } = renderHook(() =>
            usePaginatedIngestedResources({
                helpCenterId: mockedHelpCenterId,
                ingestionLogId: mockedIngestionLogId,
            }),
        )

        expect(result.current.hasNextPage).toBe(true)
        expect(result.current.hasPrevPage).toBe(false)

        act(() => {
            result.current.fetchNext()
        })

        expect(result.current.hasPrevPage).toBe(true)

        act(() => {
            result.current.fetchPrev()
        })

        expect(result.current.hasNextPage).toBe(true)
        expect(result.current.hasPrevPage).toBe(false)
    })
})
