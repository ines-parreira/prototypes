import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import thunk from 'redux-thunk'
import * as immutableMatchers from 'jest-immutable-matchers'

import * as actions from '../actions'
import {initialState} from '../reducers'

jest.addMatchers(immutableMatchers)

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)


jest.mock('../../notifications/actions', () => {
    return {
        notify: jest.fn(() => (args) => args),
    }
})


describe('widget actions', () => {
    let store
    let mockServer

    beforeEach(() => {
        store = mockStore({widgets: initialState})
        mockServer = new MockAdapter(axios)
    })

    describe('submitWidgets', () => {
        it('it should send replace customer context with user', () => {
            store = mockStore({widgets: fromJS({currentContext: 'customer', ...initialState})})

            let spy = jest.spyOn(axios, 'put')

            mockServer.onPut('/api/widgets/').reply(200, {data: {}})

            const widgets = [{
                context: 'customer',
                created_datetime: '2018-07-27T11:48:40.746226+00:00',
                deactivated_datetime: null,
                deleted_datetime: null,
                id: 3,
                integration_id: null,
                order: 0,
                template: {},
                type: 'smooch_inside',
                updated_datetime: '2018-07-27T15:38:11.554485+00:00',
                uri: '/api/widgets/3/'
            }]

            store.dispatch(actions.submitWidgets(widgets)).then(() => expect(store.getActions()).toMatchSnapshot())
            expect(spy).toHaveBeenCalledWith('/api/widgets/', [{'context': 'user', 'order': 0, 'template': {}, 'type': 'custom'}])
        })

    })
})
