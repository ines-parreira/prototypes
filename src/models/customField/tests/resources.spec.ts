import MockAdapter from 'axios-mock-adapter'

import {
    ticketInputFieldDefinition,
    customFieldInputDefinition,
} from 'fixtures/customField'
import client from 'models/api/resources'

import {
    createCustomField,
    getCustomField,
    getCustomFields,
    updateCustomField,
    updateCustomFields,
    updateCustomFieldValue,
    updatePartialCustomField,
} from '../resources'

const mockedServer = new MockAdapter(client)

describe('custom field resources', () => {
    beforeEach(() => {
        mockedServer.reset()
    })

    describe('getCustomFields', () => {
        it('should resolve with a list of paginated CustomFields on success', async () => {
            mockedServer
                .onGet('/api/custom-fields/')
                .reply(200, {data: [ticketInputFieldDefinition]})
            const res = await getCustomFields({
                archived: false,
                object_type: 'Ticket',
            })
            expect(res).toMatchSnapshot()
            expect(mockedServer.history).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onGet('/api/custom-fields')
                .reply(404, {message: 'error'})
            return expect(
                getCustomFields({
                    archived: false,
                    object_type: 'Ticket',
                })
            ).rejects.toEqual(new Error('Request failed with status code 404'))
        })
    })

    describe('getCustomField', () => {
        it('should resolve with an existing CustomField on success', async () => {
            mockedServer
                .onGet('/api/custom-fields/123')
                .reply(200, ticketInputFieldDefinition)
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
            mockedServer
                .onPost('/api/custom-fields')
                .reply(200, ticketInputFieldDefinition)
            const res = await createCustomField(customFieldInputDefinition)

            expect(res).toMatchSnapshot()
            expect(mockedServer.history).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onPost('/api/custom-fields')
                .reply(503, {message: 'error'})
            return expect(
                createCustomField(customFieldInputDefinition)
            ).rejects.toEqual(new Error('Request failed with status code 503'))
        })
    })

    describe('updateCustomField', () => {
        it('should resolve with an updated CustomField on success', async () => {
            mockedServer
                .onPut('/api/custom-fields/123')
                .reply(200, ticketInputFieldDefinition)
            const res = await updateCustomField(123, customFieldInputDefinition)

            expect(res).toMatchSnapshot()
            expect(mockedServer.history).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onPut('/api/custom-fields/123')
                .reply(503, {message: 'error'})
            return expect(
                updateCustomField(123, customFieldInputDefinition)
            ).rejects.toEqual(new Error('Request failed with status code 503'))
        })
    })

    describe('updateCustomFields', () => {
        it('should resolve with a list of updated CustomFields on success', async () => {
            mockedServer
                .onPut('/api/custom-fields/')
                .reply(200, {data: [ticketInputFieldDefinition]})
            const res = await updateCustomFields([
                {
                    id: ticketInputFieldDefinition.id,
                    priority: 999,
                },
            ])

            expect(res).toMatchSnapshot()
            expect(mockedServer.history).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onPut('/api/custom-fields/')
                .reply(503, {message: 'error'})
            return expect(
                updateCustomFields([
                    {
                        id: ticketInputFieldDefinition.id,
                        priority: 999,
                    },
                ])
            ).rejects.toEqual(new Error('Request failed with status code 503'))
        })
    })

    describe('updatePartialCustomField', () => {
        it('should resolve with an updated CustomField on success', async () => {
            mockedServer
                .onPut('/api/custom-fields/123')
                .reply(200, ticketInputFieldDefinition)
            const res = await updatePartialCustomField(
                123,
                customFieldInputDefinition
            )

            expect(res).toMatchSnapshot()
            expect(mockedServer.history).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onPut('/api/custom-fields/123')
                .reply(503, {message: 'error'})
            return expect(
                updatePartialCustomField(123, customFieldInputDefinition)
            ).rejects.toEqual(new Error('Request failed with status code 503'))
        })
    })

    describe('updateCustomFieldValue', () => {
        it.each([true, false, 0, 1, 123, 'foo_bar'])(
            'should resolve with an updated CustomField on success',
            async (value) => {
                mockedServer.onPut('/api/tickets/1/custom-fields/1').reply(200)

                await updateCustomFieldValue({
                    fieldType: 'Ticket',
                    holderId: 1,
                    fieldId: 1,
                    value: value,
                })

                expect(mockedServer.history.put.length).toBe(1)
                expect(mockedServer.history.put[0].data).toBe(
                    JSON.stringify(value)
                )
            }
        )

        it('should reject an error on fail', () => {
            mockedServer
                .onPut('/api/tickets/1/custom-fields/1')
                .reply(503, {message: 'error'})
            return expect(
                updateCustomFieldValue({
                    fieldType: 'Ticket',
                    holderId: 1,
                    fieldId: 1,
                    value: '123',
                })
            ).rejects.toEqual(new Error('Request failed with status code 503'))
        })
    })
})
