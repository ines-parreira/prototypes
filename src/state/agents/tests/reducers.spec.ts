import * as immutableMatchers from 'jest-immutable-matchers'

import {fromJS} from 'immutable'

import reducer, {initialState} from '../reducers'
import * as constants from '../constants'
import * as currentUserConstants from '../../currentUser/constants.js'
import {StoreAction} from '../../types'
import {UserRole} from '../../../config/types/user'

jest.addMatchers(immutableMatchers)

describe('agents reducers', () => {
    it('initial state', () => {
        expect(reducer(undefined, {} as StoreAction)).toEqualImmutable(
            initialState
        )
    })

    it('fetch users (agents)', () => {
        const resp = {
            data: [{id: 1}, {id: 2}],
        }

        // do nothing
        expect(
            reducer(initialState, {
                type: constants.FETCH_USER_LIST_SUCCESS,
                roles: [],
                resp,
            })
        ).toMatchSnapshot()

        // do nothing
        expect(
            reducer(initialState, {
                type: constants.FETCH_USER_LIST_SUCCESS,
                roles: [UserRole.Agent],
                resp,
            })
        ).toMatchSnapshot()

        expect(
            reducer(initialState, {
                type: constants.FETCH_USER_LIST_SUCCESS,
                roles: Object.values(UserRole),
                resp,
            })
        ).toMatchSnapshot()
    })

    it('fetch agents pagination', () => {
        const resp = {
            data: [
                {
                    name: 'Alex',
                },
                {
                    name: 'Romain',
                },
            ],
            meta: {
                nb_pages: 2,
                page: 1,
            },
        }

        // success
        expect(
            reducer(initialState, {
                type: constants.FETCH_AGENTS_PAGINATION_SUCCESS,
                resp,
            })
        ).toMatchSnapshot()
    })

    it('set agents location', () => {
        expect(
            reducer(initialState, {
                type: constants.SET_AGENTS_LOCATIONS,
                data: [
                    {customers: ['1', '2'], ticket: '1'},
                    {customers: ['1'], ticket: '2'},
                ],
            }).toJS()
        ).toMatchSnapshot()
    })

    it('set agents typing status', () => {
        expect(
            reducer(initialState, {
                type: constants.SET_AGENTS_TYPING_STATUSES,
                data: [
                    {users: ['1', '2'], ticket: '1'},
                    {users: ['1'], ticket: '2'},
                ],
            }).toJS()
        ).toMatchSnapshot()
    })

    it('create agent', () => {
        // success
        expect(
            reducer(initialState, {
                type: constants.CREATE_AGENT_SUCCESS,
                resp: fromJS({id: 1, name: 'Romain'}),
            }).toJS()
        ).toMatchSnapshot()
    })

    it('update agent', () => {
        // success
        expect(
            reducer(
                initialState.mergeDeep({
                    all: [
                        {id: 1, name: 'Romain'},
                        {id: 2, name: 'John'},
                    ],
                }),
                {
                    type: constants.UPDATE_AGENT_SUCCESS,
                    resp: fromJS({id: 1, name: 'Alex'}),
                }
            ).toJS()
        ).toMatchSnapshot()

        // success but no effect because non existent agent in list
        expect(
            reducer(
                initialState.mergeDeep({
                    all: [
                        {id: 1, name: 'Romain'},
                        {id: 2, name: 'John'},
                    ],
                }),
                {
                    type: constants.UPDATE_AGENT_SUCCESS,
                    resp: fromJS({id: 10, name: 'Julien'}),
                }
            ).toJS()
        ).toMatchSnapshot()
    })

    it('delete agent', () => {
        // success
        expect(
            reducer(
                initialState.mergeDeep({
                    agents: [
                        {id: 1, name: 'Romain'},
                        {id: 2, name: 'John'},
                    ],
                }),
                {
                    type: constants.DELETE_AGENT_SUCCESS,
                    id: 2,
                }
            ).toJS()
        ).toMatchSnapshot()
    })

    it('should update the matching row in the list of agents when the current user is updated', () => {
        // success
        expect(
            reducer(
                initialState.mergeDeep({
                    all: [
                        {id: 1, name: 'Romain'},
                        {id: 2, name: 'John'},
                    ],
                }),
                {
                    type: currentUserConstants.SUBMIT_CURRENT_USER_SUCCESS,
                    resp: {id: 1, name: 'Alex'},
                }
            ).toJS()
        ).toMatchSnapshot()

        // success but no effect because non existent agent in list
        expect(
            reducer(
                initialState.mergeDeep({
                    all: [
                        {id: 1, name: 'Romain'},
                        {id: 2, name: 'John'},
                    ],
                }),
                {
                    type: currentUserConstants.SUBMIT_CURRENT_USER_SUCCESS,
                    resp: {id: 10, name: 'Julien'},
                }
            ).toJS()
        ).toMatchSnapshot()
    })
})
