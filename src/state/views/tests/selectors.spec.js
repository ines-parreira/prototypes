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

    describe('getViewIdToDisplay()', () => {
        it('should return null because there is no views', () => {
            const viewType = 'ticket-list'
            const state = {views: initialState.set('items', fromJS([]))}
            expect(selectors.getViewIdToDisplay(viewType)(state)).toEqual(null)
        })

        it('should return the id of the first view of matching type because no urlViewId was passed', () => {
            const viewId = 7
            const viewType = 'ticket-list'
            const state = {views: initialState.set('items', fromJS([{id: viewId, type: viewType}]))}
            expect(selectors.getViewIdToDisplay(viewType)(state)).toEqual(viewId)
        })

        it('should return the passed urlViewId because there is a matching view of the same type', () => {
            const viewId = 7
            const viewType = 'ticket-list'
            const state = {views: initialState.set('items', fromJS([{id: viewId, type: viewType}]))}
            expect(selectors.getViewIdToDisplay(viewType, viewId.toString())(state)).toEqual(viewId)
        })

        it('should not return the passed urlViewId because there is no matching view of the same type ' +
            '(should instead return the if of the first view of matching type)', () => {
            const viewId = 7
            const viewType = 'customer-list'
            const ticketViewId = 9
            const ticketViewType = 'ticket-list'
            const state = {views: initialState.set('items', fromJS([
                {id: viewId, type: viewType},
                {id: ticketViewId, type: ticketViewType}
            ]))}
            expect(selectors.getViewIdToDisplay(ticketViewType, viewId.toString())(state)).toEqual(ticketViewId)
        })
    })
})
