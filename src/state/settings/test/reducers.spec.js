import expect from 'expect'
import expectImmutable from 'expect-immutable'

import {Map} from 'immutable'

import reducer, {initialState} from '../reducers'
import * as types from '../constants'

expect.extend(expectImmutable)

describe('reducers', () => {
    describe('settings', () => {
        // Simulates the `/api/settings/` response
        const fakeResponse = {
            fake_property: 'fake_value',
            fake_property2: 'fake_value2',
        }

        // Simulates a second response for `/api/settings/` end point
        const fakeOtherResponse = {
            other_fake_property: 'other_fake_value',
            other_fake_property2: 'other_fake_value2',
        }

        it('should return the initial state', () => {
            expect(
                reducer(undefined, {})
            ).toEqualImmutable(
                initialState
            )
        })

        it('should start the settings fetching', () => {
            const startFetchSettings = (state) => (
                reducer(state, {
                    type: types.FETCH_SETTINGS_START,
                })
            )

            expect(
                startFetchSettings(initialState)
            ).toEqualImmutable(
                initialState
                    .set('loading', true)
            )

            expect(
                startFetchSettings(
                    Map({
                        data: Map(fakeResponse),
                        loading: false,
                        loaded: true,
                    })
                )
            ).toEqualImmutable(
                Map({
                    data: Map(fakeResponse),
                    loading: true,
                    loaded: true,
                })
            )
        })

        it('should fetch the settings from server', () => {
            const fetchSettingsWithSuccess = (state, response) => (
                reducer(state, {
                    type: types.FETCH_SETTINGS_SUCCESS,
                    resp: response
                })
            )

            // Test with no loaded settings
            expect(
                fetchSettingsWithSuccess(
                    Map({
                        data: Map(),
                        loading: true,
                        loaded: false,
                    }),
                    fakeResponse,
                )
            ).toEqualImmutable(
                Map({
                    data: Map(fakeResponse),
                    loading: false,
                    loaded: true,
                })
            )

            // Test with settings already fetched
            expect(
                fetchSettingsWithSuccess(
                    Map({
                        data: Map(fakeResponse),
                        loading: true,
                        loaded: true,
                    }),
                    fakeOtherResponse,
                )
            ).toEqualImmutable(
                Map({
                    data: Map(fakeOtherResponse),
                    loading: false,
                    loaded: true,
                })
            )
        })
    })
})
