import MockAdapter from 'axios-mock-adapter'

import {agents} from 'fixtures/agents'
import client from 'models/api/resources'

import * as resources from '../resources'

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

            const res = await resources.fetchAgents()
            expect(res).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer.onGet('/api/users/').reply(503, {message: 'error'})
            return expect(resources.fetchAgents()).rejects.toEqual(
                new Error('Request failed with status code 503')
            )
        })
    })

    describe('fetchAgent', () => {
        it('should resolve with an agent on success', async () => {
            mockedServer.onGet('/api/users/1').reply(200, agents[0])

            const res = await resources.fetchAgent(1)
            expect(res).toEqual(agents[0])
        })

        it('should reject an error on fail', () => {
            mockedServer.onGet('/api/users/1').reply(503, {message: 'error'})
            return expect(resources.fetchAgent(1)).rejects.toEqual(
                new Error('Request failed with status code 503')
            )
        })
    })

    describe('agent mutations: ', () => {
        const agent = agents[0]
        const id = agent.id
        it.each([
            ['createAgent', 'Post', '/api/users', agent, agent],
            ['updateAgent', 'Put', `/api/users/${id}`, {id, agent}, agent],
            ['deleteAgent', 'Delete', `/api/users/${id}`, id, undefined],
            ['inviteAgent', 'Post', `/api/users/${id}/invite`, id, undefined],
        ] as const)(
            '%s should resolve on success',
            async (name, method, endpoint, param, returnedData) => {
                mockedServer[`on${method}` as const](endpoint).reply(
                    200,
                    returnedData
                )

                const res = await resources[name](param as any)
                expect(res.data).toEqual(returnedData)
            }
        )
    })
})
