import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS} from 'immutable'

import reducer, {initialState} from '../reducers'
import * as agentsTypes from '../../agents/constants'
import * as viewTypes from '../../views/constants'
import * as ticketTypes from '../../ticket/constants'
import * as types from '../constants'

jest.addMatchers(immutableMatchers)

describe('users reducers', () => {
    it('initial state', () => {
        expect(reducer(undefined, {})).toEqualImmutable(initialState)
    })

    it('fetch list', () => {
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

        expect(
            reducer(
                initialState, {
                    type: viewTypes.FETCH_LIST_VIEW_SUCCESS,
                    viewType: 'customer-list',
                    data: resp
                }
            )
        ).toMatchSnapshot()

        // wrong view type
        expect(
            reducer(
                initialState, {
                    type: viewTypes.FETCH_LIST_VIEW_SUCCESS,
                    viewType: 'unknown-list',
                    data: resp
                }
            )
        ).toMatchSnapshot()
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

    it('fetch user', () => {
        // start
        expect(
            reducer(
                initialState,
                {
                    type: types.FETCH_USER_START,
                }
            ).toJS()
        ).toMatchSnapshot()

        // success
        expect(
            reducer(
                initialState,
                {
                    type: types.FETCH_USER_SUCCESS,
                    resp: {id: 1},
                }
            ).toJS()
        ).toMatchSnapshot()

        // error
        expect(
            reducer(
                initialState,
                {
                    type: types.FETCH_USER_ERROR,
                }
            ).toJS()
        ).toMatchSnapshot()
    })

    it('submit user', () => {
        // start
        expect(
            reducer(
                initialState,
                {
                    type: types.SUBMIT_USER_START,
                }
            ).toJS()
        ).toMatchSnapshot()

        // success
        // update user
        expect(
            reducer(
                initialState
                    .mergeDeep({
                        items: [{id: 1, name: 'Romain'}],
                        active: {id: 1, name: 'Romain'},
                    }),
                {
                    type: types.SUBMIT_USER_SUCCESS,
                    resp: {
                        id: 1,
                        name: 'Alex',
                    },
                    isUpdate: true,
                }
            ).toJS()
        ).toMatchSnapshot()

        // create user
        expect(
            reducer(
                initialState
                    .mergeDeep({
                        items: [{id: 1, name: 'Romain'}],
                        active: {id: 1, name: 'Romain'},
                    }),
                {
                    type: types.SUBMIT_USER_SUCCESS,
                    resp: {
                        name: 'Alex',
                    },
                    isUpdate: false,
                }
            ).toJS()
        ).toMatchSnapshot()

        // update agent
        expect(
            reducer(
                initialState
                    .mergeDeep({
                        agents: [{id: 1, name: 'Romain'}],
                        items: [{id: 1, name: 'Romain'}],
                        active: {id: 1, name: 'Romain'},
                    }),
                {
                    type: types.SUBMIT_USER_SUCCESS,
                    resp: {
                        id: 1,
                        name: 'Alex',
                        roles: [{name: 'agent'}],
                    },
                    isUpdate: true,
                }
            ).toJS()
        ).toMatchSnapshot()

        // create agent
        expect(
            reducer(
                initialState
                    .mergeDeep({
                        agents: [],
                        items: [{id: 1, name: 'Romain'}],
                        active: {id: 1, name: 'Romain'},
                    }),
                {
                    type: types.SUBMIT_USER_SUCCESS,
                    resp: {
                        name: 'Alex',
                        roles: [{name: 'agent'}],
                    },
                    isUpdate: false,
                }
            ).toJS()
        ).toMatchSnapshot()

        // remove agent (downgrade agent to user)
        expect(
            reducer(
                initialState
                    .mergeDeep({
                        agents: [{id: 1, name: 'Romain'}],
                        items: [{id: 1, name: 'Romain'}],
                        active: {id: 1, name: 'Romain'},
                    }),
                {
                    type: types.SUBMIT_USER_SUCCESS,
                    resp: {
                        id: 1,
                        name: 'Alex',
                    },
                    isUpdate: true,
                }
            ).toJS()
        ).toMatchSnapshot()

        // error
        expect(
            reducer(
                initialState,
                {
                    type: types.SUBMIT_USER_ERROR,
                }
            ).toJS()
        ).toMatchSnapshot()
    })

    it('delete user', () => {
        expect(
            reducer(
                initialState
                    .mergeDeep({
                        agents: [{id: 1}, {id: 2}],
                        items: [{id: 1}, {id: 2}],
                    }),
                {
                    type: types.DELETE_USER_SUCCESS,
                    userId: 2,
                }
            )
        ).toMatchSnapshot()
    })

    it('fetch user history', () => {
        // start
        expect(
            reducer(
                initialState,
                {
                    type: types.FETCH_USER_HISTORY_START,
                }
            ).toJS()
        ).toMatchSnapshot()

        // success
        expect(
            reducer(
                initialState,
                {
                    type: types.FETCH_USER_HISTORY_SUCCESS,
                    resp: {
                        meta: {
                            item_count: 2,
                        },
                        data: [{id: 1}, {id: 2}],
                    },
                }
            ).toJS()
        ).toMatchSnapshot()

        // success but no history
        expect(
            reducer(
                initialState,
                {
                    type: types.FETCH_USER_HISTORY_SUCCESS,
                    resp: {
                        meta: {
                            item_count: 1,
                        },
                        data: [{id: 1}],
                    },
                }
            ).toJS()
        ).toMatchSnapshot()

        // error
        expect(
            reducer(
                initialState,
                {
                    type: types.FETCH_USER_HISTORY_ERROR,
                }
            ).toJS()
        ).toMatchSnapshot()
    })

    it('clear ticket', () => {
        expect(
            reducer(
                initialState,
                {
                    type: ticketTypes.CLEAR_TICKET,
                }
            ).toJS()
        ).toMatchSnapshot()
    })

    it('clear user', () => {
        expect(
            reducer(
                initialState
                    .mergeDeep({
                        active: {id: 1, name: 'Romain'},
                    }),
                {
                    type: types.CLEAR_USER,
                }
            ).toJS()
        ).toMatchSnapshot()
    })

    it('bulk delete', () => {
        // success
        expect(
            reducer(
                initialState
                    .mergeDeep({
                        items: [
                            {
                                id: 1,
                                name: 'Alex',
                            },
                            {
                                id: 2,
                                name: 'Romain',
                            },
                            {
                                id: 3,
                                name: 'Julien',
                            }
                        ],
                    }),
                {
                    type: viewTypes.BULK_DELETE_SUCCESS,
                    viewType: 'customer-list',
                    ids: [1, 2]
                }
            )
        ).toMatchSnapshot()
    })

    it('merge users', () => {
        // start
        expect(
            reducer(
                initialState,
                {
                    type: types.MERGE_USERS_START,
                }
            ).toJS()
        ).toMatchSnapshot()

        // success
        expect(
            reducer(
                initialState
                    .mergeDeep({
                        active: {id: 1, name: 'Romain'},
                    }),
                {
                    type: types.MERGE_USERS_SUCCESS,
                    resp: {id: 1, name: 'Alex'},
                }
            ).toJS()
        ).toMatchSnapshot()

        // error
        expect(
            reducer(
                initialState
                    .mergeDeep({
                        active: {id: 1, name: 'Romain'},
                    }),
                {
                    type: types.MERGE_USERS_ERROR,
                }
            ).toJS()
        ).toMatchSnapshot()
    })

    it('set agents location', () => {
        expect(
            reducer(
                initialState,
                {
                    type: types.SET_AGENTS_LOCATION,
                    data: [
                        {users: ['1', '2'], ticket: '1'},
                        {users: ['1'], ticket: '2'},
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
                    type: types.SET_AGENTS_TYPING_STATUS,
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
                    type: agentsTypes.CREATE_AGENT_SUCCESS,
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
                    type: agentsTypes.UPDATE_AGENT_SUCCESS,
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
                    type: agentsTypes.UPDATE_AGENT_SUCCESS,
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
                    type: agentsTypes.DELETE_AGENT_SUCCESS,
                    id: 2,
                }
            ).toJS()
        ).toMatchSnapshot()
    })
})
