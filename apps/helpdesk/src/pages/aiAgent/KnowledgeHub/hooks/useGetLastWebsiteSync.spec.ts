import { renderHook } from '@testing-library/react'

import { IngestionLogStatus } from 'pages/aiAgent/AiAgentScrapedDomainContent/constant'
import type { IngestionLog } from 'pages/aiAgent/AiAgentScrapedDomainContent/types'

import { useGetLastWebsiteSync } from './useGetLastWebsiteSync'

jest.mock('pages/aiAgent/AiAgentScrapedDomainContent/utils', () => {
    const actual = jest.requireActual(
        'pages/aiAgent/AiAgentScrapedDomainContent/utils',
    )
    return {
        ...actual,
        isSyncLessThan24Hours: jest.fn(),
        getNextSyncDate: jest.fn(),
    }
})

const mockIsSyncLessThan24Hours = jest.requireMock(
    'pages/aiAgent/AiAgentScrapedDomainContent/utils',
).isSyncLessThan24Hours as jest.Mock

const mockGetNextSyncDate = jest.requireMock(
    'pages/aiAgent/AiAgentScrapedDomainContent/utils',
).getNextSyncDate as jest.Mock

describe('useGetLastWebsiteSync', () => {
    const mockIngestionLog = {
        id: 1,
        help_center_id: 123,
        status: IngestionLogStatus.Successful,
        latest_sync: '2024-01-15T10:00:00Z',
        url: 'https://test-store.myshopify.com',
        source: 'domain',
    } as unknown as IngestionLog

    beforeEach(() => {
        jest.clearAllMocks()
        mockIsSyncLessThan24Hours.mockReturnValue(false)
        mockGetNextSyncDate.mockReturnValue('Jan 16, 2024 10:00 AM')
    })

    it('returns latestSync from storeDomainIngestionLog when status is not pending', () => {
        const { result } = renderHook(() =>
            useGetLastWebsiteSync(mockIngestionLog),
        )

        expect(result.current.latestSync).toBe(1705312800000)
    })

    it('returns current date ISO string when status is pending', () => {
        const pendingLog: IngestionLog = {
            ...mockIngestionLog,
            status: IngestionLogStatus.Pending,
        }

        const beforeCall = new Date().toISOString()
        const { result } = renderHook(() => useGetLastWebsiteSync(pendingLog))
        const afterCall = new Date().toISOString()

        const resultDate = new Date(result.current.latestSync || '')

        expect(new Date(beforeCall) <= resultDate).toBe(true)
        expect(resultDate <= new Date(afterCall)).toBe(true)
    })

    it('returns undefined latestSync when storeDomainIngestionLog is undefined', () => {
        const { result } = renderHook(() => useGetLastWebsiteSync(undefined))

        expect(result.current.latestSync).toBeUndefined()
    })

    it('calls isSyncLessThan24Hours with latestSync', () => {
        renderHook(() => useGetLastWebsiteSync(mockIngestionLog))

        expect(mockIsSyncLessThan24Hours).toHaveBeenCalledWith(1705312800000)
    })

    it('calls getNextSyncDate with latestSync', () => {
        renderHook(() => useGetLastWebsiteSync(mockIngestionLog))

        expect(mockGetNextSyncDate).toHaveBeenCalledWith(1705312800000)
    })

    it('returns isSyncLessThan24h from utility function', () => {
        mockIsSyncLessThan24Hours.mockReturnValue(true)

        const { result } = renderHook(() =>
            useGetLastWebsiteSync(mockIngestionLog),
        )

        expect(result.current.isSyncLessThan24h).toBe(true)
    })

    it('returns nextSyncDate from utility function', () => {
        mockGetNextSyncDate.mockReturnValue('Jan 16, 2024 2:30 PM')

        const { result } = renderHook(() =>
            useGetLastWebsiteSync(mockIngestionLog),
        )

        expect(result.current.nextSyncDate).toBe('Jan 16, 2024 2:30 PM')
    })

    it('handles failed status correctly', () => {
        const failedLog: IngestionLog = {
            ...mockIngestionLog,
            status: IngestionLogStatus.Failed,
            latest_sync: '2024-01-14T08:00:00Z',
        }

        const { result } = renderHook(() => useGetLastWebsiteSync(failedLog))

        expect(result.current.latestSync).toBe(1705219200000)
        expect(mockIsSyncLessThan24Hours).toHaveBeenCalledWith(1705219200000)
    })

    it('handles ingestion log without latest_sync field', () => {
        const logWithoutSync: IngestionLog = {
            ...mockIngestionLog,
            latest_sync: undefined,
        }

        const { result } = renderHook(() =>
            useGetLastWebsiteSync(logWithoutSync),
        )

        expect(result.current.latestSync).toBeUndefined()
    })

    it('recalculates values when storeDomainIngestionLog changes', () => {
        const { result, rerender } = renderHook(
            ({ log }) => useGetLastWebsiteSync(log),
            {
                initialProps: { log: mockIngestionLog },
            },
        )

        expect(result.current.latestSync).toBe(1705312800000)

        const updatedLog: IngestionLog = {
            ...mockIngestionLog,
            status: IngestionLogStatus.Pending,
            latest_sync: '2024-01-16T12:00:00Z',
        }

        rerender({ log: updatedLog })

        const resultDate = new Date(result.current.latestSync || '')
        const now = new Date()

        expect(resultDate.getTime()).toBeGreaterThanOrEqual(
            now.getTime() - 1000,
        )
        expect(resultDate.getTime()).toBeLessThanOrEqual(now.getTime() + 1000)
    })

    it('handles transition from undefined to defined ingestion log', () => {
        const { result, rerender } = renderHook(
            ({ log }) => useGetLastWebsiteSync(log),
            {
                initialProps: { log: undefined as IngestionLog | undefined },
            },
        )

        expect(result.current.latestSync).toBeUndefined()

        rerender({ log: mockIngestionLog })

        expect(result.current.latestSync).toBe(1705312800000)
    })
})
