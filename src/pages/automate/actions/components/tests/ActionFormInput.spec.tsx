import React from 'react'
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react'

import {useFlag} from 'common/flags'

import ActionFormInput from '../ActionFormInput'

jest.mock('common/flags')

const mockUseFlag = jest.mocked(useFlag)

describe('<ActionFormInput />', () => {
    beforeEach(() => {
        jest.resetAllMocks()

        mockUseFlag.mockReturnValue(true)
    })

    it('should render action input', () => {
        render(
            <ActionFormInput
                input={{
                    id: 'someid',
                    name: 'some name',
                    instructions: 'some instructions',
                    data_type: 'string',
                }}
                onDelete={jest.fn()}
                onChange={jest.fn()}
            />
        )

        expect(screen.getByDisplayValue('some name')).toBeInTheDocument()
        expect(
            screen.getByDisplayValue('some instructions')
        ).toBeInTheDocument()
    })

    it('should delete input', () => {
        const mockOnDelete = jest.fn()

        render(
            <ActionFormInput
                input={{
                    id: 'someid',
                    name: 'some name',
                    instructions: 'some instructions',
                    data_type: 'string',
                }}
                onDelete={mockOnDelete}
                onChange={jest.fn()}
            />
        )

        act(() => {
            fireEvent.click(screen.getByText('close'))
        })

        expect(mockOnDelete).toHaveBeenCalled()
    })

    it('should change input', () => {
        const mockOnChange = jest.fn()

        const {rerender} = render(
            <ActionFormInput
                input={{
                    id: 'someid',
                    name: 'some name',
                    instructions: 'some instructions',
                    data_type: 'string',
                }}
                onDelete={jest.fn()}
                onChange={mockOnChange}
            />
        )

        act(() => {
            fireEvent.change(screen.getByDisplayValue('some name'), {
                target: {value: 'new name'},
            })
        })

        expect(mockOnChange).toHaveBeenNthCalledWith(1, {
            id: 'someid',
            name: 'new name',
            instructions: 'some instructions',
            data_type: 'string',
        })

        act(() => {
            fireEvent.change(screen.getByDisplayValue('some instructions'), {
                target: {value: 'new instructions'},
            })
        })

        expect(mockOnChange).toHaveBeenNthCalledWith(2, {
            id: 'someid',
            name: 'some name',
            instructions: 'new instructions',
            data_type: 'string',
        })

        act(() => {
            fireEvent.click(screen.getAllByText('String')[0])
            fireEvent.click(screen.getByText('Product'))
        })

        expect(mockOnChange).toHaveBeenNthCalledWith(3, {
            id: 'someid',
            name: 'some name',
            instructions: 'some instructions',
            kind: 'product',
            integration_id: '{{store.helpdesk_integration_id}}',
        })

        act(() => {
            fireEvent.click(screen.getAllByText('String')[0])
            fireEvent.click(screen.getByText('Number'))
        })

        expect(mockOnChange).toHaveBeenNthCalledWith(4, {
            id: 'someid',
            name: 'some name',
            instructions: 'some instructions',
            data_type: 'number',
        })

        rerender(
            <ActionFormInput
                input={{
                    id: 'someid',
                    name: 'some name',
                    instructions: 'some instructions',
                    kind: 'product',
                    integration_id: '{{store.helpdesk_integration_id}}',
                }}
                onDelete={jest.fn()}
                onChange={mockOnChange}
            />
        )

        act(() => {
            fireEvent.click(screen.getAllByText('Product')[0])
            fireEvent.click(screen.getByText('String'))
        })

        expect(mockOnChange).toHaveBeenNthCalledWith(5, {
            id: 'someid',
            name: 'some name',
            instructions: 'some instructions',
            data_type: 'string',
        })
    })

    it('should render disabled input', () => {
        render(
            <ActionFormInput
                input={{
                    id: 'someid',
                    name: 'some name',
                    instructions: 'some instructions',
                    data_type: 'string',
                }}
                onDelete={jest.fn()}
                onChange={jest.fn()}
                isDisabled
            />
        )

        expect(screen.getAllByText('String')[0].parentElement).toHaveClass(
            'disabled'
        )
        expect(screen.getByDisplayValue('some name')).toBeDisabled()
        expect(screen.getByDisplayValue('some instructions')).toBeDisabled()
        expect(screen.getByRole('button', {name: 'close'})).toBeAriaDisabled()
    })

    it('should render semi immutable input', () => {
        render(
            <ActionFormInput
                input={{
                    id: 'someid',
                    name: 'some name',
                    instructions: 'some instructions',
                    data_type: 'string',
                }}
                onDelete={jest.fn()}
                onChange={jest.fn()}
                isSemiImmutable
            />
        )

        expect(screen.getAllByText('String')[0].parentElement).toHaveClass(
            'disabled'
        )
        expect(screen.getByDisplayValue('some name')).not.toBeDisabled()
        expect(screen.getByDisplayValue('some instructions')).not.toBeDisabled()
        expect(screen.getByRole('button', {name: 'close'})).toBeAriaDisabled()
    })

    it('should render tooltip for disabled input', async () => {
        render(
            <ActionFormInput
                input={{
                    id: 'someid',
                    name: 'some name',
                    instructions: 'some instructions',
                    data_type: 'string',
                }}
                onDelete={jest.fn()}
                onChange={jest.fn()}
                isDisabled
                disabledTooltip="some tooltip text"
            />
        )

        act(() => {
            fireEvent.mouseEnter(screen.getByDisplayValue('some name'))
        })

        await waitFor(() => {
            expect(screen.getByText('some tooltip text')).toBeInTheDocument()
        })
    })

    it('should not render product input', () => {
        mockUseFlag.mockReturnValue(false)

        render(
            <ActionFormInput
                input={{
                    id: 'someid',
                    name: 'some name',
                    instructions: 'some instructions',
                    data_type: 'string',
                }}
                onDelete={jest.fn()}
                onChange={jest.fn()}
            />
        )

        act(() => {
            fireEvent.click(screen.getAllByText('String')[0])
        })

        expect(screen.queryByText('Product')).not.toBeInTheDocument()
    })
})
