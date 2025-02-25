import React from 'react'

import { act, fireEvent, render, screen } from '@testing-library/react'

import FormUrlencoded from '../FormUrlencoded'

describe('<FormUrlencoded />', () => {
    it('should trigger key change', () => {
        const mockOnChange = jest.fn()

        render(
            <FormUrlencoded
                items={[
                    {
                        key: 'test key',
                        value: 'test value',
                    },
                ]}
                onChange={mockOnChange}
                onDelete={jest.fn()}
                onAdd={jest.fn()}
            />,
        )

        act(() => {
            fireEvent.change(screen.getByDisplayValue('test key'), {
                target: { value: 'some test key' },
            })
        })

        expect(mockOnChange).toHaveBeenCalledWith(0, {
            key: 'some test key',
            value: 'test value',
        })
    })
})
