import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import expect from 'expect'
import * as actions from '../actions'
import * as types from '../constants'
import {tagsInitial as initialState} from '../reducers'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

const mockServer = new MockAdapter(axios)

describe('actions', () => {
    describe('tag', () => {
        it('should dispatch add tags action', () => {
            const store = mockStore(initialState);
            store.dispatch(actions.addTags(['refund', 'rejected']));
            const expectedActions = store.getActions();

            expect(expectedActions).toEqual([{
                type: types.ADD_TAGS,
                tags: ['refund', 'rejected']
            }]);
        });

        it('creates FETCH_TAG_LIST_SUCCESS when fetching tags has been done', () => {
            mockServer
                .onGet('/api/tags/')
                .reply(200, {
                    data: ['refund', 'rejected']
                })

            const expectedActions = [
                {
                    type: types.FETCH_TAG_LIST_START
                },
                {
                    type: types.FETCH_TAG_LIST_SUCCESS,
                    resp: {
                        data: ['refund', 'rejected']
                    }
                }
            ]

            const store = mockStore(initialState)

            return store
                .dispatch(actions.fetchTags())
                .then(() => {
                    expect(store.getActions()).toEqual(expectedActions)
                })
        })
    })
})
