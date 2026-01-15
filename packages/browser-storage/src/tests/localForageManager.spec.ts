import { waitFor } from '@testing-library/dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { localForageManager } from '../local-forage/localForageManager'

describe('LocalForageManager', () => {
    beforeEach(() => {
        localForageManager.tables = {}
    })

    describe('constructor', () => {
        it('should create an instance with name "Gorgias"', () => {
            expect(localForageManager.instance).toBeDefined()
            expect(localForageManager.instance).toHaveProperty('config')
        })

        it('should initialize with empty tables object', () => {
            expect(localForageManager.tables).toEqual({})
        })
    })

    describe('getTable', () => {
        it('should create a new table if it does not exist', () => {
            const tableName = 'testTable'
            const table = localForageManager.getTable(tableName)

            expect(table).toBeDefined()
            expect(localForageManager.tables[tableName]).toBeDefined()
        })

        it('should return existing table if it already exists', () => {
            const tableName = 'existingTable'
            const firstCall = localForageManager.getTable(tableName)
            const secondCall = localForageManager.getTable(tableName)

            expect(firstCall).toBe(secondCall)
        })

        it('should create tables with correct store name', async () => {
            const tableName = 'myStore'
            const table = localForageManager.getTable(tableName)

            const config = table.config()
            expect(config.name).toBe('Gorgias')
            expect(config.storeName).toBe(tableName)
        })

        it('should handle multiple different tables', () => {
            const table1 = localForageManager.getTable('table1')
            const table2 = localForageManager.getTable('table2')
            const table3 = localForageManager.getTable('table3')

            expect(table1).not.toBe(table2)
            expect(table2).not.toBe(table3)
            expect(Object.keys(localForageManager.tables)).toHaveLength(3)
        })
    })

    describe('observeTable', () => {
        it('should create a table if it does not exist', () => {
            const tableName = 'observableTable'
            const callback = vi.fn()

            localForageManager.observeTable(tableName, callback)

            expect(localForageManager.tables[tableName]).toBeDefined()
        })

        it('should return an observable subscription', () => {
            const tableName = 'crossTabTable'
            const callback = vi.fn()

            const subscription = localForageManager.observeTable(
                tableName,
                callback,
            )

            expect(subscription).toBeDefined()
            expect(localForageManager.tables[tableName]).toBeDefined()
        })

        it('should return a subscription object', () => {
            const tableName = 'subscriptionTable'
            const callback = vi.fn()

            const subscription = localForageManager.observeTable(
                tableName,
                callback,
            )

            expect(subscription).toBeDefined()
            expect(subscription).toHaveProperty('unsubscribe')
            expect(typeof subscription.unsubscribe).toBe('function')
        })

        it('should call callback when table value changes', async () => {
            const tableName = 'changeTable'
            const callback = vi.fn()

            localForageManager.observeTable(tableName, callback)
            const table = localForageManager.getTable(tableName)

            await table.setItem('key1', 'value1')

            await waitFor(() => {
                expect(callback).toHaveBeenCalled()
            })
        })

        it('should not call callback when there is no value change', async () => {
            const tableName = 'noChangeTable'
            const callback = vi.fn()

            const table = localForageManager.getTable(tableName)
            await table.setItem('key1', 'value1')

            callback.mockClear()
            localForageManager.observeTable(tableName, callback)

            await new Promise((resolve) => setTimeout(resolve, 100))

            expect(callback).not.toHaveBeenCalled()
        })

        it('should allow unsubscribing from observations', async () => {
            const tableName = 'unsubscribeTable'
            const callback = vi.fn()

            const subscription = localForageManager.observeTable(
                tableName,
                callback,
            )
            const table = localForageManager.getTable(tableName)

            await table.setItem('key1', 'value1')
            await waitFor(() => {
                expect(callback).toHaveBeenCalled()
            })

            const callCountBeforeUnsubscribe = callback.mock.calls.length
            subscription.unsubscribe()

            await table.setItem('key2', 'value2')
            await new Promise((resolve) => setTimeout(resolve, 100))

            expect(callback.mock.calls.length).toBe(callCountBeforeUnsubscribe)
        })

        it('should handle async callbacks', async () => {
            const tableName = 'asyncCallbackTable'
            const asyncCallback = vi.fn(async () => {
                await new Promise((resolve) => setTimeout(resolve, 50))
            })

            localForageManager.observeTable(tableName, asyncCallback)
            const table = localForageManager.getTable(tableName)

            await table.setItem('key1', 'value1')

            await waitFor(() => {
                expect(asyncCallback).toHaveBeenCalled()
            })
        })
    })

    describe('clearTable', () => {
        it('should clear an existing table', async () => {
            const tableName = 'clearableTable'
            const table = localForageManager.getTable(tableName)

            await table.setItem('key1', 'value1')
            await table.setItem('key2', 'value2')

            const lengthBefore = await table.length()
            expect(lengthBefore).toBe(2)

            localForageManager.clearTable(tableName)

            await waitFor(async () => {
                const lengthAfter = await table.length()
                expect(lengthAfter).toBe(0)
            })
        })

        it('should not throw error when clearing non-existent table', () => {
            expect(() => {
                localForageManager.clearTable('nonExistentTable')
            }).not.toThrow()
        })

        it('should handle clearing already empty table', () => {
            const tableName = 'emptyTable'
            localForageManager.getTable(tableName)

            expect(() => {
                localForageManager.clearTable(tableName)
            }).not.toThrow()
        })

        it('should clear only the specified table', async () => {
            const table1Name = 'table1'
            const table2Name = 'table2'

            const table1 = localForageManager.getTable(table1Name)
            const table2 = localForageManager.getTable(table2Name)

            await table1.setItem('key1', 'value1')
            await table2.setItem('key2', 'value2')

            localForageManager.clearTable(table1Name)

            await waitFor(async () => {
                const table1Length = await table1.length()
                expect(table1Length).toBe(0)
            })

            const table2Length = await table2.length()
            expect(table2Length).toBe(1)
        })
    })

    describe('integration scenarios', () => {
        it('should handle table creation, observation, and clearing together', async () => {
            const tableName = 'integrationTable'
            const callback = vi.fn()

            const subscription = localForageManager.observeTable(
                tableName,
                callback,
            )
            const table = localForageManager.getTable(tableName)

            await table.setItem('key1', 'value1')

            await waitFor(() => {
                expect(callback).toHaveBeenCalled()
            })

            localForageManager.clearTable(tableName)

            await waitFor(async () => {
                const length = await table.length()
                expect(length).toBe(0)
            })

            subscription.unsubscribe()
        })

        it('should handle multiple observers on the same table', async () => {
            const tableName = 'multiObserverTable'
            const callback1 = vi.fn()
            const callback2 = vi.fn()

            localForageManager.observeTable(tableName, callback1)
            localForageManager.observeTable(tableName, callback2)

            const table = localForageManager.getTable(tableName)
            await table.setItem('key1', 'value1')

            await waitFor(() => {
                expect(callback1).toHaveBeenCalled()
                expect(callback2).toHaveBeenCalled()
            })
        })
    })
})
