import { flushPromises } from '@repo/testing'

import { getDB, STORE_NAME } from '../notificationDatabase'
import { shouldSendNotification } from '../shouldSendNotification'

jest.mock('../notificationDatabase', () => ({
    getDB: jest.fn(),
    STORE_NAME: 'notifications-dedupe',
}))

const getDBMock = getDB as jest.Mock

describe('shouldSendNotification', () => {
    let add: jest.Mock
    let objectStore: jest.Mock
    let transaction: jest.Mock
    let db: any
    let request: any
    let mockNow: jest.SpyInstance

    beforeEach(() => {
        request = {}
        add = jest.fn(() => request)
        objectStore = jest.fn(() => ({ add }))
        transaction = jest.fn(() => ({ objectStore }))
        db = { transaction }

        mockNow = jest.spyOn(Date, 'now').mockReturnValue(1234567890)
    })

    afterEach(() => {
        mockNow.mockRestore()
    })

    it('should return true if the database fails to open', async () => {
        getDBMock.mockRejectedValue(new Error('Failed to get DB'))
        const shouldSend = await shouldSendNotification('id')
        expect(shouldSend).toBe(true)
    })

    it('should return true if the record is successfully added', async () => {
        getDBMock.mockResolvedValue(db)

        const p = shouldSendNotification('id')
        await flushPromises()
        request.onsuccess?.()
        const shouldSend = await p

        expect(transaction).toHaveBeenCalledWith([STORE_NAME], 'readwrite')
        expect(objectStore).toHaveBeenCalledWith(STORE_NAME)
        expect(add).toHaveBeenCalledWith({ id: 'id', timestamp: 1234567890 })
        expect(shouldSend).toBe(true)
    })

    it('should return false if the record already exists (duplicate)', async () => {
        getDBMock.mockResolvedValue(db)

        const p = shouldSendNotification('id')
        await flushPromises()
        request.onerror?.()
        const shouldSend = await p

        expect(shouldSend).toBe(false)
    })
})
