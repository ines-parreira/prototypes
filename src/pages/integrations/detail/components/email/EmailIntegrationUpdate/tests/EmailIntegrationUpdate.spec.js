import React from 'react'
import {render, fireEvent} from '@testing-library/react'
import {fromJS} from 'immutable'

import {EmailIntegrationUpdateContainer} from '../EmailIntegrationUpdate'

const INTEGRATION_NAME = 'My Integration'
const commonProps = {
    integration: fromJS({
        id: 1,
        name: INTEGRATION_NAME,
        type: 'gmail',
        meta: {
            address: 'myintegration@gorgias.io',
            import_spam: false,
            signature: {
                text: '',
                html: '<div><br></div>',
            },
            use_gmail_categories: false,
            enable_gmail_sending: true,
        },
    }),
    loading: fromJS({integration: false}),
    actions: {
        deleteIntegration: jest.fn(),
    },
}

describe('<EmailIntegrationUpdateContainer />', () => {
    it('should enable the submit button only if form values changed', () => {
        const {container, getByText} = render(
            <EmailIntegrationUpdateContainer {...commonProps} />
        )

        expect(getByText('Save changes').hasAttribute('disabled')).toBeTruthy()

        fireEvent.change(container.querySelector('#id-name'), {
            target: {value: 'Some New Name'},
        })
        expect(getByText('Save changes').hasAttribute('disabled')).toBeFalsy()

        fireEvent.change(container.querySelector('#id-name'), {
            target: {value: INTEGRATION_NAME},
        })
        expect(getByText('Save changes').hasAttribute('disabled')).toBeTruthy()
    })
})
