import React, {ComponentProps} from 'react'
import {render, fireEvent, RenderResult} from '@testing-library/react'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'

import {QueryClientProvider} from '@tanstack/react-query'
import {integrationsState} from 'fixtures/integrations'

import {IntegrationType} from 'models/integration/constants'

import {
    GMAIL_INTEGRATION_TYPE,
    OUTLOOK_INTEGRATION_TYPE,
    EMAIL_INTEGRATION_TYPE,
} from 'constants/integration'
import {isBoolean} from 'pages/common/components/infobar/utils'
import {
    OutboundVerificationStatusValue,
    OutboundVerificationType,
} from 'models/integration/types'

import {EmailIntegrationUpdateContainer} from 'pages/integrations/integration/components/email/EmailIntegrationUpdate/EmailIntegrationUpdate'
import getOutboundEmailProviderSettingKey from 'pages/integrations/integration/components/email/helpers'

import {mockQueryClient} from 'tests/reactQueryTestingUtils'

const queryClient = mockQueryClient()
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
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <EmailIntegrationUpdateContainer
                        {...commonProps}
                        {...props}
                    />
                </Provider>
            </QueryClientProvider>
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
                        outbound_verification_status: {
                            [OutboundVerificationType.Domain]:
                                OutboundVerificationStatusValue.Success,
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

            expect(saveButton).toHaveAttribute('aria-disabled', 'true')

            if (isBoolean(selector.newValue)) {
                fireEvent.click(selector.selector(helpers))
            } else {
                fireEvent.change(selector.selector(helpers), {
                    target: {value: selector.newValue},
                })
            }

            expect(saveButton).toHaveAttribute('aria-disabled', 'false')

            if (isBoolean(selector.newValue)) {
                fireEvent.click(selector.selector(helpers))
            } else {
                fireEvent.change(selector.selector(helpers), {
                    target: {value: selector.finalValue},
                })
            }

            expect(saveButton).toHaveAttribute('aria-disabled', 'true')
        }
    )
    it.each([IntegrationType.Gmail, IntegrationType.Outlook])(
        'should enable the submit button only if email deliverability setting changed [%s]',
        (integrationType) => {
            const props = {
                integration: fromJS({
                    id: 100,
                    name: INTEGRATION_NAME,
                    type: integrationType,
                    meta: {
                        address: 'test123@gorgias.com',
                        outbound_verification_status: {
                            [OutboundVerificationType.Domain]:
                                OutboundVerificationStatusValue.Success,
                        },
                        use_gmail_categories: true,
                        enable_gmail_threading: true,
                        [getOutboundEmailProviderSettingKey(
                            integrationType as
                                | IntegrationType.Gmail
                                | IntegrationType.Outlook
                        )]: true,
                    },
                }),
            }

            const helpers = renderWithStore(props)
            const {getByText, getAllByRole} = helpers
            const saveButton = getByText('Save changes')
            const deliverabilitySettingsRadioButtons = getAllByRole('radio')
            const useDefaultProviderRadioButton =
                deliverabilitySettingsRadioButtons[0]
            const useInternalProviderRadioButton =
                deliverabilitySettingsRadioButtons[1]
            expect(saveButton).toHaveAttribute('aria-disabled', 'true')
            fireEvent.click(useInternalProviderRadioButton)
            expect(saveButton).toHaveAttribute('aria-disabled', 'false')
            fireEvent.click(useDefaultProviderRadioButton)
            expect(saveButton).toHaveAttribute('aria-disabled', 'true')
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

            expect(saveButton).toHaveAttribute('aria-disabled', 'true')

            if (isBoolean(selector.newValue)) {
                fireEvent.click(selector.selector(helpers))
            } else {
                fireEvent.change(selector.selector(helpers), {
                    target: {value: selector.newValue},
                })
            }

            expect(saveButton).toHaveAttribute('aria-disabled', 'false')

            if (isBoolean(selector.newValue)) {
                fireEvent.click(selector.selector(helpers))
            } else {
                fireEvent.change(selector.selector(helpers), {
                    target: {value: selector.finalValue},
                })
            }

            expect(saveButton).toHaveAttribute('aria-disabled', 'true')
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

        expect(saveButton).toHaveAttribute('aria-disabled', 'true')

        if (isBoolean('Some New Name')) {
            fireEvent.click(displayNameInput)
        } else {
            fireEvent.change(displayNameInput, {
                target: {value: 'Some New Name'},
            })
        }

        expect(saveButton).toHaveAttribute('aria-disabled', 'false')

        if (isBoolean('Some New Name')) {
            fireEvent.click(displayNameInput)
        } else {
            fireEvent.change(displayNameInput, {
                target: {value: INTEGRATION_NAME},
            })
        }

        expect(saveButton).toHaveAttribute('aria-disabled', 'true')
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
                        enable_outlook_sending: true,
                    },
                }),
            }

            const helpers = renderWithStore(props)
            const {getByText} = helpers
            const saveButton = getByText('Save changes')

            expect(saveButton).toHaveAttribute('aria-disabled', 'true')

            fireEvent.change(selector.selector(helpers), {
                target: {value: selector.newValue},
            })
            expect(saveButton).not.toHaveAttribute('aria-disabled', 'true')

            fireEvent.change(selector.selector(helpers), {
                target: {value: selector.finalValue},
            })
            expect(saveButton).toHaveAttribute('aria-disabled', 'true')
        }
    )
})
