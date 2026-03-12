import MockAdapter from 'axios-mock-adapter'
import _pick from 'lodash/pick'

import {
    capabilities as capabilitiesFixtures,
    phoneNumbers as phoneNumbersFixtures,
} from 'fixtures/phoneNumber'
import client from 'models/api/resources'
import { Cancel, CancelToken } from 'tests/axiosRuntime'

import {
    createPhoneNumber,
    deletePhoneNumber,
    fetchPhoneCapabilities,
    fetchPhoneNumbers,
    updatePhoneNumber,
} from '../resources'

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
                .reply(503, { message: 'error' })
            return expect(fetchPhoneNumbers()).rejects.toEqual(
                new Error('Request failed with status code 503'),
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
            const source = CancelToken.source()
            source.cancel()

            await expect(fetchPhoneNumbers(source.token)).rejects.toEqual(
                new Cancel(),
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
                .reply(503, { message: 'error' })
            return expect(
                createPhoneNumber(phoneNumberDraftMock),
            ).rejects.toEqual(new Error('Request failed with status code 503'))
        })
    })

    describe('updatePhoneNumber', () => {
        it('should resolve with the updated phone number on success', async () => {
            mockedServer
                .onPut(/\/api\/integrations\/phone\/phone-numbers\/\d+\//)
                .reply(200, phoneNumbersFixtures[0])
            const res = await updatePhoneNumber(phoneNumbersFixtures[0])
            expect(res).toMatchSnapshot()
            expect(mockedServer.history).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onPut(/\/api\/integrations\/phone\/phone-numbers\/\d+\//)
                .reply(503, { message: 'error' })
            return expect(
                updatePhoneNumber(phoneNumbersFixtures[0]),
            ).rejects.toEqual(new Error('Request failed with status code 503'))
        })
    })

    describe('deletePhoneNumber', () => {
        it('should resolve on success', async () => {
            mockedServer
                .onDelete(/\/api\/integrations\/phone\/phone-numbers\/\d+\//)
                .reply(200)
            const res = await deletePhoneNumber(1)
            expect(res).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onDelete(/\/api\/integrations\/phone\/phone-numbers\/\d+\//)
                .reply(503, { message: 'error' })
            return expect(deletePhoneNumber(1)).rejects.toEqual(
                new Error('Request failed with status code 503'),
            )
        })
    })
})

describe('capabilities limitations', () => {
    describe('fetchPhoneCapabilities', () => {
        it('should resolve with a map of phone number capabilities by country', async () => {
            mockedServer
                .onGet('/api/phone-numbers/capabilities-limitations/')
                .reply(200, capabilitiesFixtures)
            const res = await fetchPhoneCapabilities()
            expect(res).toMatchSnapshot()
        })
    })
})
