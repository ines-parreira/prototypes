import React from 'react'
import {render, fireEvent} from '@testing-library/react'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'

import * as helpers from '../../helpers'

import {EmailIntegrationUpdateContainer} from '../EmailIntegrationUpdate.tsx'

import {getLDClient} from 'utils/launchDarkly'
import {FeatureFlagKey} from 'config/featureFlags'

import {EmailProvider} from 'models/integration/constants'

import {
    GMAIL_INTEGRATION_TYPE,
    OUTLOOK_INTEGRATION_TYPE,
    EMAIL_INTEGRATION_TYPE,
} from 'constants/integration.ts'
import {isBoolean} from 'pages/common/components/infobar/utils.tsx'

const isOutboundDomainVerifiedSpy = jest.spyOn(
    helpers,
    'isOutboundDomainVerified'
)

const INTEGRATION_NAME = 'My Integration'
const commonProps = {
    loading: fromJS({integration: false}),
    actions: {
        deleteIntegration: jest.fn(),
    },
}

jest.mock('utils/launchDarkly')
const allFlagsMock = getLDClient().allFlags
allFlagsMock.mockReturnValue({[FeatureFlagKey.ChatVideoSharingExtra]: true})

describe('<EmailIntegrationUpdateContainer />', () => {
    const mockStore = configureMockStore([thunk])
    let store = mockStore({})

    beforeEach(() => {
        store = mockStore({})
    })

    const renderWithStore = (props = {}) =>
        render(
            <Provider store={store}>
                <EmailIntegrationUpdateContainer {...commonProps} {...props} />
            </Provider>
        )

    it.each([
        {
            selector: '#id-name',
            newValue: 'Some New Name',
            finalValue: INTEGRATION_NAME,
        },
        {
            selector: '#use_gmail_categories',
            newValue: true,
            finalValue: false,
        },
        {
            selector: '#enable_gmail_sending',
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

            const {container, getByText} = renderWithStore(props)

            expect(getByText('Save changes')).toBeDisabled()

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

            const {container, getByText} = renderWithStore(props)

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

            const {container, getByText} = renderWithStore(props)

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

    it('disables gmail sending checkbox', () => {
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

        const {getByRole} = renderWithStore(props)

        expect(
            getByRole('checkbox', {
                name: /enable sending emails with gmail/i,
            }).hasAttribute('disabled')
        ).toBeTruthy()
    })

    it('does not disable gmail sending checkbox', () => {
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

        const {getByRole} = renderWithStore(props)

        expect(
            getByRole('checkbox', {
                name: /enable sending emails with gmail/i,
            }).hasAttribute('disabled')
        ).toBeFalsy()
    })
})
