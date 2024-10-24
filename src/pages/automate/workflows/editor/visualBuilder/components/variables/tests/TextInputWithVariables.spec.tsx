import {render, act, fireEvent, screen} from '@testing-library/react'
import React from 'react'

import TextInputWithVariables from '../TextInputWithVariables'

describe('<TextInputWithVariables />', () => {
    it('should apply date filter for date variable', () => {
        const mockOnChange = jest.fn()

        render(
            <TextInputWithVariables
                value=""
                onChange={mockOnChange}
                variables={[
                    {
                        name: 'HTTP request step',
                        nodeType: 'http_request',
                        variables: [
                            {
                                name: 'date variable',
                                value: 'steps_state.http_request1.content.variable1',
                                nodeType: 'http_request',
                                type: 'date',
                            },
                        ],
                    },
                ]}
            />
        )

        act(() => {
            fireEvent.click(screen.getByText('{+}'))
        })

        act(() => {
            fireEvent.click(screen.getByText('HTTP request step'))
        })

        act(() => {
            fireEvent.click(screen.getByText('date variable'))
        })

        expect(mockOnChange).toHaveBeenCalledWith(
            '{{steps_state.http_request1.content.variable1 | date}}'
        )
    })

    it('should apply no filter', () => {
        const mockOnChange = jest.fn()

        render(
            <TextInputWithVariables
                value=""
                onChange={mockOnChange}
                variables={[
                    {
                        name: 'HTTP request step',
                        nodeType: 'http_request',
                        variables: [
                            {
                                name: 'number variable',
                                value: 'steps_state.http_request1.content.variable1',
                                nodeType: 'http_request',
                                type: 'number',
                            },
                        ],
                    },
                ]}
            />
        )

        act(() => {
            fireEvent.click(screen.getByText('{+}'))
        })

        act(() => {
            fireEvent.click(screen.getByText('HTTP request step'))
        })

        act(() => {
            fireEvent.click(screen.getByText('number variable'))
        })

        expect(mockOnChange).toHaveBeenCalledWith(
            '{{steps_state.http_request1.content.variable1}}'
        )
    })

    it('should not allow to customize filters for invalid variables', () => {
        render(
            <TextInputWithVariables
                value="{{steps_state.http_request1.content.variable1 | date}}"
                onChange={jest.fn()}
                variables={[]}
            />
        )

        act(() => {
            fireEvent.click(screen.getByLabelText('Invalid variable'))
        })

        expect(screen.queryByDisplayValue('date')).not.toBeInTheDocument()
    })
})
