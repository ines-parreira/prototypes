import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {shallow} from 'enzyme'
import React from 'react'

import AssigneeTeamSelect from '../AssigneeTeamSelect'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

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
                        <AssigneeTeamSelect
                            store={mockStore({
                                teams: fromJS({
                                    all: teams
                                })
                            })}
                        />
                    )
                    expect(component.dive()).toMatchSnapshot()
                })

                it('should render a dropdown with selected value', () => {
                    const component = shallow(
                        <AssigneeTeamSelect
                            value={1}
                            store={mockStore({
                                teams: fromJS({
                                    all: teams
                                })
                            })}
                        />
                    )
                    expect(component.dive()).toMatchSnapshot()
                })

                it('should render a dropdown without "Unassign" option', () => {
                    const component = shallow(
                        <AssigneeTeamSelect
                            value={1}
                            store={mockStore({
                                teams: fromJS({
                                    all: teams
                                })
                            })}
                            allowUnassign={false}
                        />
                    )
                    expect(component.dive()).toMatchSnapshot()
                })
            })
        })
    })
})
