import React, {ComponentProps} from 'react'
import {render, fireEvent, RenderResult} from '@testing-library/react'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'

import {integrationsState} from 'fixtures/integrations'

import {EmailProvider} from 'models/integration/constants'

import {
    GMAIL_INTEGRATION_TYPE,
    OUTLOOK_INTEGRATION_TYPE,
    EMAIL_INTEGRATION_TYPE,
} from 'constants/integration'
import {isBoolean} from 'pages/common/components/infobar/utils'
import * as helpers from '../../helpers'

import {EmailIntegrationUpdateContainer} from '../EmailIntegrationUpdate'

const isOutboundDomainVerifiedSpy = jest.spyOn(
    helpers,
    'isOutboundDomainVerified'
)

const INTEGRATION_NAME = 'My Integration'
const commonProps: ComponentProps<typeof EmailIntegrationUpdateContainer> = {
    loading: fromJS({integration: false}),
    domain: 'test',
    forwardingEmailAddress: '',
    gmailRedirectUri: '',
    integration: fromJS({}),
    importEmails: jest.fn(),
    updateOrCreateIntegration: jest.fn(),
    deleteIntegration: jest.fn(),
}

describe('<EmailIntegrationUpdateContainer />', () => {
    const mockStore = configureMockStore([thunk])
    let store = mockStore({integrations: fromJS(integrationsState)})

    beforeEach(() => {
        store = mockStore({integrations: fromJS(integrationsState)})
    })

    const renderWithStore = (props = {}) =>
        render(
            <Provider store={store}>
                <EmailIntegrationUpdateContainer {...commonProps} {...props} />
            </Provider>
        )

    it.each([
        {
            selector: ({getByRole}: RenderResult) =>
                getByRole('textbox', {
                    name: /display name required/i,
                }),
            newValue: 'Some New Name',
            finalValue: INTEGRATION_NAME,
        },
        {
            selector: ({container}: RenderResult) =>
                container.querySelector('#use_gmail_categories')!,
            newValue: true,
            finalValue: false,
        },
        {
            selector: ({container}: RenderResult) =>
                container.querySelector('#enable_gmail_sending')!,
            newValue: false,
            finalValue: true,
        },
    ])(
        'should enable the submit button only if form values changed [gmail]',
        (selector) => {
            const props = {
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
                        enable_gmail_threading: true,
                    },
                }),
            }

            const helpers = renderWithStore(props)
            const {getByText} = helpers
            const saveButton = getByText('Save changes')

            expect(saveButton).toBeDisabled()

            if (isBoolean(selector.newValue)) {
                fireEvent.click(selector.selector(helpers))
            } else {
                fireEvent.change(selector.selector(helpers), {
                    target: {value: selector.newValue},
                })
            }

            expect(saveButton.hasAttribute('disabled')).toBeFalsy()

            if (isBoolean(selector.newValue)) {
                fireEvent.click(selector.selector(helpers))
            } else {
                fireEvent.change(selector.selector(helpers), {
                    target: {value: selector.finalValue},
                })
            }

            expect(saveButton.hasAttribute('disabled')).toBeTruthy()
        }
    )

    it.each([
        {
            selector: ({getByRole}: RenderResult) =>
                getByRole('textbox', {
                    name: /display name required/i,
                }),
            newValue: 'Some New Name',
            finalValue: INTEGRATION_NAME,
        },
    ])(
        'should enable the submit button only if form values changed [email]',
        (selector) => {
            const props = {
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
            }

            const helpers = renderWithStore(props)
            const {getByText} = helpers
            const saveButton = getByText('Save changes')

            expect(saveButton.hasAttribute('disabled')).toBeTruthy()

            if (isBoolean(selector.newValue)) {
                fireEvent.click(selector.selector(helpers))
            } else {
                fireEvent.change(selector.selector(helpers), {
                    target: {value: selector.newValue},
                })
            }

            expect(saveButton.hasAttribute('disabled')).toBeFalsy()

            if (isBoolean(selector.newValue)) {
                fireEvent.click(selector.selector(helpers))
            } else {
                fireEvent.change(selector.selector(helpers), {
                    target: {value: selector.finalValue},
                })
            }

            expect(saveButton.hasAttribute('disabled')).toBeTruthy()
        }
    )

    it('should enable the submit button if form values change - integration has no signature [email]', () => {
        const props = {
            integration: fromJS({
                id: 1,
                name: INTEGRATION_NAME,
                type: EMAIL_INTEGRATION_TYPE,
                meta: {
                    address: 'myintegration@gorgias.io',
                },
            }),
        }

        const helpers = renderWithStore(props)
        const {getByText, getByRole} = helpers
        const displayNameInput = getByRole('textbox', {
            name: /display name required/i,
        })
        const saveButton = getByText('Save changes')

        expect(saveButton.hasAttribute('disabled')).toBeTruthy()

        if (isBoolean('Some New Name')) {
            fireEvent.click(displayNameInput)
        } else {
            fireEvent.change(displayNameInput, {
                target: {value: 'Some New Name'},
            })
        }

        expect(saveButton.hasAttribute('disabled')).toBeFalsy()

        if (isBoolean('Some New Name')) {
            fireEvent.click(displayNameInput)
        } else {
            fireEvent.change(displayNameInput, {
                target: {value: INTEGRATION_NAME},
            })
        }

        expect(saveButton.hasAttribute('disabled')).toBeTruthy()
    })

    it.each([
        {
            selector: ({getByRole}: RenderResult) =>
                getByRole('textbox', {
                    name: /display name required/i,
                }),
            newValue: 'Some New Name',
            finalValue: INTEGRATION_NAME,
        },
    ])(
        'should enable the submit button only if form values changed [outlook]',
        (selector) => {
            const props = {
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
            }

            const helpers = renderWithStore(props)
            const {getByText} = helpers
            const saveButton = getByText('Save changes')

            expect(saveButton).toBeDisabled()

            fireEvent.change(selector.selector(helpers), {
                target: {value: selector.newValue},
            })
            expect(saveButton).not.toBeDisabled()

            fireEvent.change(selector.selector(helpers), {
                target: {value: selector.finalValue},
            })
            expect(saveButton).toBeDisabled()
        }
    )

    it('disables gmail sending checkbox when domain is not verified [sendgrid]', () => {
        isOutboundDomainVerifiedSpy.mockReturnValue(false)

        const props = {
            integration: fromJS({
                id: 1,
                name: INTEGRATION_NAME,
                type: GMAIL_INTEGRATION_TYPE,
                meta: {
                    address: 'myintegration@gorgias.io',
                    use_gmail_categories: false,
                    enable_gmail_sending: true,
                    enable_gmail_threading: true,
                    provider: EmailProvider.Sendgrid,
                },
            }),
        }

        const {getAllByRole} = renderWithStore(props)
        const gmailSendingToggle = getAllByRole('switch')[1]

        expect(gmailSendingToggle).toBeChecked()
        fireEvent.click(gmailSendingToggle)
        expect(gmailSendingToggle).toBeChecked()
    })

    it('does not disable gmail sending checkbox when domain is verified [sendgrid]', () => {
        isOutboundDomainVerifiedSpy.mockReturnValue(true)

        const props = {
            integration: fromJS({
                id: 1,
                name: INTEGRATION_NAME,
                type: GMAIL_INTEGRATION_TYPE,
                meta: {
                    address: 'myintegration@gorgias.io',
                    use_gmail_categories: false,
                    enable_gmail_sending: true,
                    enable_gmail_threading: true,
                    provider: EmailProvider.Sendgrid,
                },
            }),
        }

        const {getAllByRole} = renderWithStore(props)
        const gmailSendingToggle = getAllByRole('switch')[1]

        expect(gmailSendingToggle).toBeChecked()
        fireEvent.click(gmailSendingToggle)
        expect(gmailSendingToggle).not.toBeChecked()
    })
})
