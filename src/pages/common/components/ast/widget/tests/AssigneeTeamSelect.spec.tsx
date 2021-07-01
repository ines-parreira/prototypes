import {fromJS} from 'immutable'
import {shallow} from 'enzyme'
import React, {ComponentProps} from 'react'

import {AssigneeTeamSelectContainer} from '../AssigneeTeamSelect'

describe('ast', () => {
    describe('widgets', () => {
        describe('<AssigneeTeamSelect/>', () => {
            describe('render()', () => {
                const teams = {
                    1: {id: 1, name: 'Team 1'},
                    2: {id: 2, name: 'Team 2'},
                    3: {id: 3, name: 'Team 3'},
                }
                const commonProps = ({
                    teams: fromJS(teams),
                } as unknown) as ComponentProps<
                    typeof AssigneeTeamSelectContainer
                >

                it('should render a dropdown without selected value', () => {
                    const component = shallow(
                        <AssigneeTeamSelectContainer {...commonProps} />
                    )
                    expect(component).toMatchSnapshot()
                })

                it('should render a dropdown with selected value', () => {
                    const component = shallow(
                        <AssigneeTeamSelectContainer
                            {...commonProps}
                            value={1}
                        />
                    )
                    expect(component).toMatchSnapshot()
                })

                it('should render a dropdown without "Unassign" option', () => {
                    const component = shallow(
                        <AssigneeTeamSelectContainer
                            {...commonProps}
                            value={1}
                            allowUnassign={false}
                        />
                    )
                    expect(component).toMatchSnapshot()
                })
            })
        })
    })
})
