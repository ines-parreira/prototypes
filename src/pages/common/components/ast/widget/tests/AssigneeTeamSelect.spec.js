import {fromJS} from 'immutable'
import {shallow} from 'enzyme'
import React from 'react'

import {AssigneeTeamSelectContainer} from '../AssigneeTeamSelect.tsx'

describe('ast', () => {
    describe('widgets', () => {
        describe('<AssigneeTeamSelect/>', () => {
            describe('render()', () => {
                const teams = {
                    1: {id: 1, name: 'Team 1'},
                    2: {id: 2, name: 'Team 2'},
                    3: {id: 3, name: 'Team 3'},
                }

                it('should render a dropdown without selected value', () => {
                    const component = shallow(
                        <AssigneeTeamSelectContainer teams={fromJS(teams)} />
                    )
                    expect(component).toMatchSnapshot()
                })

                it('should render a dropdown with selected value', () => {
                    const component = shallow(
                        <AssigneeTeamSelectContainer
                            value={1}
                            teams={fromJS(teams)}
                        />
                    )
                    expect(component).toMatchSnapshot()
                })

                it('should render a dropdown without "Unassign" option', () => {
                    const component = shallow(
                        <AssigneeTeamSelectContainer
                            value={1}
                            teams={fromJS(teams)}
                            allowUnassign={false}
                        />
                    )
                    expect(component).toMatchSnapshot()
                })
            })
        })
    })
})
