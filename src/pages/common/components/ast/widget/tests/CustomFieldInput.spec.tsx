import {render} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {
    ticketBooleanFieldDefinition,
    ticketDropdownFieldDefinition,
    ticketInputFieldDefinition,
    ticketNumberFieldDefinition,
} from 'fixtures/customField'

import CustomFieldInput from '../CustomFieldInput'

const store = configureMockStore()()

describe('<CustomFieldInput/>', () => {
    it('should render a text input', () => {
        const {container} = render(
            <CustomFieldInput
                customField={ticketInputFieldDefinition}
                onChange={jest.fn()}
            />
        )
        expect(container).toMatchSnapshot()
    })

    it('should render a number input', () => {
        const {container} = render(
            <CustomFieldInput
                customField={ticketNumberFieldDefinition}
                onChange={jest.fn()}
            />
        )
        expect(container).toMatchSnapshot()
    })

    it('should render a boolean dropdown', () => {
        const {container} = render(
            <Provider store={store}>
                <CustomFieldInput
                    customField={ticketBooleanFieldDefinition}
                    onChange={jest.fn()}
                />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })

    it('should render a text dropdown', () => {
        const {container} = render(
            <Provider store={store}>
                <CustomFieldInput
                    customField={ticketDropdownFieldDefinition}
                    onChange={jest.fn()}
                />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })
})
