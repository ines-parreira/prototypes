import MockAdapter from 'axios-mock-adapter'
import _pick from 'lodash/pick'

import { ListTagsOrderBy } from '@gorgias/helpdesk-queries'

import { tags as tagsFixtures } from 'fixtures/tag'
import client from 'models/api/resources'
import { OrderDirection } from 'models/api/types'
import { Cancel, CancelToken } from 'tests/axiosRuntime'

import {
    createTag,
    deleteTag,
    fetchTag,
    fetchTags,
    updateTag,
} from '../resources'

const mockedServer = new MockAdapter(client)

const meta = {
    next_cursor: null,
    prev_cursor: null,
}

describe('tag resources', () => {
    beforeEach(() => {
        mockedServer.reset()
    })

    describe('fetchTags', () => {
        it('should resolve with a Tag list on success', async () => {
            mockedServer.onGet('/api/tags/').reply(200, {
                data: tagsFixtures,
                meta,
            })
            const res = await fetchTags({ search: 'hello' })
            expect(res).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer.onGet('/api/tags/').reply(503, { message: 'error' })
            return expect(fetchTags()).rejects.toEqual(
                new Error('Request failed with status code 503'),
            )
        })

        it('should reject when cancelled', async () => {
            mockedServer.onGet('/api/tags/').reply(200, {
                data: tagsFixtures,
                meta,
            })
            const source = CancelToken.source()
            source.cancel()

            await expect(
                fetchTags(
                    {
                        order_by: `${ListTagsOrderBy.CreatedDatetime}:${OrderDirection.Asc}`,
                    },
                    { cancelToken: source.token },
                ),
            ).rejects.toEqual(new Cancel())
        })

        it.each([OrderDirection.Asc, OrderDirection.Desc])(
            'should concat second sorting attribute when sorting by usage',
            async (direction) => {
                mockedServer.onGet('/api/tags/').reply(200, {
                    data: tagsFixtures,
                    meta,
                })
                await fetchTags({
                    order_by: `${ListTagsOrderBy.Usage}:${direction}`,
                })
                expect(mockedServer.history.get[0].params).toMatchSnapshot()
            },
        )
    })

    describe('fetchTag', () => {
        it('should resolve with a Tag on success', async () => {
            mockedServer.onGet(/\/api\/tags\/\d+\//).reply(200, tagsFixtures[0])
            const res = await fetchTag(1)
            expect(res).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onGet(/\/api\/tags\/\d+\//)
                .reply(503, { message: 'error' })
            return expect(fetchTag(1)).rejects.toEqual(
                new Error('Request failed with status code 503'),
            )
        })
    })

    describe('createTag', () => {
        const tagDraftMock = _pick(tagsFixtures[0], ['name'])

        it('should resolve with a new Tag on success', async () => {
            mockedServer.onPost('/api/tags/').reply(200, tagsFixtures[0])
            const res = await createTag(tagDraftMock)

            expect(res).toMatchSnapshot()
            expect(mockedServer.history).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer.onPost('/api/tags/').reply(503, { message: 'error' })
            return expect(createTag(tagDraftMock)).rejects.toEqual(
                new Error('Request failed with status code 503'),
            )
        })
    })

    describe('deleteTag', () => {
        it('should resolve on success', async () => {
            mockedServer.onDelete(/\/api\/tags\/\d+\//).reply(200)
            const res = await deleteTag(1)
            expect(res).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onDelete(/\/api\/tags\/\d+\//)
                .reply(503, { message: 'error' })
            return expect(deleteTag(1)).rejects.toEqual(
                new Error('Request failed with status code 503'),
            )
        })
    })

    describe('updateTag', () => {
        it('should resolve with the updated tag on success', async () => {
            mockedServer.onPut(/\/api\/tags\/\d+\//).reply(200, tagsFixtures[0])
            const res = await updateTag(tagsFixtures[0])
            expect(res).toMatchSnapshot()
            expect(mockedServer.history).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onPut(/\/api\/tags\/\d+\//)
                .reply(503, { message: 'error' })
            return expect(updateTag(tagsFixtures[0])).rejects.toEqual(
                new Error('Request failed with status code 503'),
            )
        })
    })
})
