import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fireEvent, screen} from '@testing-library/react'
import uniqueId from 'lodash/uniqueId'

import {
    OBJECT_TYPES,
    DROPDOWN_NESTING_DELIMITER as delimiter,
} from 'custom-fields/constants'
import {ticketDropdownFieldDefinition} from 'fixtures/customField'
import {renderWithDnD} from 'utils/testing'

import DropdownInputRow from '../DropdownInputRow'
import DropdownInput from '../DropdownInput'

let idCount = 1
jest.mock('lodash/uniqueId')
const uniqueIdMock = uniqueId as jest.Mock
uniqueIdMock.mockImplementation((id: string) => `${id || ''}${idCount++}`)

jest.mock('../DropdownInputRow', () => ({
    __esModule: true,
    default: jest.fn(
        // eslint-disable-next-line
        jest.requireActual('../DropdownInputRow').DropdownInputRow
    ),
}))

const mockStore = configureMockStore([thunk])()

describe('<DropdownInput/>', () => {
    beforeEach(() => {
        idCount = 1
    })

    const defaultProps = {
        field: ticketDropdownFieldDefinition,
        value: ['Option 1', 'Option 2'],
        onChange: jest.fn(),
        objectType: OBJECT_TYPES.TICKET,
    }

    it('should render correctly', () => {
        const props = {
            ...defaultProps,
            value: [
                'Option 1',
                'Option 2',
                `Option 3${delimiter}Sub 2${delimiter}Sub 3${delimiter}Sub 4${delimiter}Sub 5`,
                0,
                1,
                123,
                true,
                false,
            ],
        }

        const {container} = renderWithDnD(
            <Provider store={mockStore}>
                <DropdownInput {...props} />
            </Provider>
        )
        expect(container).toMatchSnapshot()
        expect(screen.queryAllByText('drag_indicator')).toHaveLength(9)
    })

    it('should show an error for too much nesting', () => {
        const props = {
            ...defaultProps,
            value: [
                'Option 1',
                'Option 2',
                `Option 3${delimiter}Sub 2${delimiter}Sub 3${delimiter}Sub 4${delimiter}Sub 5${delimiter}Sub 6`,
            ],
        }

        renderWithDnD(
            <Provider store={mockStore}>
                <DropdownInput {...props} />
            </Provider>
        )
        expect(
            screen.getAllByText(/more than 5 levels of nesting/).length
        ).toBeGreaterThan(0)
    })

    it('should show an error for duplicate values', () => {
        const props = {
            ...defaultProps,
            value: ['Option 1', 'Option 2', 'Option 1', 'Option 3'],
        }

        renderWithDnD(
            <Provider store={mockStore}>
                <DropdownInput {...props} />
            </Provider>
        )
        expect(
            screen.getAllByText(/This value already exists/).length
        ).toBeGreaterThan(0)
    })

    it('should trigger an onChange event when changing a value', () => {
        const props = {
            ...defaultProps,
            value: ['Option 1', 'Option 2', 'Option 3'],
        }

        renderWithDnD(
            <Provider store={mockStore}>
                <DropdownInput {...props} />
            </Provider>
        )

        const input = screen.getByTestId('dropdown-choice-2')
        fireEvent.change(input, {target: {value: 'My new value'}})

        expect(props.onChange).toHaveBeenCalledWith([
            'Option 1',
            'My new value',
            'Option 3',
        ])
    })

    it('should trigger an onChange event when removing a value', () => {
        const props = {
            ...defaultProps,
            value: ['Option 1', 'Option 2', 'Option 3'],
        }

        renderWithDnD(
            <Provider store={mockStore}>
                <DropdownInput {...props} />
            </Provider>
        )

        const button = screen.getByTestId('dropdown-choice-2-remove')
        button.click()

        expect(props.onChange).toHaveBeenCalledWith(['Option 1', 'Option 3'])
    })

    it('should trigger an onChange event when adding a value', () => {
        const props = {
            ...defaultProps,
            value: ['Option 1', 'Option 2', 'Option 3'],
        }

        renderWithDnD(
            <Provider store={mockStore}>
                <DropdownInput {...props} />
            </Provider>
        )

        const input = screen.getByTestId('dropdown-choice-4')
        fireEvent.change(input, {target: {value: 'My new value'}})

        expect(props.onChange).toHaveBeenCalledWith([
            'Option 1',
            'Option 2',
            'Option 3',
            'My new value',
        ])
    })

    it('should trigger an onChange event when re-ordering values with drag and drop', () => {
        const props = {
            ...defaultProps,
            value: ['Option 1', 'Option 2', 'Option 3'],
        }

        renderWithDnD(
            <Provider store={mockStore}>
                <DropdownInput {...props} />
            </Provider>
        )

        const from = screen.getByTestId('dropdown-choice-3-handle')
        const dest = screen.getByTestId('dropdown-choice-1')

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

    describe('isDisabled', () => {
        it('should pass isDisabled to DropdownInputRow', () => {
            const props = {
                ...defaultProps,
                isDisabled: true,
            }

            renderWithDnD(
                <Provider store={mockStore}>
                    <DropdownInput {...props} />
                </Provider>
            )

            expect(DropdownInputRow).toHaveBeenCalledWith(
                expect.objectContaining({
                    isDisabled: true,
                }),
                {}
            )
        })

        it('should render without csv import when disabled', () => {
            const props = {
                ...defaultProps,
                isDisabled: true,
            }

            renderWithDnD(
                <Provider store={mockStore}>
                    <DropdownInput {...props} />
                </Provider>
            )
            expect(
                screen.queryByText('Import from CSV')
            ).not.toBeInTheDocument()
        })

        it('should render without instructions when disabled', () => {
            const props = {
                ...defaultProps,
                isDisabled: true,
            }

            renderWithDnD(
                <Provider store={mockStore}>
                    <DropdownInput {...props} />
                </Provider>
            )

            expect(
                screen.queryByText(/Max 2,000 values/)
            ).not.toBeInTheDocument()

            expect(screen.queryByText('See examples')).not.toBeInTheDocument()
        })
    })
})
