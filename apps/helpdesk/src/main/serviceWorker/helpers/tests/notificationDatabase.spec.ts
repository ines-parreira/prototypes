type IDBMock = {
    error?: string
    result?: any
    onblocked?: () => void
    onerror?: () => void
    onsuccess?: () => void
    onupgradeneeded?: (event: any) => void
}

describe('getDB', () => {
    let open: jest.Mock

    beforeEach(() => {
        jest.resetModules()

        open = jest.fn()
        global.indexedDB = { open } as unknown as IDBFactory
    })

    it('should return the database on success', async () => {
        const obj: IDBMock = { result: 'db' }
        open.mockReturnValue(obj)

        const { getDB } = require('../notificationDatabase')
        const p = getDB()

        obj.onsuccess?.()
        const db = await p
        expect(db).toBe('db')
    })

    it('should throw an error if the database failed to open', async () => {
        const obj: IDBMock = { error: 'Oh no!' }
        open.mockReturnValue(obj)

        const { getDB } = require('../notificationDatabase')
        const p = getDB()

        try {
            obj.onerror?.()
            await p
        } catch (err: unknown) {
            expect(err).toEqual(new Error('Failed to open DB: Oh no!'))
        }
    })

    it('should create the database schema if needed', async () => {
        const createObjectStore = jest.fn()
        const event = {
            target: {
                result: {
                    createObjectStore,
                    objectStoreNames: { contains: () => false },
                },
            },
        }
        const obj: IDBMock = {}
        open.mockReturnValue(obj)

        const { getDB, STORE_NAME } = require('../notificationDatabase')
        const p = getDB()

        obj.onupgradeneeded?.(event)
        obj.onsuccess?.()
        await p

        expect(createObjectStore).toHaveBeenCalledWith(STORE_NAME, {
            keyPath: 'id',
        })
    })

    it('should throw an error if opening the database is blocked', async () => {
        const obj: IDBMock = { error: 'Oh no!' }
        open.mockReturnValue(obj)

        const { getDB } = require('../notificationDatabase')
        const p = getDB()

        try {
            obj.onblocked?.()
            await p
        } catch (err: unknown) {
            expect(err).toEqual(new Error('Database open blocked'))
        }
    })
})
