import MockAdapter from 'axios-mock-adapter'

import {customField, customFieldInput} from 'fixtures/customField'
import client from 'models/api/resources'

import {
    createCustomField,
    getCustomField,
    updateCustomField,
} from '../resources'

const mockedServer = new MockAdapter(client)

describe('custom field resources', () => {
    beforeEach(() => {
        mockedServer.reset()
    })

    describe('getCustomField', () => {
        it('should resolve with an existing CustomField on success', async () => {
            mockedServer.onGet('/api/custom-fields/123').reply(200, customField)
            const res = await getCustomField(123)

            expect(res).toMatchSnapshot()
            expect(mockedServer.history).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onGet('/api/custom-fields/123')
                .reply(404, {message: 'error'})
            return expect(getCustomField(123)).rejects.toEqual(
                new Error('Request failed with status code 404')
            )
        })
    })

    describe('createCustomField', () => {
        it('should resolve with a new CustomField on success', async () => {
            mockedServer.onPost('/api/custom-fields').reply(200, customField)
            const res = await createCustomField(customFieldInput)

            expect(res).toMatchSnapshot()
            expect(mockedServer.history).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onPost('/api/custom-fields')
                .reply(503, {message: 'error'})
            return expect(createCustomField(customFieldInput)).rejects.toEqual(
                new Error('Request failed with status code 503')
            )
        })
    })

    describe('updateCustomField', () => {
        it('should resolve with an updated CustomField on success', async () => {
            mockedServer.onPut('/api/custom-fields/123').reply(200, customField)
            const res = await updateCustomField(123, customFieldInput)

            expect(res).toMatchSnapshot()
            expect(mockedServer.history).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onPut('/api/custom-fields/123')
                .reply(503, {message: 'error'})
            return expect(
                updateCustomField(123, customFieldInput)
            ).rejects.toEqual(new Error('Request failed with status code 503'))
        })
    })
})
