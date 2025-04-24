import { renderHook } from '@testing-library/react-hooks'

import { getIngestionLogFixture } from 'pages/aiAgent/fixtures/ingestionLog.fixture'
import { assumeMock } from 'utils/testing'

import { IngestionLogStatus } from '../../AiAgentScrapedDomainContent/constant'
import { useGetStoreDomainIngestionLog } from '../useGetStoreDomainIngestionLog'
import { usePollStoreDomainIngestionLog } from '../usePollStoreDomainIngestionLog'

jest.mock('pages/aiAgent/hooks/useGetStoreDomainIngestionLog')
const mockUseGetStoreDomainIngestionLog = assumeMock(
    useGetStoreDomainIngestionLog,
)

describe('usePollStoreDomainIngestionLog', () => {
    const mockedStoreName = 'test-shop'
    const mockedStoreDomain = `${mockedStoreName}.myshopify.com`
    const mockedStoreUrl = `https://${mockedStoreName}.myshopify.com`
    const mockedStoreDomainIngestionLog = getIngestionLogFixture({
        domain: mockedStoreDomain,
        url: mockedStoreUrl,
    })
    const mockedOnStatusChange = jest.fn()

    beforeEach(() => {
        jest.resetAllMocks()
        mockUseGetStoreDomainIngestionLog.mockReturnValue({
            storeDomainIngestionLog: mockedStoreDomainIngestionLog,
            status: IngestionLogStatus.Pending,
            isGetIngestionLogsLoading: false,
        })
    })

    it('returns syncIsPending true when status is Pending', () => {
        const { result } = renderHook(() =>
            usePollStoreDomainIngestionLog({
                helpCenterId: 1,
                storeUrl: mockedStoreUrl,
                shopName: mockedStoreName,
            }),
        )

        expect(result.current.ingestionLogStatus).toBe(
            IngestionLogStatus.Pending,
        )
        expect(result.current.syncIsPending).toBe(true)
    })

    it('returns syncIsPending false when status is Completed', () => {
        mockUseGetStoreDomainIngestionLog.mockReturnValue({
            storeDomainIngestionLog: {
                ...mockedStoreDomainIngestionLog,
                status: IngestionLogStatus.Successful,
            },
            status: IngestionLogStatus.Successful,
            isGetIngestionLogsLoading: false,
        })

        const { result } = renderHook(() =>
            usePollStoreDomainIngestionLog({
                helpCenterId: 1,
                storeUrl: mockedStoreUrl,
                shopName: mockedStoreName,
            }),
        )

        expect(result.current.ingestionLogStatus).toBe(
            IngestionLogStatus.Successful,
        )
        expect(result.current.syncIsPending).toBe(false)
    })

    it('does not call onStatusChange when initial status is successful', () => {
        mockUseGetStoreDomainIngestionLog.mockReturnValue({
            storeDomainIngestionLog: {
                ...mockedStoreDomainIngestionLog,
                status: IngestionLogStatus.Successful,
            },
            status: IngestionLogStatus.Successful,
            isGetIngestionLogsLoading: false,
        })

        renderHook(() =>
            usePollStoreDomainIngestionLog({
                helpCenterId: 1,
                storeUrl: mockedStoreUrl,
                shopName: mockedStoreName,
                onStatusChange: mockedOnStatusChange,
            }),
        )

        expect(mockedOnStatusChange).not.toHaveBeenCalledWith(
            IngestionLogStatus.Successful,
        )
    })

    it('calls onStatusChange when the initial status changes and the current status is not Pending', () => {
        const { rerender } = renderHook(() =>
            usePollStoreDomainIngestionLog({
                helpCenterId: 1,
                storeUrl: mockedStoreUrl,
                shopName: mockedStoreName,
                onStatusChange: mockedOnStatusChange,
            }),
        )

        mockUseGetStoreDomainIngestionLog.mockReturnValue({
            storeDomainIngestionLog: {
                ...mockedStoreDomainIngestionLog,
                status: IngestionLogStatus.Successful,
            },
            status: IngestionLogStatus.Successful,
            isGetIngestionLogsLoading: false,
        })

        rerender({ status: IngestionLogStatus.Successful })

        expect(mockedOnStatusChange).toHaveBeenCalledWith(
            IngestionLogStatus.Successful,
        )
    })
})
