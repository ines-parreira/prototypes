import {act, render, fireEvent, screen} from '@testing-library/react'
import React from 'react'

import Headers from '../Headers'

describe('<Headers />', () => {
    it('should trigger name change', () => {
        const mockOnChange = jest.fn()

        render(
            <Headers
                headers={[
                    {
                        name: 'test name',
                        value: 'test value',
                    },
                ]}
                onChange={mockOnChange}
                onDelete={jest.fn()}
                onAdd={jest.fn()}
            />
        )

        act(() => {
            fireEvent.change(screen.getByDisplayValue('test name'), {
                target: {value: 'some test name'},
            })
        })

        expect(mockOnChange).toHaveBeenCalledWith(0, {
            name: 'some test name',
            value: 'test value',
        })
    })
})
