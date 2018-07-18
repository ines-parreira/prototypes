import * as immutableMatchers from 'jest-immutable-matchers'

import reducer, {initialState} from '../reducers'
import * as types from '../constants'
import {fromJS} from 'immutable'

jest.addMatchers(immutableMatchers)

describe('agents reducers', () => {
    it('initial state', () => {
        expect(reducer(undefined, {})).toEqualImmutable(initialState)
    })

    it('fetch users (agents)', () => {
        const resp = {
            data: [{id: 1}, {id: 2}],
        }

        // do nothing
        expect(
            reducer(
                initialState, {
                    type: types.FETCH_USER_LIST_SUCCESS,
                    roles: [],
                    resp,
                }
            )
        ).toMatchSnapshot()

        // do nothing
        expect(
            reducer(
                initialState, {
                    type: types.FETCH_USER_LIST_SUCCESS,
                    roles: ['agent'],
                    resp,
                }
            )
        ).toMatchSnapshot()

        expect(
            reducer(
                initialState, {
                    type: types.FETCH_USER_LIST_SUCCESS,
                    roles: ['agent', 'admin'],
                    resp,
                }
            )
        ).toMatchSnapshot()
    })

    it('fetch agents pagination', () => {
        const resp = {
            data: [{
                name: 'Alex',
            }, {
                name: 'Romain',
            }],
            meta: {
                nb_pages: 2,
                page: 1,
            }
        }

        // success
        expect(
            reducer(
                initialState, {
                    type: types.FETCH_AGENTS_PAGINATION_SUCCESS,
                    resp,
                }
            )
        ).toMatchSnapshot()
    })

    it('set agents location', () => {
        expect(
            reducer(
                initialState,
                {
                    type: types.SET_AGENTS_LOCATIONS,
                    data: [
                        {customers: ['1', '2'], ticket: '1'},
                        {customers: ['1'], ticket: '2'},
                    ]
                }
            ).toJS()
        ).toMatchSnapshot()
    })

    it('set agents typing status', () => {
        expect(
            reducer(
                initialState,
                {
                    type: types.SET_AGENTS_TYPING_STATUSES,
                    data: [
                        {users: ['1', '2'], ticket: '1'},
                        {users: ['1'], ticket: '2'},
                    ]
                }
            ).toJS()
        ).toMatchSnapshot()
    })

    it('create agent', () => {
        // success
        expect(
            reducer(
                initialState,
                {
                    type: types.CREATE_AGENT_SUCCESS,
                    resp: fromJS({id: 1, name: 'Romain'}),
                }
            ).toJS()
        ).toMatchSnapshot()
    })

    it('update agent', () => {
        // success
        expect(
            reducer(
                initialState
                    .mergeDeep({
                        agents: [{id: 1, name: 'Romain'}, {id: 2, name: 'John'}],
                    }),
                {
                    type: types.UPDATE_AGENT_SUCCESS,
                    resp: fromJS({id: 1, name: 'Alex'}),
                }
            ).toJS()
        ).toMatchSnapshot()

        // success but no effect because non existent agent in list
        expect(
            reducer(
                initialState
                    .mergeDeep({
                        agents: [{id: 1, name: 'Romain'}, {id: 2, name: 'John'}],
                    }),
                {
                    type: types.UPDATE_AGENT_SUCCESS,
                    resp: fromJS({id: 10, name: 'Julien'}),
                }
            ).toJS()
        ).toMatchSnapshot()
    })

    it('delete agent', () => {
        // success
        expect(
            reducer(
                initialState
                    .mergeDeep({
                        agents: [{id: 1, name: 'Romain'}, {id: 2, name: 'John'}],
                    }),
                {
                    type: types.DELETE_AGENT_SUCCESS,
                    id: 2,
                }
            ).toJS()
        ).toMatchSnapshot()
    })

})
