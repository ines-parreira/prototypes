import React from 'react'
import {render, fireEvent} from '@testing-library/react'
import {fromJS} from 'immutable'

import {EmailIntegrationUpdateContainer} from '../EmailIntegrationUpdate'
import {
    GMAIL_INTEGRATION_TYPE,
    OUTLOOK_INTEGRATION_TYPE,
} from '../../../../../../../constants/integration.ts'

const INTEGRATION_NAME = 'My Integration'
const commonProps = {
    loading: fromJS({integration: false}),
    actions: {
        deleteIntegration: jest.fn(),
    },
}

describe('<EmailIntegrationUpdateContainer />', () => {
    it('should enable the submit button only if form values changed [gmail]', () => {
        const props = {
            ...commonProps,
            ...{
                integration: fromJS({
                    id: 1,
                    name: INTEGRATION_NAME,
                    type: GMAIL_INTEGRATION_TYPE,
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
            },
        }

        const {container, getByText} = render(
            <EmailIntegrationUpdateContainer {...props} />
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

    it('should enable the submit button only if form values changed [outlook]', () => {
        const props = {
            ...commonProps,
            ...{
                integration: fromJS({
                    id: 1,
                    name: INTEGRATION_NAME,
                    type: OUTLOOK_INTEGRATION_TYPE,
                    meta: {
                        address: 'myintegration@gorgias.io',
                        signature: {
                            text: '',
                            html: '<div><br></div>',
                        },
                        use_gmail_categories: false,
                        enable_gmail_sending: true,
                    },
                }),
            },
        }

        const {container, getByText} = render(
            <EmailIntegrationUpdateContainer {...props} />
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
