import React from 'react'
import {mount} from 'enzyme'

import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import _noop from 'lodash/noop'
import {fromJS} from 'immutable'

import TicketAssignee from '../TicketAssignee/TicketAssignee'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

const commonProps = {
    store: mockStore({
        infobar: fromJS({}),
        ticket: fromJS({}),
        widgets: fromJS({}),
    }),
    direction: 'right',
    currentAssignee: 'test test',
    email: 'test@test.fr',
    profilePictureUrl: 'mySpecialUrl',
    setAgent: _noop,
    className: 'classname',
    transparent: true
}

describe('components', () => {
    describe('Ticket Assignee', () => {
        it('should display the profile picture and not the gravatar', () => {
            const component = mount(
                <TicketAssignee {...commonProps}/>
            )

            expect(component.find('Avatar').html()).toContain('mySpecialUrl')
        })

        it('should display the gravatar', () => {
            const component = mount(
                <TicketAssignee
                    {...commonProps}
                    profilePictureUrl=''
                />
            )

            expect(component.find('Avatar').text()).toBe('tt')
        })

    })
})
