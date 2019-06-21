import React from 'react'
import {shallow} from 'enzyme'

import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import _noop from 'lodash/noop'
import {fromJS} from 'immutable'

import TicketAssignee from '../TicketAssignee/TicketAssignee'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

const defaultProps = {
    store: mockStore({
        infobar: fromJS({}),
        ticket: fromJS({}),
        widgets: fromJS({}),
    }),
    direction: 'right',
    setAgent: _noop,
    className: 'classname',
    transparent: true
}

describe('<TicketAssignee/>', () => {
    describe('render()', () => {
        it('should not display any agent info because there is no assignee', () => {
            const component = shallow(
                <TicketAssignee
                    {...defaultProps}
                    currentAssignee={null}
                />
            )
            expect(component.dive()).toMatchSnapshot()
        })
        it('should display the info of the agent assigned', () => {
            const component = shallow(
                <TicketAssignee
                    {...defaultProps}
                    currentAssignee={fromJS({id: 1, name: 'Steve Frizeli'})}
                    profilePictureUrl='profilePictureUrl'
                />
            )

            expect(component.dive()).toMatchSnapshot()
        })

        it('should display the email of the agent assigned as its name because it has no name', () => {
            const component = shallow(
                <TicketAssignee
                    {...defaultProps}
                    currentAssignee={fromJS({id: 1, email: 'steve@acme.gorgias.io'})}
                />
            )

            expect(component.dive()).toMatchSnapshot()
        })
    })

})
