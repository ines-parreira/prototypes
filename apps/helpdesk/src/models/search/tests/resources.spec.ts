import MockAdapter from 'axios-mock-adapter'

import client from 'models/api/resources'
import {
    search,
    SEARCH_ENDPOINT,
    SEARCH_ENGINE_HEADER,
} from 'models/search/resources'
import type { SearchApiResponse, SearchParams } from 'models/search/types'
import { SearchType } from 'models/search/types'
import { Cancel, CancelToken } from 'tests/axiosRuntime'

const mockedServer = new MockAdapter(client)

describe('search resource', () => {
    const defaultParams: SearchParams = {
        query: 'foo',
        type: SearchType.UserChannelEmail,
    }
    const defaultResponse: SearchApiResponse<unknown> = {
        data: [{ foo: 'bar' }],
        meta: {},
        object: 'list',
        uri: '',
    }

    describe('search', () => {
        it(`should call the search endpoint with the type`, async () => {
            mockedServer.onPost(SEARCH_ENDPOINT).reply(200, defaultResponse)

            await search(defaultParams)

            expect(mockedServer.history).toMatchSnapshot()
        })

        it('should return results', async () => {
            mockedServer.onPost(SEARCH_ENDPOINT).reply(200, defaultResponse)

            const res = await search(defaultParams)

            expect(res).toMatchSnapshot()
        })

        it('should return the search engine', async () => {
            const engineHeader = 'some_header'
            mockedServer.onPost(SEARCH_ENDPOINT).reply(200, defaultResponse, {
                [SEARCH_ENGINE_HEADER]: engineHeader,
            })

            const { searchEngine } = await search(defaultParams)

            expect(searchEngine).toBe(engineHeader)
        })

        it('should reject on cancel', async () => {
            const source = CancelToken.source()
            source.cancel()

            await expect(
                search({
                    ...defaultParams,
                    cancelToken: source.token,
                }),
            ).rejects.toEqual(new Cancel())
        })
    })
})
