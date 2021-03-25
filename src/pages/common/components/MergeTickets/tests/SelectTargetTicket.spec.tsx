import React from 'react'
import {fromJS} from 'immutable'
import {shallow} from 'enzyme'
import thunk from 'redux-thunk'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'

import SelectTargetTicket from '../SelectTargetTicket'
import {StoreDispatch} from '../../../../../state/types'

type MockedRootState = Record<string, unknown>

const middlewares = [thunk]
const mockStore = configureMockStore<MockedRootState, StoreDispatch>(
    middlewares
)

describe('SelectTargetTicket component', () => {
    let store: MockStoreEnhanced<MockedRootState, StoreDispatch>
    const baseTicket = fromJS({
        subject: 'foo',
        assignee_user: {
            id: 1,
            name: 'John Smith',
        },
        customer: {
            id: 22,
            name: 'Maria Curie',
        },
    })

    beforeEach(() => {
        store = mockStore({})
    })

    it('should render', () => {
        const component = shallow(
            <SelectTargetTicket
                {...{store}}
                sourceTicket={baseTicket}
                updateTargetTicket={baseTicket}
                customerId={123}
            />
        ).dive()

        expect(component).toMatchSnapshot()
    })
})
