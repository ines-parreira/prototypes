import * as immutableMatchers from 'jest-immutable-matchers'

import reducer, {initialState} from '../reducers'
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
})
