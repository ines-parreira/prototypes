import {fromJS} from 'immutable'
import {shallow} from 'enzyme'
import React, {ComponentProps} from 'react'

import {AssigneeUserSelectContainer} from '../AssigneeUserSelect'

describe('ast', () => {
    describe('widgets', () => {
        describe('<AssigneeUserSelect/>', () => {
            describe('render()', () => {
                const commonProps = {
                    agents: fromJS([
                        {id: 1, name: 'Agent 1'},
                        {id: 2, name: 'Agent 2'},
                        {id: 3, name: 'Agent 3'},
                    ]),
                    actions: {
                        fetchUsers: jest.fn(),
                        onChange: jest.fn(),
                    },
                } as unknown as ComponentProps<
                    typeof AssigneeUserSelectContainer
                >

                it('should render a loading message because agents have not been fetched yet', () => {
                    const component = shallow(
                        <AssigneeUserSelectContainer
                            {...commonProps}
                            agents={fromJS([])}
                        />
                    )
                    expect(component).toMatchSnapshot()
                })

                it('should render a dropdown without selected value', () => {
                    const component = shallow(
                        <AssigneeUserSelectContainer {...commonProps} />
                    )
                    expect(component).toMatchSnapshot()
                })

                it('should render a dropdown with selected value', () => {
                    const component = shallow(
                        <AssigneeUserSelectContainer
                            {...commonProps}
                            value={1}
                        />
                    )
                    expect(component).toMatchSnapshot()
                })

                it('should render a dropdown without "Unassign" option', () => {
                    const component = shallow(
                        <AssigneeUserSelectContainer
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
