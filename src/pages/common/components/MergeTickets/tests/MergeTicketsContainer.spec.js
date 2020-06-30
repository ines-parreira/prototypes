import React from 'react'
import {fromJS} from 'immutable'
import {shallow} from 'enzyme'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

import MergeTicketsContainer from '../MergeTicketsContainer'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

const _noop = () => {}

describe('MergeTicketsContainer component', () => {
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

    const commonProps = {
        isOpen: true,
        toggleModal: _noop,
    }

    beforeEach(() => {
        commonProps.store = mockStore({})
    })

    it('should render a closed modal because isOpen==false', () => {
        const props = {...commonProps}
        props.isOpen = false
        const component = shallow(
            <MergeTicketsContainer sourceTicket={baseTicket} {...props} />
        ).dive()

        expect(component).toMatchSnapshot()
    })

    it('should render the selection component if there is no selected ticket in the state', () => {
        const component = shallow(
            <MergeTicketsContainer sourceTicket={baseTicket} {...commonProps} />
        ).dive()

        expect(component).toMatchSnapshot()
    })

    it('should render the build component if there is a selected ticket in the state', () => {
        const component = shallow(
            <MergeTicketsContainer sourceTicket={baseTicket} {...commonProps} />
        ).dive()

        component.setState({targetTicket: baseTicket})

        expect(component).toMatchSnapshot()
    })
})
