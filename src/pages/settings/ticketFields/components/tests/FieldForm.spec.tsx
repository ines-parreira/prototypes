import React from 'react'
import {omit} from 'lodash'

import {fireEvent, render} from '@testing-library/react'
import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {createMemoryHistory} from 'history'
import {QueryClientProvider} from '@tanstack/react-query'

import {
    ticketInputFieldDefinition,
    customFieldInputDefinition,
    ticketFieldDefinitions,
} from 'fixtures/customField'
import {CustomField, CustomFieldInput} from 'models/customField/types'
import {DROPDOWN_NESTING_DELIMITER as delimiter} from 'models/customField/constants'
import {renderWithRouter} from 'utils/testing'

import {createTestQueryClient} from 'tests/reactQueryTestingUtils'
import FieldForm from '../FieldForm'

const mockStore = configureMockStore([thunk])()
const queryClient = createTestQueryClient()

describe('<FieldForm/>', () => {
    beforeEach(async () => {
        await queryClient.invalidateQueries()
    })

    it.each(ticketFieldDefinitions)(
        'should render correctly',
        (customField: CustomField) => {
            const props = {
                field: customField,
                onSubmit: jest.fn(),
                onClose: jest.fn(),
            }

            const {container} = render(
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore}>
                        <DndProvider backend={HTML5Backend}>
                            <FieldForm {...props} />
                        </DndProvider>
                    </Provider>
                </QueryClientProvider>
            )
            expect(container.firstChild).toMatchSnapshot()
        }
    )

    it('should show archiving status and disable type change on edit', () => {
        const props = {
            field: ticketInputFieldDefinition,
            onSubmit: jest.fn(),
            onClose: jest.fn(),
        }

        const {container} = render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore}>
                    <FieldForm {...props} />
                </Provider>{' '}
            </QueryClientProvider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should disable the save button if the form is not valid', async () => {
        const props = {
            field: {...customFieldInputDefinition, label: ''},
            onSubmit: jest.fn(),
            onClose: jest.fn(),
        }

        const {findByText} = render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore}>
                    <FieldForm {...props} />
                </Provider>{' '}
            </QueryClientProvider>
        )

        const saveButton = await findByText(/Save Changes/)
        saveButton.click()

        expect(props.onSubmit).not.toHaveBeenCalled()
    })

    it('should disable the save button if the form has duplicates', async () => {
        const props = {
            field: {
                ...customFieldInputDefinition,
                definition: {
                    data_type: 'text',
                    input_settings: {
                        input_type: 'dropdown',
                        choices: ['Option 1', 'Option 2', 'Option 1'],
                    },
                },
            } as CustomFieldInput,
            onSubmit: jest.fn(),
            onClose: jest.fn(),
        }

        const {findByText} = render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore}>
                    <DndProvider backend={HTML5Backend}>
                        <FieldForm {...props} />
                    </DndProvider>
                </Provider>{' '}
            </QueryClientProvider>
        )

        const saveButton = await findByText(/Save Changes/)
        saveButton.click()

        expect(props.onSubmit).not.toHaveBeenCalled()
    })

    it('should disable the save button if a dropdown choice has more than 5 levels of nesting', async () => {
        const props = {
            field: {
                ...customFieldInputDefinition,
                definition: {
                    data_type: 'text',
                    input_settings: {
                        input_type: 'dropdown',
                        choices: [
                            `A${delimiter}B${delimiter}C${delimiter}D${delimiter}E${delimiter}F`,
                        ],
                    },
                },
            } as CustomFieldInput,
            onSubmit: jest.fn(),
            onClose: jest.fn(),
        }

        const {findByText} = render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore}>
                    <DndProvider backend={HTML5Backend}>
                        <FieldForm {...props} />
                    </DndProvider>
                </Provider>{' '}
            </QueryClientProvider>
        )

        const saveButton = await findByText(/Save Changes/)
        saveButton.click()

        expect(props.onSubmit).not.toHaveBeenCalled()
    })

    it('should call onSubmit if the form is valid and the save button is clicked', async () => {
        const props = {
            field: customFieldInputDefinition,
            onSubmit: jest.fn(),
            onClose: jest.fn(),
        }

        const {findByText} = render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore}>
                    <FieldForm {...props} />
                </Provider>{' '}
            </QueryClientProvider>
        )

        const saveButton = await findByText(/Save Changes/)
        saveButton.click()

        expect(props.onSubmit).toHaveBeenCalledTimes(1)
        expect(props.onSubmit).toHaveBeenCalledWith(
            omit(customFieldInputDefinition, ['priority'])
        )
    })

    it('should call onClose if the cancel button is clicked', async () => {
        const props = {
            field: customFieldInputDefinition,
            onSubmit: jest.fn(),
            onClose: jest.fn(),
        }

        const {findByText} = render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore}>
                    <FieldForm {...props} />
                </Provider>{' '}
            </QueryClientProvider>
        )

        const cancelButton = await findByText(/Cancel/)
        cancelButton.click()

        expect(props.onClose).toHaveBeenCalledTimes(1)
    })

    it('should prompt for confirmation when closing the page with unsaved changes', async () => {
        const history = createMemoryHistory()
        const props = {
            field: customFieldInputDefinition,
            onSubmit: jest.fn(),
            onClose: jest.fn(),
        }

        const {findByLabelText, findByText} = renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore}>
                    <FieldForm {...props} />
                </Provider>{' '}
            </QueryClientProvider>
        )

        const nameInput = await findByLabelText(/Name/)
        fireEvent.change(nameInput, {target: {value: 'New name'}})

        history.push('/')

        await findByText(
            'Your changes to this page will be lost if you don’t save them.'
        )
    })
})
