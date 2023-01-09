import React from 'react'
import {render} from '@testing-library/react'

import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {customField, customFieldInput} from 'fixtures/customField'
import FieldForm from '../FieldForm'

const mockStore = configureMockStore([thunk])()

describe('<FieldForm/>', () => {
    it('should render correctly', () => {
        const props = {
            field: customFieldInput,
            onSubmit: jest.fn(),
            onCancel: jest.fn(),
        }

        const {container} = render(
            <Provider store={mockStore}>
                <FieldForm {...props} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should show archiving status and disable type change on edit', () => {
        const props = {
            field: customField,
            onSubmit: jest.fn(),
            onCancel: jest.fn(),
        }

        const {container} = render(
            <Provider store={mockStore}>
                <FieldForm {...props} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should disable the save button if the form is not valid', async () => {
        const props = {
            field: {...customFieldInput, label: ''},
            onSubmit: jest.fn(),
            onCancel: jest.fn(),
        }

        const {findByText} = render(
            <Provider store={mockStore}>
                <FieldForm {...props} />
            </Provider>
        )

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

        const {findByText} = render(
            <Provider store={mockStore}>
                <FieldForm {...props} />
            </Provider>
        )

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

        const {findByText} = render(
            <Provider store={mockStore}>
                <FieldForm {...props} />
            </Provider>
        )

        const cancelButton = await findByText(/Cancel/)
        cancelButton.click()

        expect(props.onCancel).toHaveBeenCalledTimes(1)
    })
})
