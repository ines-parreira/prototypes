import MockAdapter from 'axios-mock-adapter'

import {customField, customFieldInput} from 'fixtures/customField'
import client from 'models/api/resources'

import {createCustomField} from '../resources'

const mockedServer = new MockAdapter(client)

describe('custom field resources', () => {
    beforeEach(() => {
        mockedServer.reset()
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
})
