import {shallow} from 'enzyme'
import React from 'react'
import {fromJS} from 'immutable'

import SetAssigneeAction from '../SetAssigneeAction'

describe('<SetAssigneeAction/>', () => {
    describe('render()', () => {
        const updateActionArgs = jest.fn()
        const teams = fromJS([
            {id: 1, name: 'Team 1', decoration: {}},
            {id: 2, name: 'Team 2', decoration: {}},
        ])
        const users = fromJS([
            {id: 1, name: 'User 1', email: 'email1@foo.com', meta: {}},
            {id: 2, name: 'User 2', email: 'email2@foo.com', meta: {}},
        ])

        it('should render user dropdown', () => {
            const component = shallow(
                <SetAssigneeAction
                    action={fromJS({})}
                    teams={teams}
                    agents={users}
                    handleUsers
                    updateActionArgs={updateActionArgs}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render team dropdown', () => {
            const component = shallow(
                <SetAssigneeAction
                    action={fromJS({})}
                    teams={teams}
                    agents={users}
                    handleTeams
                    updateActionArgs={updateActionArgs}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render user dropdown with current assignee', () => {
            const component = shallow(
                <SetAssigneeAction
                    action={fromJS({
                        arguments: {
                            assignee_user: users.get(0),
                        },
                    })}
                    teams={teams}
                    agents={users}
                    handleUsers
                    updateActionArgs={updateActionArgs}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render team dropdown with current assignee', () => {
            const component = shallow(
                <SetAssigneeAction
                    action={fromJS({
                        arguments: {
                            assignee_team: teams.get(0),
                        },
                    })}
                    teams={teams}
                    agents={users}
                    handleTeams
                    updateActionArgs={updateActionArgs}
                />
            )

            expect(component).toMatchSnapshot()
        })
    })
})
