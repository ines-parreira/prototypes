import React, {ComponentProps} from 'react'
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react'

import {assumeMock, getLastMockCall} from 'utils/testing'
import {LEAF_TYPES} from 'models/widget/constants'

import {FieldEditFormData} from '../../../types'
import CopyButton from '../../CopyButton'
import FieldEditForm from '../FieldEditForm'
import Field, {DELETE_BUTTON_TEXT, EDIT_BUTTON_TEXT} from '../Field'

const COPY_BUTTON_TEST_ID = 'copy-button'
jest.mock('../../CopyButton', () =>
    jest.fn(() => {
        return <span data-testid={COPY_BUTTON_TEST_ID}>copy button</span>
    })
)

const FIELD_EDIT_FORM_TEST_ID = 'field-edit-form'
jest.mock('../FieldEditForm', () =>
    jest.fn(() => {
        return (
            <span data-testid={FIELD_EDIT_FORM_TEST_ID}>field edit form</span>
        )
    })
)
const FieldEditFormMock = assumeMock(FieldEditForm)

describe('Field', () => {
    const defaultProps: ComponentProps<typeof Field> = {
        title: 'Tribute',
        value: '20-1_RPZ_MAGLE',
        type: LEAF_TYPES.TEXT,
        availableTypes: [
            {value: LEAF_TYPES.TEXT, label: 'Text'},
            {value: LEAF_TYPES.BOOLEAN, label: 'Boolean'},
        ],
        copyButton: <CopyButton value="" onCopyMessage="" />,
        isEditionMode: true,
        onEditionStart: jest.fn(),
        onEditionStop: jest.fn(),
        onSubmit: jest.fn(),
        onDelete: jest.fn(),
    }

    it('should render title and value', () => {
        render(<Field {...defaultProps} />)

        expect(screen.getByText(`${defaultProps.title}:`))
        expect(screen.getByText(defaultProps.value as string))
    })

    it('should not add `overflow` class to value when `valueCanOverflow` is not true', () => {
        render(<Field {...defaultProps} />)

        expect(
            screen.getByText(defaultProps.value as string).classList
        ).not.toContain('overflow')
    })

    it('should add `overflow` class to value when `valueCanOverflow` is true', () => {
        render(<Field {...defaultProps} valueCanOverflow />)

        expect(
            screen.getByText(defaultProps.value as string).classList
        ).toContain('overflow')
    })

    it('should render copy button when not displaying edition actions', () => {
        render(<Field {...defaultProps} isEditionMode={false} />)

        expect(screen.queryByText(EDIT_BUTTON_TEXT)).toBeNull()
        expect(screen.queryByText(DELETE_BUTTON_TEXT)).toBeNull()
        expect(screen.getByTestId(COPY_BUTTON_TEST_ID))
    })

    it('should not render the copy button when displaying edition actions', () => {
        render(<Field {...defaultProps} />)

        expect(screen.getByText(EDIT_BUTTON_TEXT))
        expect(screen.getByText(DELETE_BUTTON_TEXT))
        expect(screen.queryByTestId(COPY_BUTTON_TEST_ID)).toBeNull()
    })

    it('should call `onEditionStart` and show tooltip edit on edit button click', async () => {
        render(<Field {...defaultProps} />)

        fireEvent.click(screen.getByText(EDIT_BUTTON_TEXT))

        await waitFor(() =>
            expect(
                screen.queryByTestId(FIELD_EDIT_FORM_TEST_ID)
            ).toBeInTheDocument()
        )

        expect(defaultProps.onEditionStart).toHaveBeenCalledTimes(1)
    })

    it('should call `onDelete` on delete button click', () => {
        const {getByText} = render(<Field {...defaultProps} />)

        fireEvent.click(getByText(DELETE_BUTTON_TEXT))

        expect(defaultProps.onDelete).toHaveBeenCalledTimes(1)
    })

    it('should pass initialData, availableTypes and hiddenFields to the edition form', () => {
        const expectedInitialData: FieldEditFormData = {
            title: defaultProps.title,
            type: defaultProps.type,
        }

        const {getByText} = render(
            <Field {...defaultProps} editionHiddenFields={['title']} />
        )

        fireEvent.click(getByText(EDIT_BUTTON_TEXT))

        expect(FieldEditFormMock).toHaveBeenCalledWith(
            expect.objectContaining({
                initialData: expectedInitialData,
                availableTypes: defaultProps.availableTypes,
                hiddenFields: ['title'],
            }),
            expect.anything()
        )
    })

    it('should hide edit form and call `onEditionStop` when calling `onCancel` from `FieldEditForm`', async () => {
        render(<Field {...defaultProps} />)

        fireEvent.click(screen.getByText(EDIT_BUTTON_TEXT))

        act(() => getLastMockCall(FieldEditFormMock)[0].onCancel())

        await waitFor(() =>
            expect(
                screen.queryByTestId(FIELD_EDIT_FORM_TEST_ID)
            ).not.toBeInTheDocument()
        )
        expect(defaultProps.onEditionStop).toHaveBeenCalledTimes(1)
    })

    it('should hide edit form and call `onEditionStop` when clicking outside of the popover', async () => {
        const {container} = render(<Field {...defaultProps} />)

        fireEvent.click(screen.getByText(EDIT_BUTTON_TEXT))

        await waitFor(() =>
            expect(
                screen.queryByTestId(FIELD_EDIT_FORM_TEST_ID)
            ).toBeInTheDocument()
        )

        fireEvent.click(container)

        await waitFor(() =>
            expect(
                screen.queryByTestId(FIELD_EDIT_FORM_TEST_ID)
            ).not.toBeInTheDocument()
        )
        expect(defaultProps.onEditionStop).toHaveBeenCalledTimes(1)
    })

    it('should hide edit form, call `onSubmit` and `onEditionStop` when calling onSubmit from `FieldEditForm`', async () => {
        const someFormData = {
            title: 'new title',
            type: LEAF_TYPES.BOOLEAN,
        }

        render(<Field {...defaultProps} />)

        fireEvent.click(screen.getByText(EDIT_BUTTON_TEXT))

        act(() => getLastMockCall(FieldEditFormMock)[0].onSubmit(someFormData))

        await waitFor(() =>
            expect(
                screen.queryByTestId(FIELD_EDIT_FORM_TEST_ID)
            ).not.toBeInTheDocument()
        )

        expect(defaultProps.onSubmit).toHaveBeenNthCalledWith(1, someFormData)
        expect(defaultProps.onEditionStop).toHaveBeenCalledTimes(1)
        expect(
            (defaultProps.onSubmit as jest.Mock).mock.invocationCallOrder[0]
        ).toBeLessThan(
            (defaultProps.onEditionStop as jest.Mock).mock
                .invocationCallOrder[0]
        )
    })
})
