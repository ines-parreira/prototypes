import {act, fireEvent, render, screen} from '@testing-library/react'
import React from 'react'

import {StringConditionType} from '../StringConditionType'

describe('<StringConditionType />', () => {
    it('should render string condition with options', () => {
        render(
            <StringConditionType
                condition={{equals: [{var: ''}, 'test1']}}
                onChange={jest.fn()}
                options={[
                    {value: 'test1', label: 'test 1'},
                    {value: 'test2', label: 'test 2'},
                ]}
            />
        )

        expect(screen.getByText('test 1')).toBeInTheDocument()
    })

    it('should allow to select predefined option', () => {
        const mockOnChange = jest.fn()

        render(
            <StringConditionType
                condition={{equals: [{var: ''}, null]}}
                onChange={mockOnChange}
                options={[
                    {value: 'test1', label: 'test 1'},
                    {value: 'test2', label: 'test 2'},
                ]}
            />
        )

        act(() => {
            fireEvent.focus(screen.getByText('value'))
        })

        act(() => {
            fireEvent.click(screen.getByText('test 2'))
        })

        expect(mockOnChange).toHaveBeenCalledWith({
            equals: [{var: ''}, 'test2'],
        })
    })
})
