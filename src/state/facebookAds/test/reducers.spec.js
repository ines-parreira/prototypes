import * as immutableMatchers from 'jest-immutable-matchers'

import reducer, {initialState} from '../reducers'
import * as types from '../constants'

jest.addMatchers(immutableMatchers)

describe('facebookAds reducer', () => {
    it('should return initial state', () => {
        expect(reducer(undefined, {})).toEqualImmutable(initialState)
    })

    it('should set loading state', () => {
        const action = {
            type: types.SET_FACEBOOK_ADS_LOADING,
            payload: false
        }

        const nextState = reducer(initialState, action)
        expect(nextState).toMatchSnapshot()
    })

    it('should set internals', () => {
        const internals = {
            '1': {
                ads: {
                    postid1: {
                        comments_fetched_at: '2019-01-01 10:30:00',
                        name: 'ad 1',
                        is_active: true
                    }
                }
            }
        }

        const action = {
            type: types.SET_FACEBOOK_ADS_INTERNALS,
            payload: internals
        }

        const nextState = reducer(initialState, action)
        expect(nextState).toMatchSnapshot()
    })

    it('should add loading ad', () => {
        const action = {
            type: types.ADD_LOADING_FACEBOOK_AD,
            payload: 'postid1'
        }

        const nextState = reducer(initialState, action)
        expect(nextState).toMatchSnapshot()
    })

    it('should remove loading ad', () => {
        const previousState = initialState.mergeDeep({
            loadingAds: ['postid1'],
        })

        const action = {
            type: types.REMOVE_LOADING_FACEBOOK_AD,
            payload: 'postid1'
        }

        const nextState = reducer(previousState, action)
        expect(nextState).toMatchSnapshot()
    })

    it('should update active ad', () => {
        const previousState = initialState.mergeDeep({
            internals: {
                '1': {
                    ads: {
                        postid1: {
                            comments_fetched_at: '2019-01-01 10:30:00',
                            name: 'ad 1',
                            is_active: false
                        }
                    }
                }
            }
        })

        const action = {
            type: types.UPDATE_ACTIVE_FACEBOOK_AD,
            payload: {
                integrationId: 1,
                id: 'postid1',
                isActive: true
            }
        }

        const nextState = reducer(previousState, action)
        expect(nextState).toMatchSnapshot()
    })
})
