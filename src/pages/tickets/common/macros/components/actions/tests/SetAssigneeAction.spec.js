import {shallow} from 'enzyme'
import React from 'react'
import {fromJS} from 'immutable'

import SetAssigneeAction from '../SetAssigneeAction.tsx'

describe('<SetAssigneeAction/>', () => {
    describe('render()', () => {
        const updateActionArgs = jest.fn()

        it('should render user dropdown', () => {
            const component = shallow(
                <SetAssigneeAction
                    action={fromJS({})}
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
                            assignee_user: fromJS({
                                id: 1,
                                name: 'Team 1',
                                decoration: {},
                            }),
                        },
                    })}
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
                            assignee_team: fromJS({
                                id: 1,
                                name: 'Team 1',
                                decoration: {},
                            }),
                        },
                    })}
                    handleTeams
                    updateActionArgs={updateActionArgs}
                />
            )

            expect(component).toMatchSnapshot()
        })
    })
})
