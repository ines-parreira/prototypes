import {render, screen, fireEvent, act, waitFor} from '@testing-library/react'
import React from 'react'

import ActionFormInputs from '../ActionFormInputs'

jest.mock('common/flags', () => ({
    useFlag: jest.fn(),
}))

describe('<ActionFormInputs />', () => {
    it('should render template input tooltip', async () => {
        render(
            <ActionFormInputs
                templateInputs={[
                    {
                        id: 'test',
                        name: 'test name',
                        instructions: 'test',
                        data_type: 'string',
                    },
                ]}
                inputs={[]}
                onDelete={jest.fn()}
                onChange={jest.fn()}
                onAdd={jest.fn()}
                appName="test"
            />
        )

        act(() => {
            fireEvent.mouseEnter(screen.getByDisplayValue('test name'))
        })

        await waitFor(() => {
            expect(
                screen.getByText(
                    'This information is required by test to perform this Action.'
                )
            ).toBeInTheDocument()
        })
    })

    it('should allow to change/delete inputs', () => {
        const mockOnChange = jest.fn()
        const mockOnDelete = jest.fn()

        render(
            <ActionFormInputs
                inputs={[
                    {
                        id: 'test',
                        name: 'test name',
                        instructions: 'test instructions',
                        data_type: 'string',
                    },
                ]}
                onDelete={mockOnDelete}
                onChange={mockOnChange}
                onAdd={jest.fn()}
            />
        )

        act(() => {
            fireEvent.change(screen.getByDisplayValue('test name'), {
                target: {value: 'new test name'},
            })
            fireEvent.change(screen.getByDisplayValue('test instructions'), {
                target: {value: 'new test instructions'},
            })
        })

        expect(mockOnChange).toHaveBeenNthCalledWith(
            1,
            {
                id: 'test',
                name: 'new test name',
                instructions: 'test instructions',
                data_type: 'string',
            },
            0
        )
        expect(mockOnChange).toHaveBeenNthCalledWith(
            2,
            {
                id: 'test',
                name: 'test name',
                instructions: 'new test instructions',
                data_type: 'string',
            },
            0
        )

        act(() => {
            fireEvent.click(screen.getByText('close'))
        })

        expect(mockOnDelete).toHaveBeenCalledWith(0)
    })
})
