import React, {ReactNode} from 'react'
import {omit} from 'lodash'
import {
    createEvent,
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {QueryClientProvider} from '@tanstack/react-query'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import {
    ticketInputFieldDefinition,
    customFieldInputDefinition,
    ticketFieldDefinitions,
    managedTicketInputFieldDefinition,
    aiManagedTicketInputFieldDefinition,
    archivedTicketInputFieldDefinition,
} from 'fixtures/customField'
import {CustomField, CustomFieldInput} from 'models/customField/types'
import {DROPDOWN_NESTING_DELIMITER as delimiter} from 'models/customField/constants'
import {assumeMock, renderWithRouter} from 'utils/testing'

import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {useUpdatePartialCustomField} from 'models/customField/queries'
import FieldForm from 'pages/settings/ticketFields/components/FieldForm'

const mockStore = configureMockStore([thunk])()
const queryClient = mockQueryClient()

jest.mock('models/customField/queries')
const useUpdatePartialCustomFieldMock = assumeMock(useUpdatePartialCustomField)
const updateMutateMock = jest.fn()

jest.mock(
    'pages/common/components/modal/Modal',
    () =>
        ({children}: {children: ReactNode}) => {
            return <div>{children}</div>
        }
)

jest.mock(
    'pages/common/components/modal/ModalBody',
    () =>
        ({children}: {children: ReactNode}) => {
            return <div>{children}</div>
        }
)

jest.mock(
    'pages/common/components/modal/ModalHeader',
    () =>
        ({children}: {children: ReactNode}) => {
            return <div>{children}</div>
        }
)

jest.mock('pages/common/components/UnsavedChangesPrompt', () =>
    jest.fn(() => null)
)
const mockedUnsavedChangesPrompt = assumeMock(UnsavedChangesPrompt)

describe('<FieldForm/>', () => {
    beforeEach(() => {
        useUpdatePartialCustomFieldMock.mockImplementation(() => {
            return {
                mutate: updateMutateMock,
                mutateAsync: updateMutateMock,
            } as unknown as ReturnType<typeof useUpdatePartialCustomField>
        })
        jest.useFakeTimers().setSystemTime(42)
        queryClient.clear()
    })

    it.each([
        ...ticketFieldDefinitions,
        managedTicketInputFieldDefinition,
        aiManagedTicketInputFieldDefinition,
    ])('should render correctly', (customField: CustomField) => {
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
    })

    it('should show archiving status and disable type change on edit', () => {
        const props = {
            field: ticketInputFieldDefinition,
            onSubmit: jest.fn(),
            onClose: jest.fn(),
        }

        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore}>
                    <FieldForm {...props} />
                </Provider>{' '}
            </QueryClientProvider>
        )
        expect(screen.getByText('ACTIVE'))
        expect(screen.getByText(/Field type can’t be changed/))
    })

    it('should show a tooltip on hover save after doing a change', async () => {
        const props = {
            field: ticketInputFieldDefinition,
            onSubmit: jest.fn(),
            onClose: jest.fn(),
        }

        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore}>
                    <FieldForm {...props} />
                </Provider>
            </QueryClientProvider>
        )

        await userEvent.type(screen.getByLabelText(/Placeholder/), 'a')
        userEvent.hover(screen.getByText(/Save changes/))
        await waitFor(() => {
            expect(screen.getByText(/The values you have changed/))
        })
    })

    it('should show a tooltip on hover save after doing a change on description', async () => {
        const props = {
            field: ticketInputFieldDefinition,
            onSubmit: jest.fn(),
            onClose: jest.fn(),
        }

        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore}>
                    <FieldForm {...props} />
                </Provider>
            </QueryClientProvider>
        )

        await userEvent.type(screen.getByLabelText(/Description/), 'a')
        userEvent.hover(screen.getByText(/Save changes/))
        await waitFor(() => {
            expect(screen.getByText(/The values you have changed/))
        })
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

        const saveButton = await findByText(/Save changes/)
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

        const saveButton = await findByText(/Save changes/)
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

        const saveButton = await findByText(/Save changes/)
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

        const saveButton = await findByText(/Save changes/)
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

    it('should change checkbox required value of is clicked', async () => {
        const props = {
            field: customFieldInputDefinition,
            onSubmit: jest.fn(),
            onClose: jest.fn(),
        }

        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore}>
                    <FieldForm {...props} />
                </Provider>{' '}
            </QueryClientProvider>
        )

        await userEvent.type(
            screen.getByLabelText(/Required to close ticket/),
            'checkbox'
        )
        userEvent.click(screen.getByLabelText(/Required to close ticket/))
        await waitFor(() => {
            expect(screen.getByLabelText(/Required to close ticket/))
                .toBeChecked
        })
    })

    it('should prompt for confirmation when closing the page with unsaved changes', async () => {
        const props = {
            field: customFieldInputDefinition,
            onSubmit: jest.fn(),
            onClose: jest.fn(),
        }

        const {findByLabelText} = renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore}>
                    <FieldForm {...props} />
                </Provider>{' '}
            </QueryClientProvider>
        )

        const nameInput = await findByLabelText(/Name/)
        fireEvent.change(nameInput, {target: {value: 'New name'}})
        expect(mockedUnsavedChangesPrompt).toHaveBeenCalledTimes(1)
    })

    it('should not trigger a submit when pressing enter in a field', async () => {
        const props = {
            field: customFieldInputDefinition,
            onSubmit: jest.fn(),
            onClose: jest.fn(),
        }

        const {findByLabelText} = renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore}>
                    <FieldForm {...props} />
                </Provider>{' '}
            </QueryClientProvider>
        )

        const nameInput = await findByLabelText(/Name/)
        nameInput.focus()
        fireEvent.keyDown(nameInput, {key: 'Enter'})

        expect(props.onSubmit).not.toHaveBeenCalled()
    })

    it('should prevent default on form submit', async () => {
        const props = {
            field: customFieldInputDefinition,
            onSubmit: jest.fn(),
            onClose: jest.fn(),
        }

        const {findByLabelText} = renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore}>
                    <FieldForm {...props} />
                </Provider>{' '}
            </QueryClientProvider>
        )

        const nameInput = await findByLabelText(/Name/)
        const form = nameInput.closest('form')!
        const submitEvent = createEvent.submit(form)
        fireEvent(form, submitEvent)

        expect(submitEvent.defaultPrevented).toBe(true)
    })

    it('should archive correctly', async () => {
        const props = {
            field: ticketInputFieldDefinition,
            onSubmit: jest.fn(),
            onClose: jest.fn(),
        }

        const {findByText, findAllByText} = render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore}>
                    <FieldForm {...props} />
                </Provider>{' '}
            </QueryClientProvider>
        )

        expect(screen.getByText('Archive field'))
        expect(screen.queryByText('Unarchive field')).not.toBeInTheDocument()

        const archiveModalButton = await findByText('Archive field')
        archiveModalButton.click()
        expect(screen.getByText('Are you sure you want to archive this field?')) // ensure modal shows up

        const cancelButton = await findAllByText('Cancel')
        cancelButton[1].click()
        await waitFor(() => {
            expect(
                screen.queryByText(
                    'Are you sure you want to archive this field?'
                )
            ).not.toBeInTheDocument()
        })

        archiveModalButton.click()
        const archiveButton = await findByText('Archive')
        archiveButton.click()
        await waitFor(() => {
            expect(
                screen.queryByText(
                    'Are you sure you want to archive this field?'
                )
            ).not.toBeInTheDocument()
        })

        const expectedData = [
            ticketInputFieldDefinition.id,
            {deactivated_datetime: '1970-01-01T00:00:00.142Z'},
        ]

        expect(updateMutateMock).toHaveBeenNthCalledWith(1, expectedData)
    })

    it('should unarchived correctly', async () => {
        const props = {
            field: archivedTicketInputFieldDefinition,
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
        expect(screen.getByText('ARCHIVED'))
        expect(screen.queryByLabelText('Archive field')).not.toBeInTheDocument()
        expect(screen.getByText('Unarchive field'))

        const unarchiveModalButton = await findByText('Unarchive field')
        unarchiveModalButton.click()

        const expectedData = [
            archivedTicketInputFieldDefinition.id,
            {deactivated_datetime: null},
        ]

        expect(updateMutateMock).toHaveBeenNthCalledWith(1, expectedData)
    })
})
