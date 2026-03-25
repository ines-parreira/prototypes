import MockAdapter from 'axios-mock-adapter'
import _omit from 'lodash/omit'

import { view } from 'fixtures/views'
import client from 'models/api/resources'

import {
    createView,
    deleteView,
    fetchViewsPaginated,
    updateView,
} from '../resources'
import type { ViewDraft } from '../types'

const mockedServer = new MockAdapter(client)
const draftView: ViewDraft = {
    ..._omit(view, 'id'),
    category: null,
} as any

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn((flag, defaultValue) => defaultValue),
    getLDClient: jest.fn(() => ({
        variation: jest.fn((flag, defaultValue) => defaultValue),
        waitForInitialization: jest.fn(() => Promise.resolve()),
        on: jest.fn(),
        off: jest.fn(),
        allFlags: jest.fn(() => ({})),
    })),
}))
const variationMock = require('@repo/feature-flags').getLDClient()
    .variation as jest.Mock

describe('view resources', () => {
    beforeEach(() => {
        mockedServer.reset()
        variationMock.mockImplementation(() => false)
    })

    describe('fetchViewsPaginated', () => {
        it('should resolve with a View list on success', async () => {
            mockedServer.onGet(/\/api\/views\/.*/).reply(200, {
                data: [view, view, view],
            })

            const res = await fetchViewsPaginated()
            expect(res).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onGet(/\/api\/views\/.*/)
                .reply(503, { message: 'error' })
            return expect(fetchViewsPaginated()).rejects.toEqual(
                new Error('Request failed with status code 503'),
            )
        })
    })

    describe('createView', () => {
        it('should resolve with a new View on success', async () => {
            mockedServer.onPost('/api/views/').reply(200, view)

            const res = await createView(draftView)
            expect(res).toEqual(view)

            const postBody = JSON.parse(mockedServer.history.post[0].data)
            expect(postBody).not.toHaveProperty('search')
            expect(postBody).not.toHaveProperty('created_datetime')
            expect(postBody).toHaveProperty('category')
            expect(postBody).not.toHaveProperty('deactivated_datetime')
        })

        it('should reject an error on fail', () => {
            mockedServer.onPost('/api/views/').reply(503, { message: 'error' })
            return expect(createView(draftView)).rejects.toEqual(
                new Error('Request failed with status code 503'),
            )
        })
    })

    describe('updateView', () => {
        it('should resolve with an updated View on success', async () => {
            mockedServer.onPut(/\/api\/views\/\d+\//).reply(200, {
                ...view,
                name: 'foo',
                shared_with_teams: [],
                shared_with_users: [],
            })

            const res = await updateView(view.id, {
                ...draftView,
                id: view.id,
                name: 'foo',
                shared_with_teams: [{ id: 1, decoration: {}, name: 'foo' }],
                shared_with_users: [{ id: 1, meta: {}, name: 'bar' }],
            })
            expect(res).toMatchSnapshot()
            expect(mockedServer.history).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onPut(/\/api\/views\/\d+\//)
                .reply(503, { message: 'error' })
            return expect(
                updateView(view.id, {
                    ...draftView,
                    id: view.id,
                    shared_with_teams: [{ id: 1, decoration: {}, name: 'foo' }],
                    shared_with_users: [{ id: 1, meta: {}, name: 'bar' }],
                }),
            ).rejects.toEqual(new Error('Request failed with status code 503'))
        })
    })

    describe('deleteView', () => {
        it('should resolve on success', async () => {
            mockedServer.onDelete(/\/api\/views\/\d+\//).reply(200)

            const res = await deleteView(1)
            expect(res).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onDelete(/\/api\/views\/\d+\//)
                .reply(503, { message: 'error' })
            return expect(deleteView(1)).rejects.toEqual(
                new Error('Request failed with status code 503'),
            )
        })
    })
})
