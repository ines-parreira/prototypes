import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import MockAdapter from 'axios-mock-adapter'

import * as actions from '../actions'
import {RootState, StoreDispatch} from '../../types'
import client from '../../../models/api/resources'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const store = mockStore()
const mockServer = new MockAdapter(client)

beforeEach(() => {
    store.clearActions()
    mockServer.reset()
    jest.clearAllMocks()
})

describe('actions', () => {
    describe('fetchWidgets()', () => {
        it('should dispatch results', async () => {
            const response = {
                data: [
                    {id: 1, order: 0},
                    {id: 2, order: 1},
                    {id: 3, order: 2},
                ],
            }

            mockServer.onGet('/api/widgets/').reply(200, response)

            const res = await store.dispatch(actions.fetchWidgets())
            expect(res).toMatchSnapshot()
            expect(mockServer.history.get[0].params).toMatchSnapshot()
        })
    })
})
