import MockAdapter from 'axios-mock-adapter'
import _omit from 'lodash/omit'

import {view} from '../../../fixtures/views'
import client from '../../api/index.js'
import {fetchViews, createView, updateView, deleteView} from '../resources'
import {ViewDraft} from '../types'

const mockedServer = new MockAdapter(client)
const draftView: ViewDraft = {
    ..._omit(view, 'id'),
    category: null,
} as any

describe('view resources', () => {
    beforeEach(() => {
        mockedServer.reset()
    })

    describe('fetchViews', () => {
        it('should resolve with a View list on success', async () => {
            mockedServer.onGet('/api/views/').reply(200, {
                data: [view, view, view],
            })

            const res = await fetchViews()
            expect(res).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer.onGet('/api/views/').reply(503, {message: 'error'})
            return expect(fetchViews()).rejects.toEqual(
                new Error('Request failed with status code 503')
            )
        })
    })

    describe('createView', () => {
        it('should resolve with a new View on success', async () => {
            mockedServer.onPost('/api/views/').reply(200, view)

            const res = await createView(draftView)
            expect(res).toMatchSnapshot()
            expect(mockedServer.history).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer.onPost('/api/views/').reply(503, {message: 'error'})
            return expect(createView(draftView)).rejects.toEqual(
                new Error('Request failed with status code 503')
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

            const res = await updateView({
                ...draftView,
                id: view.id,
                name: 'foo',
                shared_with_teams: [{id: 1, meta: {}, name: 'foo'}],
                shared_with_users: [{id: 1, meta: {}, name: 'bar'}],
            })
            expect(res).toMatchSnapshot()
            expect(mockedServer.history).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onPut(/\/api\/views\/\d+\//)
                .reply(503, {message: 'error'})
            return expect(
                updateView({
                    ...draftView,
                    id: view.id,
                    shared_with_teams: [{id: 1, meta: {}, name: 'foo'}],
                    shared_with_users: [{id: 1, meta: {}, name: 'bar'}],
                })
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
                .reply(503, {message: 'error'})
            return expect(deleteView(1)).rejects.toEqual(
                new Error('Request failed with status code 503')
            )
        })
    })
})
