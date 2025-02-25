import React, { ComponentProps } from 'react'

import { render } from '@testing-library/react'
import { fromJS } from 'immutable'

import { AssigneeUserSelectContainer } from '../AssigneeUserSelect'

describe('ast', () => {
    describe('widgets', () => {
        describe('<AssigneeUserSelect/>', () => {
            describe('render()', () => {
                const commonProps = {
                    agents: fromJS([
                        { id: 1, name: 'Agent 1' },
                        { id: 2, name: 'Agent 2' },
                        { id: 3, name: 'Agent 3' },
                    ]),
                    actions: {
                        fetchUsers: jest.fn(),
                        onChange: jest.fn(),
                    },
                } as unknown as ComponentProps<
                    typeof AssigneeUserSelectContainer
                >

                it('should render a loading message because agents have not been fetched yet', () => {
                    const { container } = render(
                        <AssigneeUserSelectContainer
                            {...commonProps}
                            agents={fromJS([])}
                        />,
                    )
                    expect(container.firstChild).toMatchSnapshot()
                })

                it('should render a dropdown without selected value', () => {
                    const { container } = render(
                        <AssigneeUserSelectContainer {...commonProps} />,
                    )
                    expect(container.firstChild).toMatchSnapshot()
                })

                it('should render a dropdown with selected value', () => {
                    const { container } = render(
                        <AssigneeUserSelectContainer
                            {...commonProps}
                            value={1}
                        />,
                    )
                    expect(container.firstChild).toMatchSnapshot()
                })

                it('should render a dropdown without "Unassign" option', () => {
                    const { container } = render(
                        <AssigneeUserSelectContainer
                            {...commonProps}
                            value={1}
                            allowUnassign={false}
                        />,
                    )
                    expect(container.firstChild).toMatchSnapshot()
                })
            })
        })
    })
})
