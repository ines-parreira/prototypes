import { hasSuccessfullySyncedOnce } from '../utils'

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
