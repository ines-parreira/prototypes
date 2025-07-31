import { renderHook } from '@repo/testing'

import { useFetchStoreDomainIngestionLogsData } from '../useFetchStoreDomainIngestionLogsData'

jest.mock('pages/aiAgent/hooks/useStoresDomainIngestionLogs')

const mockUseStoresDomainIngestionLogs =
    require('pages/aiAgent/hooks/useStoresDomainIngestionLogs')
        .useStoresDomainIngestionLogs as jest.Mock

describe('useFetchStoreDomainIngestionLogsData', () => {
    const storeName = 'test-store'

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('returns loading state initially', () => {
        mockUseStoresDomainIngestionLogs.mockReturnValue({
            data: undefined,
            isLoading: true,
        })

        const { result } = renderHook(() =>
            useFetchStoreDomainIngestionLogsData({ storeName }),
        )

        expect(result.current.isLoading).toBe(true)
        expect(result.current.data).toEqual(undefined)
    })

    it('returns call hook with store name', () => {
        mockUseStoresDomainIngestionLogs.mockReturnValue({
            data: undefined,
            isLoading: true,
        })

        renderHook(() => useFetchStoreDomainIngestionLogsData({ storeName }))

        expect(mockUseStoresDomainIngestionLogs).toHaveBeenCalledWith({
            storeNames: [storeName],
        })
    })

    it.each([{}, undefined, { 'another-store': [{ id: 2 }] }])(
        'returns undefined when ingestion logs = %s',
        (data) => {
            mockUseStoresDomainIngestionLogs.mockReturnValue({
                isLoading: false,
                data,
            })

            const { result } = renderHook(() =>
                useFetchStoreDomainIngestionLogsData({ storeName }),
            )

            expect(result.current.isLoading).toBe(false)
            expect(result.current.data).toBeUndefined()
        },
    )

    it('returns ingestion logs specific to store when query succeeds', () => {
        const log = { id: 1 }
        mockUseStoresDomainIngestionLogs.mockReturnValue({
            isLoading: false,
            data: {
                [storeName]: [log],
                'another-store': [{ id: 2 }],
            },
        })

        const { result } = renderHook(() =>
            useFetchStoreDomainIngestionLogsData({ storeName }),
        )

        expect(result.current.isLoading).toBe(false)
        expect(result.current.data).toEqual([log])
    })
})
