import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS} from 'immutable'

import {RootState} from '../../types'
import * as selectors from '../selectors'
import {initialState} from '../reducers'

jest.addMatchers(immutableMatchers)

describe('facebookAds selectors', () => {
    let state: RootState

    beforeEach(() => {
        state = {
            facebookAds: initialState.mergeDeep({
                loading: true,
                internals: {
                    1: {
                        ads: {
                            postid1: {
                                name: 'ad 1',
                                is_active: true,
                            },
                        },
                    },
                },
                loadingAds: ['postid1'],
            }),
        } as RootState
    })

    describe('getFacebookIntegrationInternals', () => {
        it('should return internals when its value is set', () => {
            const result = selectors.getFacebookIntegrationInternals(state)
            const expected = state.facebookAds.get('internals')

            expect(result).toEqualImmutable(expected)
        })

        it('should return default internals when its value is null', () => {
            state = {
                facebookAds: initialState.mergeDeep({internals: null}),
            } as RootState

            const result = selectors.getFacebookIntegrationInternals(state)
            const expected = fromJS({})

            expect(result).toEqualImmutable(expected)
        })

        it('should return default internals when its value is `{}`', () => {
            state = {
                facebookAds: initialState.mergeDeep({internals: {}}),
            } as RootState

            const result = selectors.getFacebookIntegrationInternals(state)
            const expected = fromJS({})

            expect(result).toEqualImmutable(expected)
        })
    })

    describe('getFacebookIntegrationInternals', () => {
        it('should return loading ads when the value is set', () => {
            const result = selectors.getFacebookIntegrationLoadingAds(state)
            const expected = state.facebookAds.get('loadingAds')

            expect(result).toEqualImmutable(expected)
        })

        it('should return loading ads when the value is null', () => {
            state = {
                facebookAds: initialState.mergeDeep({loadingAds: null}),
            } as RootState

            const result = selectors.getFacebookIntegrationLoadingAds(state)
            const expected = fromJS([])

            expect(result).toEqualImmutable(expected)
        })

        it('should return loading ads when the value is `[]`', () => {
            state = {
                facebookAds: initialState.mergeDeep({loadingAds: []}),
            } as RootState

            const result = selectors.getFacebookIntegrationLoadingAds(state)
            const expected = fromJS([])

            expect(result).toEqualImmutable(expected)
        })
    })
})
