import React from 'react'

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'

import ActionFormInputs from '../ActionFormInputs'

jest.mock('core/flags', () => ({
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
            />,
        )

        act(() => {
            fireEvent.mouseEnter(screen.getByDisplayValue('test name'))
        })

        await waitFor(() => {
            expect(
                screen.getByText(
                    'This information is required by test to perform this Action.',
                ),
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
            />,
        )

        act(() => {
            fireEvent.change(screen.getByDisplayValue('test name'), {
                target: { value: 'new test name' },
            })
            fireEvent.change(screen.getByDisplayValue('test instructions'), {
                target: { value: 'new test instructions' },
            })
        })

        expect(mockOnChange).toHaveBeenNthCalledWith(1, {
            id: 'test',
            name: 'new test name',
            instructions: 'test instructions',
            data_type: 'string',
        })
        expect(mockOnChange).toHaveBeenNthCalledWith(2, {
            id: 'test',
            name: 'test name',
            instructions: 'new test instructions',
            data_type: 'string',
        })

        act(() => {
            fireEvent.click(screen.getByText('close'))
        })

        expect(mockOnDelete).toHaveBeenCalledWith('test')
    })

    it('should render default label', () => {
        render(
            <ActionFormInputs
                inputs={[]}
                onDelete={jest.fn()}
                onChange={jest.fn()}
                onAdd={jest.fn()}
            />,
        )

        expect(
            screen.getByText(
                'Collect information from customers to use as variables in this Action',
            ),
        ).toBeInTheDocument()
    })

    it('should render custom label', () => {
        render(
            <ActionFormInputs
                inputs={[]}
                onDelete={jest.fn()}
                onChange={jest.fn()}
                onAdd={jest.fn()}
                label="custom label"
            />,
        )

        expect(screen.getByText('custom label')).toBeInTheDocument()
    })

    it('should render default description', () => {
        render(
            <ActionFormInputs
                inputs={[]}
                onDelete={jest.fn()}
                onChange={jest.fn()}
                onAdd={jest.fn()}
            />,
        )

        expect(
            screen.getByText(
                'Note: AI Agent already has access to the customer’s email address and order number.',
            ),
        ).toBeInTheDocument()
    })

    it('should allow no description', () => {
        render(
            <ActionFormInputs
                inputs={[]}
                onDelete={jest.fn()}
                onChange={jest.fn()}
                onAdd={jest.fn()}
                description={null}
            />,
        )

        expect(
            screen.queryByText(
                'Note: AI Agent already has access to the customer’s email address and order number.',
            ),
        ).not.toBeInTheDocument()
    })

    it('should trigger input blur events', () => {
        const mockOnNameBlur = jest.fn()
        const mockOnInstructionsBlur = jest.fn()

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
                onDelete={jest.fn()}
                onChange={jest.fn()}
                onAdd={jest.fn()}
                onNameBlur={mockOnNameBlur}
                onInstructionsBlur={mockOnInstructionsBlur}
            />,
        )

        act(() => {
            fireEvent.blur(screen.getByDisplayValue('test name'))
        })

        act(() => {
            fireEvent.blur(screen.getByDisplayValue('test instructions'))
        })

        expect(mockOnNameBlur).toHaveBeenCalledWith('test')
        expect(mockOnInstructionsBlur).toHaveBeenCalledWith('test')
    })
})
