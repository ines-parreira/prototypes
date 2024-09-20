import React from 'react'
import {render, fireEvent, screen} from '@testing-library/react'
import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'

import {ticketDropdownFieldDefinition} from 'fixtures/customField'
import DropdownInputRow from '../DropdownInputRow'

const commonProps = {
    position: 0,
    id: 'dropdown-choice-123',
    onHover: jest.fn(),
    onDrop: jest.fn(),
    onChange: jest.fn(),
    onRemove: jest.fn(),
    isLast: false,
    isDisabled: false,
}

describe('<DropdownInputRow/>', () => {
    it('should render correctly', () => {
        const props = {
            ...commonProps,
            field: ticketDropdownFieldDefinition,
            value: 'Test value',
        }

        const {container} = render(
            <DndProvider backend={HTML5Backend}>
                <DropdownInputRow {...props} />
            </DndProvider>
        )
        expect(container.firstChild).toMatchSnapshot()
        const input = screen.getByDisplayValue('Test value')
        expect(input.hasAttribute('disabled')).toEqual(false)

        expect(screen.queryByText('clear')).toBeInTheDocument()
    })

    it('should render correctly when validation fails', () => {
        const props = {
            ...commonProps,
            field: ticketDropdownFieldDefinition,
            value: 'Test value',
            error: 'Unfortunately there is an error',
        }

        const {container} = render(
            <DndProvider backend={HTML5Backend}>
                <DropdownInputRow {...props} />
            </DndProvider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render disabled', () => {
        const props = {
            ...commonProps,
            field: ticketDropdownFieldDefinition,
            value: 'Test value',
            isDisabled: true,
        }

        render(
            <DndProvider backend={HTML5Backend}>
                <DropdownInputRow {...props} />
            </DndProvider>
        )
        const input = screen.getByDisplayValue('Test value')
        expect(input.hasAttribute('disabled')).toEqual(true)

        expect(screen.queryByText('drag_indicator')).not.toBeInTheDocument()
        expect(screen.queryByText('clear')).not.toBeInTheDocument()
    })

    it('should trigger an onChange event when changing the value', () => {
        const props = {
            ...commonProps,
            field: ticketDropdownFieldDefinition,
            value: 'Test value',
        }

        render(
            <DndProvider backend={HTML5Backend}>
                <DropdownInputRow {...props} />
            </DndProvider>
        )

        const input = screen.getByTestId('dropdown-choice-123')
        fireEvent.change(input, {target: {value: 'My new value'}})

        expect(props.onChange).toHaveBeenCalledWith(0, 'My new value')
    })

    it('should trigger an onRemove event when the remove button is clicked', () => {
        const props = {
            ...commonProps,
            field: ticketDropdownFieldDefinition,
            value: 'Test value',
        }

        render(
            <DndProvider backend={HTML5Backend}>
                <DropdownInputRow {...props} />
            </DndProvider>
        )

        const removeButton = screen.getByRole('button')
        removeButton.click()

        expect(props.onRemove).toHaveBeenCalled()
    })
})
