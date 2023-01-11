import React from 'react'
import {render, fireEvent} from '@testing-library/react'
import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'

import DropdownInputRow from '../DropdownInputRow'

const commonProps = {
    position: 0,
    id: 'dropdown-choice-123',
    onHover: jest.fn(),
    onDrop: jest.fn(),
    isLast: false,
}

describe('<DropdownInputRow/>', () => {
    it('should render correctly', () => {
        const props = {
            value: 'Test value',
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

    it('should render correctly when validation fails', () => {
        const props = {
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

    it('should trigger an onChange event when changing the value', async () => {
        const props = {
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
