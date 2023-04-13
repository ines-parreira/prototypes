import React from 'react'
import {fireEvent} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import uniqueId from 'lodash/uniqueId'
import {renderWithDnD} from 'utils/testing'

import DropdownInput from '../DropdownInput'

let idCount = 1
jest.mock('lodash/uniqueId')
const uniqueIdMock = uniqueId as jest.Mock
uniqueIdMock.mockImplementation((id: string) => `${id || ''}${idCount++}`)

const mockStore = configureMockStore([thunk])()

describe('<DropdownInput/>', () => {
    beforeEach(() => {
        idCount = 1
    })

    it('should render correctly', () => {
        const props = {
            value: ['Option 1', 'Option 2', 'Option 3'],
            onChange: jest.fn(),
        }

        const {container} = renderWithDnD(
            <Provider store={mockStore}>
                <DropdownInput {...props} />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })

    it('should show an error for duplicate values', () => {
        const props = {
            value: ['Option 1', 'Option 2', 'Option 1', 'Option 3'],
            onChange: jest.fn(),
        }

        const {container} = renderWithDnD(
            <Provider store={mockStore}>
                <DropdownInput {...props} />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })

    it('should trigger an onChange event when changing a value', async () => {
        const props = {
            value: ['Option 1', 'Option 2', 'Option 3'],
            onChange: jest.fn(),
        }

        const {findByTestId} = renderWithDnD(
            <Provider store={mockStore}>
                <DropdownInput {...props} />
            </Provider>
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

        const {findByTestId} = renderWithDnD(
            <Provider store={mockStore}>
                <DropdownInput {...props} />
            </Provider>
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

        const {findByTestId} = renderWithDnD(
            <Provider store={mockStore}>
                <DropdownInput {...props} />
            </Provider>
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

        const {findByTestId} = renderWithDnD(
            <Provider store={mockStore}>
                <DropdownInput {...props} />
            </Provider>
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
