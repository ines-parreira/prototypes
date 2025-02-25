import MockAdapter from 'axios-mock-adapter'

import client from 'models/api/resources'

import {
    createStoreMapping,
    deleteStoreMapping,
    listStoreMappings,
    updateStoreMapping,
} from '../resources'

const mockedServer = new MockAdapter(client)

const defaultStoreMapping = { store_id: 2, integration_id: 1 }

describe('store mapping resources', () => {
    beforeEach(() => {
        mockedServer.reset()
    })

    describe('listStoreMappings', () => {
        it('should resolve with a StoreMapping list on success', async () => {
            mockedServer
                .onGet('/api/automate/store-mappings')
                .reply(200, { data: [defaultStoreMapping] })
            const res = await listStoreMappings([1])
            expect(res).toEqual([defaultStoreMapping])
        })

        it('should reject an error on fail', () => {
            mockedServer.onGet('/api/automate/store-mappings').reply(500, {
                message: 'error',
            })
            return expect(listStoreMappings([1])).rejects.toEqual(
                new Error('Request failed with status code 500'),
            )
        })
    })

    describe('createStoreMapping', () => {
        it('should resolve with a new StoreMapping on success', async () => {
            mockedServer
                .onPost('/api/automate/store-mappings')
                .reply(200, defaultStoreMapping)
            const res = await createStoreMapping(defaultStoreMapping)
            expect(res).toEqual(defaultStoreMapping)
        })

        it('should reject an error on fail', () => {
            mockedServer.onPost('/api/automate/store-mappings').reply(500, {
                message: 'error',
            })
            return expect(
                createStoreMapping(defaultStoreMapping),
            ).rejects.toEqual(new Error('Request failed with status code 500'))
        })
    })

    describe('updateStoreMapping', () => {
        it('should resolve with the updated StoreMapping on success', async () => {
            mockedServer
                .onPut(
                    `/api/automate/store-mappings/${defaultStoreMapping.integration_id}/`,
                )
                .reply(200, defaultStoreMapping)
            const res = await updateStoreMapping(
                defaultStoreMapping,
                defaultStoreMapping.integration_id,
            )
            expect(res).toEqual(defaultStoreMapping)
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onPut(
                    `/api/automate/store-mappings/${defaultStoreMapping.integration_id}/`,
                )
                .reply(500, {
                    message: 'error',
                })
            return expect(
                updateStoreMapping(
                    defaultStoreMapping,
                    defaultStoreMapping.integration_id,
                ),
            ).rejects.toEqual(new Error('Request failed with status code 500'))
        })
    })

    describe('deleteStoreMapping', () => {
        it('should resolve on success', async () => {
            mockedServer
                .onDelete(
                    `/api/automate/store-mappings/${defaultStoreMapping.integration_id}/`,
                )
                .reply(200)
            const res = await deleteStoreMapping(
                defaultStoreMapping.integration_id,
            )
            expect(res).toEqual(undefined)
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onDelete(
                    `/api/automate/store-mappings/${defaultStoreMapping.integration_id}/`,
                )
                .reply(500, {
                    message: 'error',
                })
            return expect(
                deleteStoreMapping(defaultStoreMapping.integration_id),
            ).rejects.toEqual(new Error('Request failed with status code 500'))
        })
    })
})
