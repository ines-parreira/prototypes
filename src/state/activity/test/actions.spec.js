// Commented because activity actions use `Audio` object which is not supported in node env
// We have to run our tests in a browser env or mock Audio object
//
// import expect from 'expect'
// import axios from 'axios'
// import MockAdapter from 'axios-mock-adapter'
// import configureMockStore from 'redux-mock-store'
// import expectImmutable from 'expect-immutable'
// import thunk from 'redux-thunk'
// import _some from 'lodash/some'
// import * as currentAccountTypes from '../../currentAccount/constants'
// import * as billingTypes from '../../billing/constants'
// import * as viewsTypes from '../../views/constants'
// import * as types from '../constants'
// import {pollActivity} from '../actions'
// import {initialState} from '../reducers'
// import {initialState as viewInitialState} from '../../views/reducers'
// import {initialState as ticketInitialState} from '../../ticket/reducers'
// import activity from '../../../fixtures/activity'
//
// expect.extend(expectImmutable)
//
// const middlewares = [thunk]
// const mockStore = configureMockStore(middlewares)
//
// describe('actions', () => {
//     describe('activity', () => {
//         let store
//         let mockServer
//
//         beforeEach(() => {
//             store = mockStore({
//                 activity: initialState,
//                 views: viewInitialState,
//                 ticket: ticketInitialState,
//             })
//             mockServer = new MockAdapter(axios)
//         })
//
//         // we check that there is no errors reported even activity is empty
//         it('should poll activity (empty)', () => {
//             const expectedActions = [{
//                 type: types.SUBMIT_ACTIVITY_START
//             }, {
//                 type: types.SUBMIT_ACTIVITY_SUCCESS,
//                 resp: {}
//             }]
//             mockServer.onPost('/api/activity/').reply(201, {})
//
//             store.dispatch(pollActivity()).then(() => {
//                 expect(store.getActions()).toEqual(expectedActions)
//             })
//         })
//
//         it('should poll activity', () => {
//             mockServer.onPost('/api/activity/').reply(201, activity)
//
//             store.dispatch(pollActivity()).then(() => {
//                 expect(_some(store.getActions(), {
//                     type: types.SUBMIT_ACTIVITY_START
//                 })).toEqual(true)
//
//                 expect(_some(store.getActions(), {
//                     type: types.SUBMIT_ACTIVITY_SUCCESS,
//                     resp: activity
//                 })).toEqual(true)
//
//                 expect(_some(store.getActions(), {
//                     type: viewsTypes.UPDATE_VIEW_LIST,
//                     items: activity.views
//                 })).toEqual(true)
//
//                 expect(_some(store.getActions(), {
//                     type: currentAccountTypes.UPDATE_CURRENT_ACCOUNT,
//                     resp: activity.current_account
//                 })).toEqual(true)
//
//                 expect(_some(store.getActions(), {
//                     type: billingTypes.FETCH_CURRENT_USAGE_SUCCESS,
//                     resp: activity.current_usage
//                 })).toEqual(true)
//
//                 // expect a notification: new version available
//                 expect(_some(store.getActions(), {
//                     type: 'RNS_SHOW_NOTIFICATION',
//                     style: 'banner',
//                     level: 'info',
//                     message: `An update is available for Gorgias. Click here to reload the page and get the latest improvements.`
//                 })).toEqual(true)
//             })
//         })
//     })
// })
