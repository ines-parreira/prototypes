import React, {ComponentProps} from 'react'
import {act, fireEvent, render, waitFor} from '@testing-library/react'

import {assumeMock, getLastMockCall} from 'utils/testing'

import WrapperEditActions, {FormData} from '../WrapperEditActions'
import WrapperEditForm from '../WrapperEditForm'

const MOCK_EDIT_FORM_ID = 'wrapper-edit-form'
jest.mock('../WrapperEditForm', () =>
    jest.fn(() => <div data-testid={MOCK_EDIT_FORM_ID} />)
)
const WrapperEditFormMock = assumeMock(WrapperEditForm)

describe('WrapperEditActions', () => {
    const defaultData: FormData = {
        color: '#ffffff',
    }
    const defaultProps: ComponentProps<typeof WrapperEditActions> = {
        deleteButtonText: 'Delete',
        onDelete: jest.fn(),
        editButtonText: 'Edit',
        onEditStart: jest.fn(),
        onEditCancel: jest.fn(),
        onEditSubmit: jest.fn(),
        initialData: defaultData,
    }

    it('should render delete button', () => {
        const {queryByText} = render(<WrapperEditActions {...defaultProps} />)

        expect(queryByText(defaultProps.deleteButtonText)).toBeInTheDocument()
    })

    it('should call onDelete callback on delete button click', () => {
        const {getByText} = render(<WrapperEditActions {...defaultProps} />)

        fireEvent.click(getByText(defaultProps.deleteButtonText))

        expect(defaultProps.onDelete).toHaveBeenCalledWith()
    })

    it('should not render the edit button when no initial data is passed', () => {
        const {queryByText} = render(
            <WrapperEditActions {...defaultProps} initialData={undefined} />
        )

        expect(queryByText(defaultProps.editButtonText)).not.toBeInTheDocument()
    })

    it('should render edit button', () => {
        const {queryByText} = render(<WrapperEditActions {...defaultProps} />)

        expect(queryByText(defaultProps.editButtonText)).toBeInTheDocument()
    })

    it('should call onEditStart and show edit form on edit button click', () => {
        const {getByText, queryByTestId} = render(
            <WrapperEditActions {...defaultProps} />
        )

        fireEvent.click(getByText(defaultProps.editButtonText))

        expect(defaultProps.onEditStart).toHaveBeenCalledWith()
        expect(queryByTestId(MOCK_EDIT_FORM_ID)).toBeInTheDocument()
    })

    it('should hide edit form edit and call onEditCancel on second button click', async () => {
        const {getByText, queryByTestId} = render(
            <WrapperEditActions {...defaultProps} />
        )

        fireEvent.click(getByText(defaultProps.editButtonText))
        fireEvent.click(getByText(defaultProps.editButtonText))

        await waitFor(() =>
            expect(queryByTestId(MOCK_EDIT_FORM_ID)).not.toBeInTheDocument()
        )
        expect(defaultProps.onEditCancel).toHaveBeenLastCalledWith()
    })

    it('should hide edit form edit and call onEditCancel on edit form cancel', async () => {
        const {getByText, queryByTestId} = render(
            <WrapperEditActions {...defaultProps} />
        )

        fireEvent.click(getByText(defaultProps.editButtonText))
        act(() => getLastMockCall(WrapperEditFormMock)[0].onCancel())

        await waitFor(() =>
            expect(queryByTestId(MOCK_EDIT_FORM_ID)).not.toBeInTheDocument()
        )
        expect(defaultProps.onEditCancel).toHaveBeenLastCalledWith()
    })

    it('should hide edit form edit and call onEditSubmit on edit form submit', async () => {
        const expectedData: FormData = {
            color: '#ff0000',
        }
        const {getByText, queryByTestId} = render(
            <WrapperEditActions {...defaultProps} />
        )

        fireEvent.click(getByText(defaultProps.editButtonText))
        act(() =>
            getLastMockCall(WrapperEditFormMock)[0].onSubmit(expectedData)
        )

        await waitFor(() =>
            expect(queryByTestId(MOCK_EDIT_FORM_ID)).not.toBeInTheDocument()
        )
        expect(defaultProps.onEditSubmit).toHaveBeenLastCalledWith(expectedData)
    })
})
