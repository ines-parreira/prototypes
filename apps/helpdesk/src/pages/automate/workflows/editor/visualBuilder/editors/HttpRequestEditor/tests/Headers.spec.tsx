import React from 'react'

import { act, fireEvent, render, screen } from '@testing-library/react'

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
            />,
        )

        act(() => {
            fireEvent.change(screen.getByDisplayValue('test name'), {
                target: { value: 'some test name' },
            })
        })

        expect(mockOnChange).toHaveBeenCalledWith(0, {
            name: 'some test name',
            value: 'test value',
        })
    })

    it('should trigger name blur', () => {
        const mockOnBlur = jest.fn()

        render(
            <Headers
                headers={[
                    {
                        name: 'test name',
                        value: 'test value',
                    },
                ]}
                onChange={jest.fn()}
                onDelete={jest.fn()}
                onAdd={jest.fn()}
                onNameBlur={mockOnBlur}
            />,
        )

        act(() => {
            fireEvent.blur(screen.getByDisplayValue('test name'))
        })

        expect(mockOnBlur).toHaveBeenCalled()
    })
})
