import React from 'react'
import {shallow} from 'enzyme'

import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import _noop from 'lodash/noop'
import {fromJS} from 'immutable'

import TicketAssigneeContainer, {TicketAssignee} from '../TicketAssignee'

const teams = fromJS({
    all: {
        1: {id: 1, name: 'Team 1', decoration: {}},
        2: {id: 2, name: 'Team 2', decoration: {}},
    },
})

const users = fromJS({
    all: [
        {id: 1, name: 'User 1', email: 'email1@foo.com', meta: {}},
        {id: 2, name: 'User 2', email: 'email2@foo.com', meta: {}},
    ],
})

describe('<TicketAssignee/>', () => {
    describe('render()', () => {
        const defaultProps = {
            users: users.get('all'),
            teams: teams.get('all').valueSeq(),
            currentUser: fromJS({}),
            direction: 'right',
            setUser: _noop,
            setTeam: _noop,
            className: 'classname',
            transparent: true,
            currentAssigneeUser: null,
            currentAssigneeTeam: null,
        }

        it('should not display any agent info because there is no assignee', () => {
            const component = shallow(<TicketAssignee {...defaultProps} />)
            expect(component).toMatchSnapshot()
        })

        it('should display the info of the agent assigned', () => {
            const component = shallow(
                <TicketAssignee
                    {...defaultProps}
                    currentAssigneeUser={fromJS({id: 1, name: 'Steve Frizeli'})}
                    profilePictureUrl="profilePictureUrl"
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should display the email of the agent assigned as its name because it has no name', () => {
            const component = shallow(
                <TicketAssignee
                    {...defaultProps}
                    users={fromJS([
                        {id: 1, email: 'steve@acme.gorgias.io'},
                        users.getIn(['all', 1]),
                    ])}
                    currentAssigneeUser={fromJS({
                        id: 1,
                        email: 'steve@acme.gorgias.io',
                    })}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should display the info of the agent assigned even if a team is assigned too', () => {
            const component = shallow(
                <TicketAssignee
                    {...defaultProps}
                    currentAssigneeUser={fromJS({
                        id: 1,
                        email: 'steve@acme.gorgias.io',
                    })}
                    currentAssigneeTeam={fromJS({id: 1, name: 'Team 1'})}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should display the name of the team assigned because there is no user assigned', () => {
            const component = shallow(
                <TicketAssignee
                    {...defaultProps}
                    currentAssigneeTeam={fromJS({id: 1, name: 'Team 1'})}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should display users only', () => {
            const component = shallow(
                <TicketAssignee {...defaultProps} handleTeams={false} />
            )

            expect(component).toMatchSnapshot()
        })

        it('should display teams only', () => {
            const component = shallow(
                <TicketAssignee {...defaultProps} handleUsers={false} />
            )

            expect(component).toMatchSnapshot()
        })

        it('should not display teams because object is empty', () => {
            const component = shallow(
                <TicketAssignee {...defaultProps} teams={fromJS([])} />
            )

            expect(component).toMatchSnapshot()
        })
    })

    it('should read data from the redux store correctly', () => {
        const middlewares = [thunk]
        const mockStore = configureMockStore(middlewares)
        const store = mockStore({
            agents: users,
            teams,
            currentUser: fromJS({id: 1, email: 'steve@acme.gorgias.io'}),
        })
        const component = shallow(<TicketAssigneeContainer store={store} />)
        expect(component).toMatchSnapshot()
    })
})
