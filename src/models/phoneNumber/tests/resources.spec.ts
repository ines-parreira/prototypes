import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import _pick from 'lodash/pick'

import {phoneNumbers as phoneNumbersFixtures} from 'fixtures/phoneNumber'
import client from 'models/api/resources'
import {fetchPhoneNumbers, createPhoneNumber} from '../resources'

const mockedServer = new MockAdapter(client)

describe('phone numbers resources', () => {
    beforeEach(() => {
        mockedServer.reset()
    })

    describe('fetchPhoneNumbers', () => {
        it('should resolve with a PhoneNumber list on success', async () => {
            mockedServer
                .onGet('/api/integrations/phone/phone-numbers/')
                .reply(200, {
                    data: phoneNumbersFixtures,
                    meta: {
                        current_page: 2,
                    },
                })
            const res = await fetchPhoneNumbers()
            expect(res).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onGet('/api/integrations/phone/phone-numbers/')
                .reply(503, {message: 'error'})
            return expect(fetchPhoneNumbers()).rejects.toEqual(
                new Error('Request failed with status code 503')
            )
        })

        it('should reject when cancelled', async () => {
            mockedServer
                .onGet('/api/integrations/phone/phone-numbers/')
                .reply(200, {
                    data: phoneNumbersFixtures,
                    meta: {
                        current_page: 2,
                    },
                })
            const source = axios.CancelToken.source()
            source.cancel()

            await expect(fetchPhoneNumbers(source.token)).rejects.toEqual(
                new axios.Cancel()
            )
        })
    })

    describe('createPhoneNumber', () => {
        const phoneNumberDraftMock = _pick(phoneNumbersFixtures[0], ['name'])

        it('should resolve with a new PhoneNumber on success', async () => {
            mockedServer
                .onPost('/api/integrations/phone/phone-numbers/')
                .reply(200, phoneNumbersFixtures[0])
            const res = await createPhoneNumber(phoneNumberDraftMock)

            expect(res).toMatchSnapshot()
            expect(mockedServer.history).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onPost('/api/integrations/phone/phone-numbers/')
                .reply(503, {message: 'error'})
            return expect(
                createPhoneNumber(phoneNumberDraftMock)
            ).rejects.toEqual(new Error('Request failed with status code 503'))
        })
    })
})
