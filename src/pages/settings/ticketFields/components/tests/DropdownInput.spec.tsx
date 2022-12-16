import React from 'react'
import {render, fireEvent} from '@testing-library/react'
import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'
import uniqueId from 'lodash/uniqueId'

import DropdownInput from '../DropdownInput'

let idCount = 1
jest.mock('lodash/uniqueId')
const uniqueIdMock = uniqueId as jest.Mock
uniqueIdMock.mockImplementation((id: string) => `${id || ''}${idCount++}`)

describe('<DropdownInput/>', () => {
    beforeEach(() => {
        idCount = 1
    })

    it('should render correctly', () => {
        const props = {
            value: ['Option 1', 'Option 2', 'Option 3'],
            onChange: jest.fn(),
        }

        const {container} = render(
            <DndProvider backend={HTML5Backend}>
                <DropdownInput {...props} />
            </DndProvider>
        )
        expect(container).toMatchSnapshot()
    })

    it('should trigger an onChange event when changing a value', async () => {
        const props = {
            value: ['Option 1', 'Option 2', 'Option 3'],
            onChange: jest.fn(),
        }

        const {findByTestId} = render(
            <DndProvider backend={HTML5Backend}>
                <DropdownInput {...props} />
            </DndProvider>
        )

        const input = await findByTestId('dropdown-choice-2')
        fireEvent.change(input, {target: {value: 'My new value'}})

        expect(props.onChange).toHaveBeenCalledWith([
            'Option 1',
            'My new value',
            'Option 3',
        ])
    })

    it('should trigger an onChange event when removing a value', async () => {
        const props = {
            value: ['Option 1', 'Option 2', 'Option 3'],
            onChange: jest.fn(),
        }

        const {findByTestId} = render(
            <DndProvider backend={HTML5Backend}>
                <DropdownInput {...props} />
            </DndProvider>
        )

        const button = await findByTestId('dropdown-choice-2-remove')
        button.click()

        expect(props.onChange).toHaveBeenCalledWith(['Option 1', 'Option 3'])
    })

    it('should trigger an onChange event when adding a value', async () => {
        const props = {
            value: ['Option 1', 'Option 2', 'Option 3'],
            onChange: jest.fn(),
        }

        const {findByTestId} = render(
            <DndProvider backend={HTML5Backend}>
                <DropdownInput {...props} />
            </DndProvider>
        )

        const input = await findByTestId('dropdown-choice-4')
        fireEvent.change(input, {target: {value: 'My new value'}})

        expect(props.onChange).toHaveBeenCalledWith([
            'Option 1',
            'Option 2',
            'Option 3',
            'My new value',
        ])
    })

    it('should trigger an onChange event when re-ordering values with drag and drop', async () => {
        const props = {
            value: ['Option 1', 'Option 2', 'Option 3'],
            onChange: jest.fn(),
        }

        const {findByTestId} = render(
            <DndProvider backend={HTML5Backend}>
                <DropdownInput {...props} />
            </DndProvider>
        )

        const from = await findByTestId('dropdown-choice-3-handle')
        const dest = await findByTestId('dropdown-choice-1')

        fireEvent.dragStart(from)
        fireEvent.dragEnter(dest)
        fireEvent.dragOver(dest)
        fireEvent.drop(dest)

        expect(props.onChange).toHaveBeenCalledWith([
            'Option 1',
            'Option 3',
            'Option 2',
        ])
    })
})
