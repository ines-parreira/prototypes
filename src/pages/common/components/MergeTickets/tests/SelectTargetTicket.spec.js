import React from 'react'
import {fromJS} from 'immutable'
import {shallow} from 'enzyme'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

import SelectTargetTicket from '../SelectTargetTicket'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

const _noop = () => {}

describe('SelectTargetTicket component', () => {
    let store
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
                store={store}
                sourceTicket={baseTicket}
                updateTargetTicket={baseTicket}
                search={_noop}
                customerId={123}
            />
        ).dive()

        expect(component).toMatchSnapshot()
    })
})
