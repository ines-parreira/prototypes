import MockAdapter from 'axios-mock-adapter'

import {rules as rulesFixtures} from '../../../fixtures/rule'
import client from '../../api/index.js'
import {
    fetchRules,
    fetchRule,
    createRule,
    deleteRule,
    updateRule,
    reorderRules,
    deactivateRule,
    activateRule,
} from '../resources'

const mockedServer = new MockAdapter(client)

describe('rule resources', () => {
    const mockDate = new Date(0).toUTCString()
    beforeEach(() => {
        mockedServer.reset()
        jest.spyOn(global, 'Date').mockImplementation(() => mockDate) // mocks deactivated datetime
    })

    describe('fetchRules', () => {
        it('should resolve with a Rule list on success', async () => {
            mockedServer.onGet('/api/rules/').reply(200, {
                data: rulesFixtures,
            })
            const res = await fetchRules()
            expect(res.data).toStrictEqual(rulesFixtures)
        })

        it('should reject an error on fail', () => {
            mockedServer.onGet('/api/rules/').reply(503, {message: 'error'})
            return expect(fetchRules()).rejects.toEqual(
                new Error('Request failed with status code 503')
            )
        })
    })

    describe('fetchRule', () => {
        it('should resolve with a Rule on success', async () => {
            mockedServer
                .onGet(/\/api\/rules\/\d+\//)
                .reply(200, rulesFixtures[0])
            const res = await fetchRule(1)
            expect(res).toStrictEqual(rulesFixtures[0])
        })
        it('should reject an error on fail', () => {
            mockedServer
                .onGet(/\/api\/rules\/\d+\//)
                .reply(503, {message: 'error'})
            return expect(fetchRule(1)).rejects.toEqual(
                new Error('Request failed with status code 503')
            )
        })
    })
    describe('createRule', () => {
        it('should resolve with the created rule on success', async () => {
            mockedServer.onPost('/api/rules/').reply(200, rulesFixtures[0])
            const res = await createRule(rulesFixtures[0])
            expect(res).toStrictEqual(rulesFixtures[0])
        })
        it('should reject an error on fail', () => {
            mockedServer.onPost('/api/rules/').reply(503, {message: 'error'})
            return expect(createRule(rulesFixtures[0])).rejects.toEqual(
                new Error('Request failed with status code 503')
            )
        })
    })

    describe('deleteRule', () => {
        it('should resolve on success', async () => {
            mockedServer.onDelete(/\/api\/rules\/\d+\//).reply(200)
            const res = await deleteRule(1)
            expect(res).toBe(undefined)
        })
        it('should reject an error on fail', () => {
            mockedServer
                .onDelete(/\/api\/rules\/\d+\//)
                .reply(503, {message: 'error'})
            return expect(deleteRule(1)).rejects.toEqual(
                new Error('Request failed with status code 503')
            )
        })
    })

    describe('updateRule', () => {
        it('should resolve with the updated rule on success', async () => {
            mockedServer
                .onPut(/\/api\/rules\/\d+\//)
                .reply(200, rulesFixtures[0])
            const res = await updateRule(rulesFixtures[0])
            expect(res).toStrictEqual(rulesFixtures[0])
            expect(mockedServer.history.put).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onPut(/\/api\/rules\/\d+\//)
                .reply(503, {message: 'error'})
            return expect(updateRule(rulesFixtures[0])).rejects.toEqual(
                new Error('Request failed with status code 503')
            )
        })
    })

    describe('reorder rules', () => {
        it('should resolve with the reordered rules on success', async () => {
            mockedServer
                .onPost('/api/rules/priorities/')
                .reply(200, rulesFixtures)
            const res = await reorderRules([{id: 1, priority: 100}])
            expect(res).toStrictEqual(rulesFixtures)
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onPost('/api/rules/priorities/')
                .reply(503, {message: 'error'})
            return expect(
                reorderRules([{id: 1, priority: 100}])
            ).rejects.toEqual(new Error('Request failed with status code 503'))
        })
    })

    describe('activate rule', () => {
        it('should resolve with the activated rule on success', async () => {
            mockedServer
                .onPut(/\/api\/rules\/\d+\//)
                .reply(200, rulesFixtures[0])
            const res = await activateRule(rulesFixtures[0])
            expect(res).toStrictEqual(rulesFixtures[0])
            expect(mockedServer.history.put[0].data).toMatchSnapshot()
        })
        it('should reject an error on fail', () => {
            mockedServer
                .onPut(/\/api\/rules\/\d+\//)
                .reply(503, {message: 'error'})
            return expect(activateRule(rulesFixtures[0])).rejects.toEqual(
                new Error('Request failed with status code 503')
            )
        })
    })
    describe('deactivate rule', () => {
        it('should resolve with the deactivated rule on success', async () => {
            mockedServer
                .onPut(/\/api\/rules\/\d+\//)
                .reply(200, rulesFixtures[0])
            const res = await deactivateRule(rulesFixtures[0])
            expect(res).toStrictEqual(rulesFixtures[0])
            expect(mockedServer.history.put[0].data).toMatchSnapshot()
        })
        it('should reject an error on fail', () => {
            mockedServer
                .onPut(/\/api\/rules\/\d+\//)
                .reply(503, {message: 'error'})
            return expect(deactivateRule(rulesFixtures[0])).rejects.toEqual(
                new Error('Request failed with status code 503')
            )
        })
    })
})
