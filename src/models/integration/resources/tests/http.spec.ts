import MockAdapter from 'axios-mock-adapter'
import {apiListCursorPaginationResponse} from 'fixtures/axiosResponse'

import client from 'models/api/resources'

import {getHTTPEvents, getHTTPEvent} from '../http'

const mockedServer = new MockAdapter(client)

describe('HTTP event resources', () => {
    beforeEach(() => {
        mockedServer.reset()
    })

    describe('getHTTPEvents', () => {
        it('should resolve with a list of http events on success', async () => {
            const response = [{id: 1}, {id: 2}]
            mockedServer
                .onGet('/api/integrations/1/events/')
                .reply(200, apiListCursorPaginationResponse(response))
            const res = await getHTTPEvents(1)
            expect(res.data.data).toEqual(response)
            expect(mockedServer.history).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onGet('/api/integrations/1/events/')
                .reply(404, {message: 'error'})
            return expect(getHTTPEvents(1)).rejects.toEqual(
                new Error('Request failed with status code 404')
            )
        })
    })

    describe('getHTTPEvent', () => {
        it('should resolve with an existing CustomField on success', async () => {
            const response = {id: 1}
            mockedServer
                .onGet('/api/integrations/1/events/1')
                .reply(200, response)
            const res = await getHTTPEvent(1, 1)

            expect(res.data).toEqual(response)
            expect(mockedServer.history).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onGet('/api/integrations/1/events/1')
                .reply(404, {message: 'error'})
            return expect(getHTTPEvent(1, 1)).rejects.toEqual(
                new Error('Request failed with status code 404')
            )
        })
    })
})
