import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS} from 'immutable'

import * as selectors from '../selectors'
import {initialState} from '../reducers'

jest.addMatchers(immutableMatchers)

describe('facebookAds selectors', () => {
    let state

    beforeEach(() => {
        state = {
            facebookAds: initialState
                .mergeDeep({
                    loading: true,
                    internals: {
                        '1': {
                            ad_accounts: {
                                adaccountid1: {
                                    name: 'ad account 1',
                                    is_active: true
                                }
                            },
                            ads: {
                                postid1: {
                                    comments_fetched_at: '2019-01-01 10:30:00',
                                    name: 'ad 1',
                                    is_active: true
                                }
                            }
                        }
                    },
                    loadingAds: ['postid1'],
                    loadingAdAccounts: ['adaccountid1'],
                })
        }
    })

    describe('getFacebookIntegrationLoadingAdAccounts', () => {
        it('should return loading state when its value is set', () => {
            const result = selectors.getFacebookIntegrationLoading(state)
            expect(result).toBe(true)
        })

        it('should return default internals when its value is null', () => {
            state = {
                facebookAds: initialState.mergeDeep({loading: null})
            }

            const result = selectors.getFacebookIntegrationLoading(state)
            expect(result).toBe(false)
        })
    })

    describe('getFacebookIntegrationInternals', () => {
        it('should return internals when its value is set', () => {
            const result = selectors.getFacebookIntegrationInternals(state)
            const expected = state.facebookAds.get('internals')

            expect(result).toEqualImmutable(expected)
        })

        it('should return default internals when its value is null', () => {
            state = {
                facebookAds: initialState.mergeDeep({internals: null})
            }

            const result = selectors.getFacebookIntegrationInternals(state)
            const expected = fromJS({})

            expect(result).toEqualImmutable(expected)
        })

        it('should return default internals when its value is `{}`', () => {
            state = {
                facebookAds: initialState.mergeDeep({internals: {}})
            }

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
                facebookAds: initialState.mergeDeep({loadingAds: null})
            }

            const result = selectors.getFacebookIntegrationLoadingAds(state)
            const expected = fromJS([])

            expect(result).toEqualImmutable(expected)
        })

        it('should return loading ads when the value is `[]`', () => {
            state = {
                facebookAds: initialState.mergeDeep({loadingAds: []})
            }

            const result = selectors.getFacebookIntegrationLoadingAds(state)
            const expected = fromJS([])

            expect(result).toEqualImmutable(expected)
        })
    })

    describe('getFacebookIntegrationLoadingAdAccounts', () => {
        it('should return loading ad accounts when the value is set', () => {
            const result = selectors.getFacebookIntegrationLoadingAdAccounts(state)
            const expected = state.facebookAds.get('loadingAdAccounts')

            expect(result).toEqualImmutable(expected)
        })

        it('should return loading ad accounts when the value is null', () => {
            state = {
                facebookAds: initialState.mergeDeep({loadingAdAccounts: null})
            }

            const result = selectors.getFacebookIntegrationLoadingAdAccounts(state)
            const expected = fromJS([])

            expect(result).toEqualImmutable(expected)
        })

        it('should return loading ad accounts when the value is `[]`', () => {
            state = {
                facebookAds: initialState.mergeDeep({loadingAdAccounts: []})
            }

            const result = selectors.getFacebookIntegrationLoadingAdAccounts(state)
            const expected = fromJS([])

            expect(result).toEqualImmutable(expected)
        })
    })
})
