import expect from 'expect'
import expectImmutable from 'expect-immutable'
import jsdom from 'mocha-jsdom'

import { Map } from 'immutable'
import moment from 'moment'

import { currentUser } from '../currentUser'
import * as actions from '../../actions/user'

expect.extend(expectImmutable)

describe('reducers', () => {
    describe('currentUser', () => {
        jsdom()

        // Fake response to simulate the `/api/users/:id` response
        const fakeResponse = {
            username: 'fake_username',
            language: 'es',
            timezone: 'America/Chicago',
        }

        // Dispatch the `FETCH_CURRENT_USER_SUCCESS` action in the reducer with a fake response
        const dispatchFetchCurrentUserSuccess = (response) => (
            currentUser([], {type: actions.FETCH_CURRENT_USER_SUCCESS, resp: response})
        )

        it('should return the initial state', () => {
            expect(currentUser(undefined, {})).toEqualImmutable(Map())
        })

        it('should return the current user as state', () => {
            expect(dispatchFetchCurrentUserSuccess(fakeResponse)).toEqualImmutable(Map(fakeResponse))
        })

        it('should set the current user language as default moment language', () => {
            dispatchFetchCurrentUserSuccess(fakeResponse)
            expect(moment().locale()).toBe(fakeResponse.language)
        })

        it('should set the current user timezone as default moment timezone', () => {
            dispatchFetchCurrentUserSuccess(fakeResponse)
            expect(moment().tz()).toBe(fakeResponse.timezone)
        })
    })
})
