import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {shallow} from 'enzyme'
import React from 'react'

import AssigneeUserSelect from '../AssigneeUserSelect'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

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
                        <AssigneeUserSelect
                            store={mockStore({
                                agents: fromJS({
                                    all: [],
                                }),
                            })}
                            actions={actions}
                        />
                    )
                    expect(component.dive()).toMatchSnapshot()
                })

                it('should render a dropdown without selected value', () => {
                    const component = shallow(
                        <AssigneeUserSelect
                            store={mockStore({
                                agents: fromJS({
                                    all: agents,
                                }),
                            })}
                            actions={actions}
                        />
                    )
                    expect(component.dive()).toMatchSnapshot()
                })

                it('should render a dropdown with selected value', () => {
                    const component = shallow(
                        <AssigneeUserSelect
                            value={1}
                            store={mockStore({
                                agents: fromJS({
                                    all: agents,
                                }),
                            })}
                            actions={actions}
                        />
                    )
                    expect(component.dive()).toMatchSnapshot()
                })
            })
        })
    })
})
