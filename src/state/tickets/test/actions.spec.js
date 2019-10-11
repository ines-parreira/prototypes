import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import * as actions from '../actions'
import {initialState} from '../reducers'


const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)


describe('tickets actions', () => {
    let store

    beforeEach(() => {
        store = mockStore({ticket: initialState})
    })

    describe('updateCursor()', () => {
        it('should update cursor', () => {
            store.dispatch(actions.updateCursor('new'))
            expect(store.getActions()).toMatchSnapshot()
        })
    })
})
