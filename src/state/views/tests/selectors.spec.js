import moment from 'moment'
import {initialState} from '../reducers'
import * as selectors from '../selectors'
import {fromJS} from 'immutable'

describe('selectors', () => {
    describe('isActiveViewTrashView()', () => {
        it('should be the trash view', () => {
            const state = {views: initialState.set('active', fromJS({
                category: 'system',
                name: 'Trash'
            }))}
            expect(selectors.isActiveViewTrashView(state)).toBe(true)
        })

        it('should not be the trash view (wrong category)', () => {
            const state = {views: initialState.set('active', fromJS({
                category: '',
                name: 'Trash'
            }))}
            expect(selectors.isActiveViewTrashView(state)).toBe(false)
        })

        it('should not be the trash view (wrong name)', () => {
            const state = {views: initialState.set('active', fromJS({
                category: 'system',
                name: 'Spam'
            }))}
            expect(selectors.isActiveViewTrashView(state)).toBe(false)
        })

    })

    describe('getRecentViews()', () => {
        it('should return value', () => {
            const recent = 12
            const state = {views: initialState.set('recent', recent)}
            expect(selectors.getRecentViews(state)).toBe(recent)
        })

        it('should return fallback', () => {
            const state = {views: initialState.set('recent', undefined)}
            expect(selectors.getRecentViews(state).toJS()).toEqual({})
        })
    })

    describe('getExpiredViewsCounts()', () => {
        it('should return an empty array (no expired counts)', () => {
            const now = moment.utc().toISOString()
            const recent = fromJS({
                1: {updated_datetime: now},
                2: {updated_datetime: now},
            })
            const state = {views: initialState.set('recent', recent)}
            expect(selectors.getExpiredViewsCounts(5)(state).toJS()).toEqual([])
        })

        it('should return some view ids (some counts are expired)', () => {
            const now = moment.utc().toISOString()
            const recent = fromJS({
                1: {updated_datetime: now},
                2: {updated_datetime: moment.utc().subtract(2, 's').toISOString()},
                3: {updated_datetime: now},
            })
            const state = {views: initialState.set('recent', recent)}
            expect(selectors.getExpiredViewsCounts(1)(state).toJS()).toEqual([2])
        })
    })
})
