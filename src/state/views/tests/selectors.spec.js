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
})
