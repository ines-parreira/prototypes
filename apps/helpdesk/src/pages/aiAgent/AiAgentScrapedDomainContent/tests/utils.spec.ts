import { IngestionLogStatus } from '../constant'
import type { IngestionLog } from '../types'
import {
    getEffectiveSyncTime,
    getTheLatestIngestionLog,
    hasSuccessfullySyncedOnce,
} from '../utils'

describe('getEffectiveSyncTime', () => {
    it('should return undefined when log is undefined', () => {
        expect(getEffectiveSyncTime(undefined)).toBeUndefined()
    })

    it('should return current timestamp when status is Pending', () => {
        const log: IngestionLog = {
            id: 1,
            help_center_id: 123,
            status: IngestionLogStatus.Pending,
            latest_sync: '2024-01-15T10:00:00Z',
            url: 'https://test.com',
            source: 'domain',
        } as unknown as IngestionLog

        const beforeCall = Date.now()
        const result = getEffectiveSyncTime(log)
        const afterCall = Date.now()

        expect(result).toBeDefined()
        expect(result).toBeGreaterThanOrEqual(beforeCall)
        expect(result).toBeLessThanOrEqual(afterCall)
    })

    it('should return timestamp from latest_sync when status is not Pending', () => {
        const log: IngestionLog = {
            id: 1,
            help_center_id: 123,
            status: IngestionLogStatus.Successful,
            latest_sync: '2024-01-15T10:00:00Z',
            url: 'https://test.com',
            source: 'domain',
        } as unknown as IngestionLog

        const expectedTimestamp = new Date('2024-01-15T10:00:00Z').getTime()
        expect(getEffectiveSyncTime(log)).toBe(expectedTimestamp)
    })

    it('should return undefined when latest_sync is undefined', () => {
        const log: IngestionLog = {
            id: 1,
            help_center_id: 123,
            status: IngestionLogStatus.Successful,
            latest_sync: undefined,
            url: 'https://test.com',
            source: 'domain',
        } as unknown as IngestionLog

        expect(getEffectiveSyncTime(log)).toBeUndefined()
    })

    it('should return undefined when latest_sync is null', () => {
        const log: IngestionLog = {
            id: 1,
            help_center_id: 123,
            status: IngestionLogStatus.Successful,
            latest_sync: null,
            url: 'https://test.com',
            source: 'domain',
        } as unknown as IngestionLog

        expect(getEffectiveSyncTime(log)).toBeUndefined()
    })

    it('should handle Failed status correctly', () => {
        const log: IngestionLog = {
            id: 1,
            help_center_id: 123,
            status: IngestionLogStatus.Failed,
            latest_sync: '2024-01-14T08:00:00Z',
            url: 'https://test.com',
            source: 'domain',
        } as unknown as IngestionLog

        const expectedTimestamp = new Date('2024-01-14T08:00:00Z').getTime()
        expect(getEffectiveSyncTime(log)).toBe(expectedTimestamp)
    })
})

describe('getTheLatestIngestionLog', () => {
    it('should return undefined when ingestionLogs is undefined', () => {
        expect(getTheLatestIngestionLog(undefined)).toBeUndefined()
    })

    it('should return undefined when ingestionLogs is empty', () => {
        expect(getTheLatestIngestionLog([])).toBeUndefined()
    })

    it('should return the log with the most recent sync date', () => {
        const logs: IngestionLog[] = [
            {
                id: 1,
                status: IngestionLogStatus.Successful,
                latest_sync: '2024-01-15T10:00:00Z',
            },
            {
                id: 2,
                status: IngestionLogStatus.Successful,
                latest_sync: '2024-01-16T10:00:00Z',
            },
            {
                id: 3,
                status: IngestionLogStatus.Successful,
                latest_sync: '2024-01-14T10:00:00Z',
            },
        ] as unknown as IngestionLog[]

        const result = getTheLatestIngestionLog(logs)
        expect(result?.id).toBe(2)
    })

    it('should return current when latestLatestSync is undefined', () => {
        const logs: IngestionLog[] = [
            {
                id: 1,
                status: IngestionLogStatus.Successful,
                latest_sync: undefined,
            },
            {
                id: 2,
                status: IngestionLogStatus.Successful,
                latest_sync: '2024-01-16T10:00:00Z',
            },
        ] as unknown as IngestionLog[]

        const result = getTheLatestIngestionLog(logs)
        expect(result?.id).toBe(2)
    })

    it('should return latest when currentLatestSync is undefined', () => {
        const logs: IngestionLog[] = [
            {
                id: 1,
                status: IngestionLogStatus.Successful,
                latest_sync: '2024-01-15T10:00:00Z',
            },
            {
                id: 2,
                status: IngestionLogStatus.Successful,
                latest_sync: undefined,
            },
        ] as unknown as IngestionLog[]

        const result = getTheLatestIngestionLog(logs)
        expect(result?.id).toBe(1)
    })

    it('should handle multiple logs with undefined latest_sync', () => {
        const logs: IngestionLog[] = [
            {
                id: 1,
                status: IngestionLogStatus.Successful,
                latest_sync: undefined,
            },
            {
                id: 2,
                status: IngestionLogStatus.Successful,
                latest_sync: undefined,
            },
            {
                id: 3,
                status: IngestionLogStatus.Successful,
                latest_sync: '2024-01-15T10:00:00Z',
            },
        ] as unknown as IngestionLog[]

        const result = getTheLatestIngestionLog(logs)
        expect(result?.id).toBe(3)
    })

    it('should handle pending status correctly', () => {
        const logs: IngestionLog[] = [
            {
                id: 1,
                status: IngestionLogStatus.Successful,
                latest_sync: '2024-01-15T10:00:00Z',
            },
            {
                id: 2,
                status: IngestionLogStatus.Pending,
                latest_sync: '2024-01-14T10:00:00Z',
            },
        ] as unknown as IngestionLog[]

        const result = getTheLatestIngestionLog(logs)
        expect(result?.id).toBe(2)
    })
})

describe('hasSuccessfullySyncedOnce', () => {
    it('should return true if there is at least one successful sync', () => {
        const logs = [
            { latest_sync: '2023-10-01T12:00:00Z', status: 'SUCCESSFUL' },
            { latest_sync: '2023-10-02T12:00:00Z', status: 'FAILED' },
        ] as any

        expect(hasSuccessfullySyncedOnce(logs)).toBe(true)
    })

    it('should return false if there are no successful syncs', () => {
        const logs = [
            { latest_sync: '2023-10-01T12:00:00Z', status: 'FAILED' },
            { latest_sync: '2023-10-02T12:00:00Z', status: 'FAILED' },
        ] as any

        expect(hasSuccessfullySyncedOnce(logs)).toBe(false)
    })

    it('should return false if logs are empty', () => {
        expect(hasSuccessfullySyncedOnce([])).toBe(false)
    })

    it('should return false if logs are undefined', () => {
        expect(hasSuccessfullySyncedOnce(undefined)).toBe(false)
    })
})
