import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import { HTML5Backend } from 'react-dnd-html5-backend'

import { OBJECT_TYPE_SETTINGS, OBJECT_TYPES } from 'custom-fields/constants'
import { ticketDropdownFieldDefinition } from 'fixtures/customField'
import { DndProvider } from 'utils/wrappers/DndProvider'

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

        const { container } = render(
            <DndProvider backend={HTML5Backend}>
                <DropdownInputRow {...props} />
            </DndProvider>,
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

        const { container } = render(
            <DndProvider backend={HTML5Backend}>
                <DropdownInputRow {...props} />
            </DndProvider>,
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
            </DndProvider>,
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
            </DndProvider>,
        )

        const input = screen.getByTestId('dropdown-choice-123')
        fireEvent.change(input, { target: { value: 'My new value' } })

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
            </DndProvider>,
        )

        const removeButton = screen.getByRole('button')
        removeButton.click()

        expect(props.onRemove).toHaveBeenCalled()
    })

    it.each(Object.values(OBJECT_TYPES))(
        'should render the correct placeholder based when object_type=%s',
        (objectType) => {
            const props = {
                ...commonProps,
                field: {
                    ...ticketDropdownFieldDefinition,
                    object_type: objectType,
                },
                value: 'Test value',
            }

            render(
                <DndProvider backend={HTML5Backend}>
                    <DropdownInputRow {...props} />
                </DndProvider>,
            )
            const input = screen.getByTestId(props.id)
            expect(input.getAttribute('placeholder')).toEqual(
                OBJECT_TYPE_SETTINGS[objectType].PLACEHOLDERS.DROPDOWN.DEFAULT,
            )
        },
    )
})
