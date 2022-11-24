import MockAdapter from 'axios-mock-adapter'

import client from 'models/api/resources'
import {agents} from 'fixtures/agents'

import {fetchAgents} from '../resources'

const mockedServer = new MockAdapter(client)

describe('Agents resources', () => {
    beforeEach(() => {
        mockedServer.reset()
    })

    describe('fetchAgents', () => {
        it('should resolve with a list of agents on success', async () => {
            mockedServer.onGet('/api/users/').reply(200, {
                data: {
                    data: agents,
                    meta: {next_cursor: null, prev_cursor: null},
                },
            })

            const res = await fetchAgents()
            expect(res).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer.onGet('/api/users/').reply(503, {message: 'error'})
            return expect(fetchAgents()).rejects.toEqual(
                new Error('Request failed with status code 503')
            )
        })
    })
})
