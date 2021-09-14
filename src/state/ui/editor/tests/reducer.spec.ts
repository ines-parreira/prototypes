import {linkEditionStarted, linkEditionEnded} from '../actions'
import reducer, {initialState} from '../reducer'

describe('editor reducer', () => {
    describe('linkEditionStarted action', () => {
        it('should set the isEditingLink value to true', () => {
            const newState = reducer(initialState, linkEditionStarted())

            expect(newState).toMatchSnapshot()
        })
    })

    describe('linkEditionEnded action', () => {
        it('should set the isEditingLink value to false', () => {
            const newState = reducer(initialState, linkEditionEnded())

            expect(newState).toMatchSnapshot()
        })
    })
})
