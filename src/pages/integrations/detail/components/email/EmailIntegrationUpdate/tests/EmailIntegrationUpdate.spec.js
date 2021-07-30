import React from 'react'
import {render, fireEvent} from '@testing-library/react'
import {fromJS} from 'immutable'

import {EmailIntegrationUpdateContainer} from '../EmailIntegrationUpdate'
import {
    GMAIL_INTEGRATION_TYPE,
    OUTLOOK_INTEGRATION_TYPE,
    EMAIL_INTEGRATION_TYPE,
} from '../../../../../../../constants/integration.ts'
import {isBoolean} from '../../../../../../common/components/infobar/utils.tsx'

const INTEGRATION_NAME = 'My Integration'
const commonProps = {
    loading: fromJS({integration: false}),
    actions: {
        deleteIntegration: jest.fn(),
    },
}

describe('<EmailIntegrationUpdateContainer />', () => {
    it.each([
        {
            selector: '#id-name',
            newValue: 'Some New Name',
            finalValue: INTEGRATION_NAME,
        },
        {
            selector: '#id-use_gmail_categories',
            newValue: true,
            finalValue: false,
        },
        {
            selector: '#id-enable_gmail_sending',
            newValue: false,
            finalValue: true,
        },
    ])(
        'should enable the submit button only if form values changed [gmail]',
        (selector) => {
            const props = {
                ...commonProps,
                ...{
                    integration: fromJS({
                        id: 1,
                        name: INTEGRATION_NAME,
                        type: GMAIL_INTEGRATION_TYPE,
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

            expect(
                getByText('Save changes').hasAttribute('disabled')
            ).toBeTruthy()

            if (isBoolean(selector.newValue)) {
                fireEvent.click(container.querySelector(selector.selector))
            } else {
                fireEvent.change(container.querySelector(selector.selector), {
                    target: {value: selector.newValue},
                })
            }

            expect(
                getByText('Save changes').hasAttribute('disabled')
            ).toBeFalsy()

            if (isBoolean(selector.newValue)) {
                fireEvent.click(container.querySelector(selector.selector))
            } else {
                fireEvent.change(container.querySelector(selector.selector), {
                    target: {value: selector.finalValue},
                })
            }

            expect(
                getByText('Save changes').hasAttribute('disabled')
            ).toBeTruthy()
        }
    )

    it.each([
        {
            selector: '#id-name',
            newValue: 'Some New Name',
            finalValue: INTEGRATION_NAME,
        },
    ])(
        'should enable the submit button only if form values changed [email]',
        (selector) => {
            const props = {
                ...commonProps,
                ...{
                    integration: fromJS({
                        id: 1,
                        name: INTEGRATION_NAME,
                        type: EMAIL_INTEGRATION_TYPE,
                        meta: {
                            address: 'myintegration@gorgias.io',
                            signature: {
                                text: '',
                                html: '<div><br></div>',
                            },
                        },
                    }),
                },
            }

            const {container, getByText} = render(
                <EmailIntegrationUpdateContainer {...props} />
            )

            expect(
                getByText('Save changes').hasAttribute('disabled')
            ).toBeTruthy()

            if (isBoolean(selector.newValue)) {
                fireEvent.click(container.querySelector(selector.selector))
            } else {
                fireEvent.change(container.querySelector(selector.selector), {
                    target: {value: selector.newValue},
                })
            }

            expect(
                getByText('Save changes').hasAttribute('disabled')
            ).toBeFalsy()

            if (isBoolean(selector.newValue)) {
                fireEvent.click(container.querySelector(selector.selector))
            } else {
                fireEvent.change(container.querySelector(selector.selector), {
                    target: {value: selector.finalValue},
                })
            }

            expect(
                getByText('Save changes').hasAttribute('disabled')
            ).toBeTruthy()
        }
    )

    it.each([
        {
            selector: '#id-name',
            newValue: 'Some New Name',
            finalValue: INTEGRATION_NAME,
        },
    ])(
        'should enable the submit button only if form values changed [outlook]',
        (field) => {
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

            expect(
                getByText('Save changes').hasAttribute('disabled')
            ).toBeTruthy()

            fireEvent.change(container.querySelector(field.selector), {
                target: {value: field.newValue},
            })
            expect(
                getByText('Save changes').hasAttribute('disabled')
            ).toBeFalsy()

            fireEvent.change(container.querySelector(field.selector), {
                target: {value: field.finalValue},
            })
            expect(
                getByText('Save changes').hasAttribute('disabled')
            ).toBeTruthy()
        }
    )
})
