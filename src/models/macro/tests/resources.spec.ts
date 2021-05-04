import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import _pick from 'lodash/pick'

import {macros as macrosFixtures} from '../../../fixtures/macro'
import client from '../../api/index.js'
import {
    fetchMacros,
    fetchMacro,
    createMacro,
    deleteMacro,
    updateMacro,
} from '../resources'
import {MacroSortableProperties} from '../types'

const mockedServer = new MockAdapter(client)

describe('macro resources', () => {
    beforeEach(() => {
        mockedServer.reset()
    })

    describe('fetchMacros', () => {
        it('should resolve with a Macro list on success', async () => {
            mockedServer.onGet('/api/macros/').reply(200, {
                data: macrosFixtures,
                meta: {
                    current_page: 2,
                },
            })
            const res = await fetchMacros({search: 'hello'})
            expect(res).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer.onGet('/api/macros/').reply(503, {message: 'error'})
            return expect(fetchMacros()).rejects.toEqual(
                new Error('Request failed with status code 503')
            )
        })

        it('should format fallbackOrderBy correctly', async () => {
            mockedServer.onGet('/api/macros/').reply(200, {
                data: macrosFixtures,
                meta: {
                    current_page: 2,
                },
            })
            await fetchMacros({
                fallbackOrderBy: MacroSortableProperties.CreatedDatetime,
            })
            expect(mockedServer.history).toMatchSnapshot()
        })

        it('should format orderBy value to snake_case', async () => {
            mockedServer.onGet('/api/macros/').reply(200, {
                data: macrosFixtures,
                meta: {
                    current_page: 2,
                },
            })
            await fetchMacros({
                orderBy: MacroSortableProperties.CreatedDatetime,
            })
            expect(mockedServer.history).toMatchSnapshot()
        })

        it('should reject when cancelled', async () => {
            mockedServer.onGet('/api/macros/').reply(200, {
                data: macrosFixtures,
                meta: {
                    current_page: 2,
                },
            })
            const source = axios.CancelToken.source()
            source.cancel()

            await expect(
                fetchMacros(
                    {orderBy: MacroSortableProperties.CreatedDatetime},
                    source.token
                )
            ).rejects.toEqual(new axios.Cancel())
        })
    })

    describe('fetchMacro', () => {
        it('should resolve with a Macro on success', async () => {
            mockedServer
                .onGet(/\/api\/macros\/\d+\//)
                .reply(200, macrosFixtures[0])
            const res = await fetchMacro(1)
            expect(res).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onGet(/\/api\/macros\/\d+\//)
                .reply(503, {message: 'error'})
            return expect(fetchMacro(1)).rejects.toEqual(
                new Error('Request failed with status code 503')
            )
        })
    })

    describe('createMacro', () => {
        const macroDraftMock = _pick(macrosFixtures[0], ['actions', 'name'])

        it('should resolve with a new Macro on success', async () => {
            mockedServer.onPost('/api/macros/').reply(200, macrosFixtures[0])
            const res = await createMacro(macroDraftMock)

            expect(res).toMatchSnapshot()
            expect(mockedServer.history).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer.onPost('/api/macros/').reply(503, {message: 'error'})
            return expect(createMacro(macroDraftMock)).rejects.toEqual(
                new Error('Request failed with status code 503')
            )
        })
    })

    describe('deleteMacro', () => {
        it('should resolve on success', async () => {
            mockedServer.onDelete(/\/api\/macros\/\d+\//).reply(200)
            const res = await deleteMacro(1)
            expect(res).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onDelete(/\/api\/macros\/\d+\//)
                .reply(503, {message: 'error'})
            return expect(deleteMacro(1)).rejects.toEqual(
                new Error('Request failed with status code 503')
            )
        })
    })

    describe('updateMacro', () => {
        it('should resolve with the updated macro on success', async () => {
            mockedServer
                .onPut(/\/api\/macros\/\d+\//)
                .reply(200, macrosFixtures[0])
            const res = await updateMacro(macrosFixtures[0])
            expect(res).toMatchSnapshot()
            expect(mockedServer.history).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onPut(/\/api\/macros\/\d+\//)
                .reply(503, {message: 'error'})
            return expect(updateMacro(macrosFixtures[0])).rejects.toEqual(
                new Error('Request failed with status code 503')
            )
        })
    })
})
