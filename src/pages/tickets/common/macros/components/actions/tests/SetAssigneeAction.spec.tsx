import {shallow} from 'enzyme'
import React, {ComponentProps} from 'react'
import {fromJS} from 'immutable'

import SetAssigneeAction from '../SetAssigneeAction'

describe('<SetAssigneeAction/>', () => {
    describe('render()', () => {
        const minProps: ComponentProps<typeof SetAssigneeAction> = {
            action: fromJS({}),
            index: 1,
            updateActionArgs: jest.fn(),
        }

        it('should render user dropdown', () => {
            const component = shallow(
                <SetAssigneeAction {...minProps} handleUsers />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render team dropdown', () => {
            const component = shallow(
                <SetAssigneeAction {...minProps} handleTeams />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render user dropdown with current assignee', () => {
            const component = shallow(
                <SetAssigneeAction
                    {...minProps}
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
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render team dropdown with current assignee', () => {
            const component = shallow(
                <SetAssigneeAction
                    {...minProps}
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
                />
            )

            expect(component).toMatchSnapshot()
        })
    })
})
