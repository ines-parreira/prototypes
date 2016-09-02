import expect from 'expect'
import expectImmutable from 'expect-immutable'

import {Map} from 'immutable'
import moment from 'moment'

import reducer, {initialState} from '../reducers'
import * as types from '../../users/constants'

expect.extend(expectImmutable)

describe('reducers', () => {
    describe('currentUser', () => {
        // Fake response to simulate the `/api/users/:id` response
        const fakeResponse = {
            username: 'fake_username',
            language: 'es',
            timezone: 'America/Chicago',
        }

        // Fake another response to simulate the `/api/users/:id` response
        const fakeOtherResponse = {
            username: 'fake_other_username',
            language: 'fr',
            timezone: 'Australia/Sydney',
        }

        // Dispatch the `FETCH_CURRENT_USER_SUCCESS` action in the reducer with a fake response
        const dispatchFetchCurrentUserSuccess = (state = initialState, response) => (
            reducer(state, { type: types.FETCH_CURRENT_USER_SUCCESS, resp: response })
        )

        it('should return the initial state', () => {
            expect(reducer(undefined, {})).toEqualImmutable(initialState)
        })

        it('should return the current user as state', () => {
            expect(
                dispatchFetchCurrentUserSuccess(undefined, fakeResponse)
            ).toEqualImmutable(
                Map(fakeResponse)
            )

            expect(
                dispatchFetchCurrentUserSuccess(Map(fakeResponse), fakeOtherResponse)
            ).toEqualImmutable(
                Map(fakeOtherResponse)
            )
        })

        it('should set the current user language as default moment language', () => {
            dispatchFetchCurrentUserSuccess(undefined, fakeResponse)
            expect(moment().locale()).toBe(fakeResponse.language)

            dispatchFetchCurrentUserSuccess(Map(fakeResponse), fakeOtherResponse)
            expect(moment().locale()).toBe(fakeOtherResponse.language)
        })

        it('should set the current user timezone as default moment timezone', () => {
            dispatchFetchCurrentUserSuccess(undefined, fakeResponse)
            expect(moment().tz()).toBe(fakeResponse.timezone)

            dispatchFetchCurrentUserSuccess(Map(fakeResponse), fakeOtherResponse)
            expect(moment().tz()).toBe(fakeOtherResponse.timezone)
        })
    })
})
