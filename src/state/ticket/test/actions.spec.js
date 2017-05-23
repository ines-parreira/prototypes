import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import * as types from '../constants'
import * as actions from '../actions'
import {initialState} from '../reducers'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('actions', () => {
    describe('ticket', () => {
        let store

        beforeEach(() => {
            store = mockStore(initialState)
        })

        it('should fail to delete ticket', () => {
            const expectedActions = [{
                type: types.DELETE_TICKET_ERROR
            }]

            return store.dispatch(actions.deleteTicket(13)).then(() => {
                store.getActions().forEach((action, index) => {
                    expect(action.type).toEqual(expectedActions[index].type)
                })
            })
        })
    })
})
