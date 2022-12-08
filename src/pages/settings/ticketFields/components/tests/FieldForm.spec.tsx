import React from 'react'
import {render} from '@testing-library/react'

import {customField, customFieldInput} from 'fixtures/customField'

import FieldForm from '../FieldForm'

describe('<FieldForm/>', () => {
    it('should render correctly', () => {
        const props = {
            field: customFieldInput,
            onSubmit: jest.fn(),
            onCancel: jest.fn(),
        }

        const {container} = render(<FieldForm {...props} />)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should show archiving status and disable type change on edit', () => {
        const props = {
            field: customField,
            onSubmit: jest.fn(),
            onCancel: jest.fn(),
        }

        const {container} = render(<FieldForm {...props} />)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should disable the save button if the form is not valid', async () => {
        const props = {
            field: {...customFieldInput, name: ''},
            onSubmit: jest.fn(),
            onCancel: jest.fn(),
        }

        const {findByText} = render(<FieldForm {...props} />)

        const saveButton = await findByText(/Save Changes/)
        saveButton.click()

        expect(props.onSubmit).not.toHaveBeenCalled()
    })

    it('should call onSubmit if the form is valid and the save button is clicked', async () => {
        const props = {
            field: customFieldInput,
            onSubmit: jest.fn(),
            onCancel: jest.fn(),
        }

        const {findByText} = render(<FieldForm {...props} />)

        const saveButton = await findByText(/Save Changes/)
        saveButton.click()

        expect(props.onSubmit).toHaveBeenCalledTimes(1)
        expect(props.onSubmit).toHaveBeenCalledWith(customFieldInput)
    })

    it('should call onCancel if the cancel button is clicked', async () => {
        const props = {
            field: customFieldInput,
            onSubmit: jest.fn(),
            onCancel: jest.fn(),
        }

        const {findByText} = render(<FieldForm {...props} />)

        const cancelButton = await findByText(/Cancel/)
        cancelButton.click()

        expect(props.onCancel).toHaveBeenCalledTimes(1)
    })
})
