import MockAdapter from 'axios-mock-adapter'
import _pick from 'lodash/pick'

import { macros as macrosFixtures } from 'fixtures/macro'
import client from 'models/api/resources'
import { OrderDirection } from 'models/api/types'
import { Cancel, CancelToken } from 'tests/axiosRuntime'

import {
    createMacro,
    deleteMacro,
    fetchMacro,
    fetchMacros,
    updateMacro,
} from '../resources'
import { MacroSortableProperties } from '../types'

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
                    prev_cursor: null,
                    next_cursor: null,
                },
            })
            const res = await fetchMacros({ search: 'hello' })
            expect(res).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer.onGet('/api/macros/').reply(503, { message: 'error' })
            return expect(fetchMacros()).rejects.toEqual(
                new Error('Request failed with status code 503'),
            )
        })

        it('should reject when cancelled', async () => {
            mockedServer.onGet('/api/macros/').reply(200, {
                data: macrosFixtures,
                meta: {
                    prev_cursor: null,
                    next_cursor: null,
                },
            })
            const source = CancelToken.source()
            source.cancel()

            await expect(
                fetchMacros(
                    {
                        order_by: `${MacroSortableProperties.CreatedDatetime}:${OrderDirection.Asc}`,
                    },
                    { cancelToken: source.token },
                ),
            ).rejects.toEqual(new Cancel())
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
                .reply(503, { message: 'error' })
            return expect(fetchMacro(1)).rejects.toEqual(
                new Error('Request failed with status code 503'),
            )
        })
    })

    describe('createMacro', () => {
        const macroDraftMock = _pick(macrosFixtures[0], [
            'actions',
            'name',
            'language',
        ])

        it('should resolve with a new Macro on success', async () => {
            mockedServer.onPost('/api/macros/').reply(200, macrosFixtures[0])
            const res = await createMacro(macroDraftMock)

            expect(res).toMatchSnapshot()
            expect(mockedServer.history).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer.onPost('/api/macros/').reply(503, { message: 'error' })
            return expect(createMacro(macroDraftMock)).rejects.toEqual(
                new Error('Request failed with status code 503'),
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
                .reply(503, { message: 'error' })
            return expect(deleteMacro(1)).rejects.toEqual(
                new Error('Request failed with status code 503'),
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
                .reply(503, { message: 'error' })
            return expect(updateMacro(macrosFixtures[0])).rejects.toEqual(
                new Error('Request failed with status code 503'),
            )
        })
    })
})
