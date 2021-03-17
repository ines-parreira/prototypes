import {fromJS} from 'immutable'
import {shallow} from 'enzyme'
import React from 'react'

import {AssigneeUserSelectContainer} from '../AssigneeUserSelect.tsx'

describe('ast', () => {
    describe('widgets', () => {
        describe('<AssigneeUserSelect/>', () => {
            describe('render()', () => {
                const agents = [
                    {id: 1, name: 'Agent 1'},
                    {id: 2, name: 'Agent 2'},
                    {id: 3, name: 'Agent 3'},
                ]

                const actions = {
                    fetchUsers: jest.fn(),
                    onChange: jest.fn(),
                }

                it('should render a loading message because agents have not been fetched yet', () => {
                    const component = shallow(
                        <AssigneeUserSelectContainer
                            agents={fromJS([])}
                            actions={actions}
                        />
                    )
                    expect(component).toMatchSnapshot()
                })

                it('should render a dropdown without selected value', () => {
                    const component = shallow(
                        <AssigneeUserSelectContainer
                            agents={fromJS(agents)}
                            actions={actions}
                        />
                    )
                    expect(component).toMatchSnapshot()
                })

                it('should render a dropdown with selected value', () => {
                    const component = shallow(
                        <AssigneeUserSelectContainer
                            value={1}
                            agents={fromJS(agents)}
                            actions={actions}
                        />
                    )
                    expect(component).toMatchSnapshot()
                })

                it('should render a dropdown without "Unassign" option', () => {
                    const component = shallow(
                        <AssigneeUserSelectContainer
                            value={1}
                            agents={fromJS(agents)}
                            allowUnassign={false}
                        />
                    )
                    expect(component).toMatchSnapshot()
                })
            })
        })
    })
})
