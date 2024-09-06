import React from 'react'
import {render, act, fireEvent, screen} from '@testing-library/react'

import TextareaWithVariables from '../TextareaWithVariables'

describe('<TextareaWithVariables />', () => {
    it('should apply json filter for JSON variable', () => {
        const mockOnChange = jest.fn()

        render(
            <TextareaWithVariables
                value=""
                onChange={mockOnChange}
                variables={[
                    {
                        name: 'HTTP request step',
                        nodeType: 'http_request',
                        variables: [
                            {
                                name: 'JSON variable',
                                value: 'steps_state.http_request1.content.variable1',
                                nodeType: 'http_request',
                                type: 'json',
                            },
                        ],
                    },
                ]}
            />
        )

        act(() => {
            fireEvent.click(screen.getByText('{+} variables'))
        })

        act(() => {
            fireEvent.click(screen.getByText('HTTP request step'))
        })

        act(() => {
            fireEvent.click(screen.getByText('JSON variable'))
        })

        expect(mockOnChange).toHaveBeenCalledWith(
            '{{steps_state.http_request1.content.variable1 | json}}'
        )
    })

    it('should apply date filter for date variable', () => {
        const mockOnChange = jest.fn()

        render(
            <TextareaWithVariables
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
            fireEvent.click(screen.getByText('{+} variables'))
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

    it('should apply json filter for array variable', () => {
        const mockOnChange = jest.fn()

        render(
            <TextareaWithVariables
                value=""
                onChange={mockOnChange}
                variables={[
                    {
                        name: 'HTTP request step',
                        nodeType: 'http_request',
                        variables: [
                            {
                                name: 'array variable',
                                value: 'steps_state.http_request1.content.variable1',
                                nodeType: 'http_request',
                                type: 'array',
                            },
                        ],
                    },
                ]}
            />
        )

        act(() => {
            fireEvent.click(screen.getByText('{+} variables'))
        })

        act(() => {
            fireEvent.click(screen.getByText('HTTP request step'))
        })

        act(() => {
            fireEvent.click(screen.getByText('array variable'))
        })

        expect(mockOnChange).toHaveBeenCalledWith(
            '{{steps_state.http_request1.content.variable1 | json}}'
        )
    })

    it('should apply json_escape filter for string variable', () => {
        const mockOnChange = jest.fn()

        render(
            <TextareaWithVariables
                value=""
                onChange={mockOnChange}
                variables={[
                    {
                        name: 'HTTP request step',
                        nodeType: 'http_request',
                        variables: [
                            {
                                name: 'string variable',
                                value: 'steps_state.http_request1.content.variable1',
                                nodeType: 'http_request',
                                type: 'string',
                            },
                        ],
                    },
                ]}
            />
        )

        act(() => {
            fireEvent.click(screen.getByText('{+} variables'))
        })

        act(() => {
            fireEvent.click(screen.getByText('HTTP request step'))
        })

        act(() => {
            fireEvent.click(screen.getByText('string variable'))
        })

        expect(mockOnChange).toHaveBeenCalledWith(
            '{{steps_state.http_request1.content.variable1 | json_escape}}'
        )
    })

    it('should apply no filter', () => {
        const mockOnChange = jest.fn()

        render(
            <TextareaWithVariables
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
            fireEvent.click(screen.getByText('{+} variables'))
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
})
