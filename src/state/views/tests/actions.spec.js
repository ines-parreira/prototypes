import moment from 'moment'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'

import * as actions from '../actions'
import {initialState} from '../../views/reducers'
import {ACTIVE_VIEW_COUNT_TIMEOUT, RECENT_VIEWS_COUNTS_TIMEOUT} from '../../../config/views'
import socketManager from '../../../services/socketManager'
import * as socketConstants from '../../../config/socketConstants'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

const windowLocation = JSON.stringify(window.location)
delete window.location
window.location = JSON.parse(windowLocation)

describe('actions', () => {
    let store

    describe('fetchActiveViewTickets', () => {
        it('should not fetch (no active view)', () => {
            store = mockStore({views: initialState})
            expect(store.dispatch(actions.fetchActiveViewTickets())).toBe(undefined)
            expect(store.getActions()).toEqual([])
        })

        it('should not fetch (not on a view)', () => {
            window.location.pathname = '/app/ticket/12/'
            store = mockStore({views: initialState})

            expect(store.dispatch(actions.fetchActiveViewTickets())).toBe(undefined)
            expect(store.getActions()).toEqual([])
        })

        it('should not fetch tickets (editing view)', () => {
            window.location.pathname = '/app/tickets/12/'
            const state = initialState.set('active', fromJS({
                id: 1,
                editMode: true
            }))
            store = mockStore({views: state})

            expect(store.dispatch(actions.fetchActiveViewTickets())).toBe(undefined)
            expect(store.getActions()).toEqual([])
        })

        it('should not fetch tickets (already fetching tickets)', () => {
            window.location.pathname = '/app/tickets/12/'
            const state = initialState.mergeDeep(fromJS({
                active: {id: 1},
                _internal: {
                    loading:{
                        fetchList: true
                    }
                }
            }))
            store = mockStore({views: state})

            expect(store.dispatch(actions.fetchActiveViewTickets())).toBe(undefined)
            expect(store.getActions()).toEqual([])
        })

        it('should not fetch tickets (already fetching tickets)', () => {
            window.location.pathname = '/app/tickets/12/'
            const state = initialState.mergeDeep(fromJS({
                active: {id: 1},
                _internal: {
                    loading:{
                        fetchListDiscreet: true
                    }
                }
            }))
            store = mockStore({views: state})

            expect(store.dispatch(actions.fetchActiveViewTickets())).toBe(undefined)
            expect(store.getActions()).toEqual([])
        })

        it('should fetch tickets', () => {
            const state = initialState.set('active', fromJS({id: 1}))
            window.location.pathname = '/app/tickets/12/'

            store = mockStore({views: state})
            expect(store.dispatch(actions.fetchActiveViewTickets())).not.toEqual(undefined)
        })
    })

    describe('fetchRecentViewsCounts', () => {
        const _send = socketManager.send
        let sendSpy = null
        beforeEach(() => {
            sendSpy = jest.fn()
            socketManager.send = sendSpy
        })

        afterAll(() => {
            socketManager.send =_send
        })

        it('should not fetch views counts (not on a ticket and not on a view)', () => {
            window.location.pathname = '/app/rules/'
            store = mockStore({views: initialState})
            expect(store.dispatch(actions.fetchRecentViewsCounts())).toBe(undefined)
            expect(sendSpy.mock.calls.length).toEqual(0)

        })

        it('should not fetch views counts (counts not expired)', () => {
            window.location.pathname = '/app/tickets/1/'
            const state = initialState.mergeDeep(fromJS({
                active: {id: 1},
                recent: {
                    2: {'updated_datetime': moment.utc().toISOString()}
                }
            }))
            store = mockStore({views: state})

            expect(store.dispatch(actions.fetchRecentViewsCounts())).toBe(undefined)
            expect(sendSpy.mock.calls.length).toEqual(0)
        })

        it('should not fetch views counts (active view count expired)', () => {
            window.location.pathname = '/app/tickets/1/'

            const expireAt = moment.utc().subtract(RECENT_VIEWS_COUNTS_TIMEOUT + 1, 's').toISOString()
            const state = initialState.mergeDeep(fromJS({
                active: {id: 1},
                recent: {
                    1: {'updated_datetime': expireAt}
                }
            }))

            store = mockStore({views: state})

            store.dispatch(actions.fetchRecentViewsCounts())
            expect(sendSpy.mock.calls.length).toEqual(0)

        })

        it('should fetch views counts (active view count expired)', () => {
            window.location.pathname = '/app/tickets/1/'

            const expiredDt = moment.utc().subtract(RECENT_VIEWS_COUNTS_TIMEOUT + 1, 's').toISOString()
            const state = initialState.mergeDeep(fromJS({
                active: {id: 1},
                recent: {
                    2: {'updated_datetime': expiredDt},
                    3: {'updated_datetime': expiredDt},
                    4: {'updated_datetime': moment.utc().toISOString()}
                }
            }))

            store = mockStore({views: state})
            store.dispatch(actions.fetchRecentViewsCounts())
            expect(sendSpy.mock.calls.length).toEqual(1)
            expect(sendSpy.mock.calls[0]).toEqual([socketConstants.VIEWS_COUNTS_EXPIRED, {viewIds: [2, 3]}])
        })
    })
    describe('fetchActiveViewCount', () => {
        const _send = socketManager.send
        let sendSpy = null

        beforeEach(() => {
            sendSpy = jest.fn()
            socketManager.send = sendSpy
        })

        afterAll(() => {
            socketManager.send =_send
        })

        it('should not fetch views counts (not on a ticket)', () => {
            window.location.pathname = '/app/tickets/'
            store = mockStore({views: initialState})
            expect(store.dispatch(actions.fetchActiveViewCount())).toBe(undefined)
            expect(sendSpy.mock.calls.length).toEqual(0)

        })

        it('should not fetch views counts (counts not expired)', () => {
            window.location.pathname = '/app/ticket/1/'
            const state = initialState.mergeDeep(fromJS({
                active: {id: 1},
                recent: {
                    1: {'updated_datetime': moment.utc().toISOString()}
                }
            }))
            store = mockStore({views: state})

            expect(store.dispatch(actions.fetchActiveViewCount())).toBe(undefined)
            expect(sendSpy.mock.calls.length).toEqual(0)
        })

        it('should fetch views counts', () => {
            window.location.pathname = '/app/ticket/1/'

            const expiredDt = moment.utc().subtract(ACTIVE_VIEW_COUNT_TIMEOUT + 1, 's').toISOString()
            const state = initialState.mergeDeep(fromJS({
                active: {id: 1},
                recent: {
                    1: {'updated_datetime': expiredDt},
                }
            }))

            store = mockStore({views: state})
            store.dispatch(actions.fetchActiveViewCount())
            expect(sendSpy.mock.calls.length).toEqual(1)
            expect(sendSpy.mock.calls[0]).toEqual([socketConstants.VIEWS_COUNTS_EXPIRED, {viewIds: [1]}])
        })
    })

    it('should update updated datetime of recent views', () => {
        const state = initialState.mergeDeep(fromJS({
            active: {id: 1},
            recent: {
                1: {},
            }
        }))
        store = mockStore({views: state})
        expect(store.dispatch(actions.updateRecentViews([1]))).toMatchSnapshot()
        expect(store.getActions()).toMatchSnapshot()
    })
})
