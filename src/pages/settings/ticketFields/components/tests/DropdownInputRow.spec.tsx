import React from 'react'
import {render, fireEvent} from '@testing-library/react'
import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'

import {
    aiAgentManagedTicketDropdownFieldDefinition,
    ticketDropdownFieldDefinition,
} from 'fixtures/customField'
import DropdownInputRow from '../DropdownInputRow'

const commonProps = {
    position: 0,
    id: 'dropdown-choice-123',
    onHover: jest.fn(),
    onDrop: jest.fn(),
    isLast: false,
}

describe('<DropdownInputRow/>', () => {
    it('should render correctly', async () => {
        const props = {
            field: ticketDropdownFieldDefinition,
            value: 'Test value',
            onChange: jest.fn(),
            onRemove: jest.fn(),
            ...commonProps,
        }

        const {container, findByDisplayValue, findByText, queryByText} = render(
            <DndProvider backend={HTML5Backend}>
                <DropdownInputRow {...props} />
            </DndProvider>
        )
        expect(container.firstChild).toMatchSnapshot()
        const input = await findByDisplayValue('Test value')
        expect(input.hasAttribute('disabled')).toEqual(false)

        const dragIndicator = await findByText('drag_indicator')
        expect(dragIndicator).not.toHaveClass('dragIndicatorDisabled')
        expect(queryByText('clear')).toBeInTheDocument()
    })

    it('should render correctly when validation fails', () => {
        const props = {
            field: ticketDropdownFieldDefinition,
            value: 'Test value',
            error: 'Unfortunately there is an error',
            onChange: jest.fn(),
            onRemove: jest.fn(),
            ...commonProps,
        }

        const {container} = render(
            <DndProvider backend={HTML5Backend}>
                <DropdownInputRow {...props} />
            </DndProvider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render disabled on AI Agent managed fields', async () => {
        const props = {
            field: aiAgentManagedTicketDropdownFieldDefinition,
            value: 'Test value',
            onChange: jest.fn(),
            onRemove: jest.fn(),
            ...commonProps,
        }

        const {findByDisplayValue, findByText, queryByText} = render(
            <DndProvider backend={HTML5Backend}>
                <DropdownInputRow {...props} />
            </DndProvider>
        )
        const input = await findByDisplayValue('Test value')
        expect(input.hasAttribute('disabled')).toEqual(true)

        const dragIndicator = await findByText('drag_indicator')
        expect(dragIndicator).toHaveClass('dragIndicatorDisabled')
        expect(queryByText('clear')).not.toBeInTheDocument()
    })

    it('should trigger an onChange event when changing the value', async () => {
        const props = {
            field: ticketDropdownFieldDefinition,
            value: 'Test value',
            onChange: jest.fn(),
            onRemove: jest.fn(),
            ...commonProps,
        }

        const {findByTestId} = render(
            <DndProvider backend={HTML5Backend}>
                <DropdownInputRow {...props} />
            </DndProvider>
        )

        const input = await findByTestId('dropdown-choice-123')
        fireEvent.change(input, {target: {value: 'My new value'}})

        expect(props.onChange).toHaveBeenCalledWith(0, 'My new value')
    })

    it('should trigger an onRemove event when the remove button is clicked', async () => {
        const props = {
            field: ticketDropdownFieldDefinition,
            value: 'Test value',
            onChange: jest.fn(),
            onRemove: jest.fn(),
            ...commonProps,
        }

        const {findByRole} = render(
            <DndProvider backend={HTML5Backend}>
                <DropdownInputRow {...props} />
            </DndProvider>
        )

        const removeButton = await findByRole('button')
        removeButton.click()

        expect(props.onRemove).toHaveBeenCalled()
    })
})
