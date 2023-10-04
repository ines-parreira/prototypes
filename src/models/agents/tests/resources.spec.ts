import MockAdapter from 'axios-mock-adapter'

import client from 'models/api/resources'
import {agents} from 'fixtures/agents'

import {fetchAgents, fetchAgent} from '../resources'

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

    describe('fetchAgent', () => {
        it('should resolve with an agent on success', async () => {
            mockedServer.onGet('/api/users/1').reply(200, agents[0])

            const res = await fetchAgent(1)
            expect(res).toEqual(agents[0])
        })

        it('should reject an error on fail', () => {
            mockedServer.onGet('/api/users/1').reply(503, {message: 'error'})
            return expect(fetchAgent(1)).rejects.toEqual(
                new Error('Request failed with status code 503')
            )
        })
    })
})
