import React from 'react'
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import {fromJS, Map} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'

import {integrationBase, integrationsState} from 'fixtures/integrations'

import {EmailProvider, IntegrationType} from 'models/integration/constants'

import {OutboundVerificationStatusValue} from 'models/integration/types'
import {getOutboundEmailProviderSettingKey} from 'pages/integrations/integration/components/email/helpers'
import EmailIntegrationDeliverabilitySettings from '../EmailIntegrationDeliverabilitySettings'

type Props = {
    integration: Map<any, any>
}

describe('<EmailIntegrationDeliverabilitySettings />', () => {
    const mockStore = configureMockStore([thunk])
    let store = mockStore({integrations: fromJS(integrationsState)})
    const onChange: jest.MockedFunction<(newValue: boolean) => void> = jest.fn()

    beforeEach(() => {
        store = mockStore({integrations: fromJS(integrationsState)})
    })

    function getProviderSettings(domainVerified: boolean) {
        return {
            outbound_verification_status: {
                domain: domainVerified
                    ? OutboundVerificationStatusValue.Success
                    : OutboundVerificationStatusValue.Unverified,
                single_sender: OutboundVerificationStatusValue.Unverified,
            },
        }
    }

    function generateIntegration(
        useDefaultProvider: boolean,
        domainVerified: boolean,
        emailProvider: EmailProvider.Sendgrid | EmailProvider.Mailgun,
        integrationType: IntegrationType.Gmail | IntegrationType.Outlook
    ) {
        return {
            ...integrationBase,
            id: 1,
            type: integrationType,
            name: `My shiny ${integrationType} integration`,
            meta: {
                address: `support@${integrationType}.com`,
                provider: emailProvider,
                [getOutboundEmailProviderSettingKey(integrationType)]:
                    useDefaultProvider,
                ...getProviderSettings(domainVerified),
            },
        }
    }

    const renderWithStore = ({integration}: Props) =>
        render(
            <Provider store={store}>
                <EmailIntegrationDeliverabilitySettings
                    integration={integration.toJS()}
                    onChange={onChange}
                />
            </Provider>
        )
    it.each([
        {
            integrationType: IntegrationType.Gmail,
            useDefaultProviderSettingEnabled: true,
        },
        {
            integrationType: IntegrationType.Gmail,
            useDefaultProviderSettingEnabled: false,
        },
        {
            integrationType: IntegrationType.Outlook,
            useDefaultProviderSettingEnabled: true,
        },
        {
            integrationType: IntegrationType.Outlook,
            useDefaultProviderSettingEnabled: false,
        },
    ])(
        'should set the correct "selectedValue" radio button based on the integration setting',
        ({integrationType, useDefaultProviderSettingEnabled}) => {
            const newIntegration = generateIntegration(
                useDefaultProviderSettingEnabled,
                true,
                EmailProvider.Mailgun,
                integrationType as
                    | IntegrationType.Gmail
                    | IntegrationType.Outlook
            )
            const props = {
                integration: fromJS(newIntegration),
            }
            const {getAllByRole} = renderWithStore(props)
            const radioButtons = getAllByRole('radio')
            const useDefaultProviderRadioButton = radioButtons[0]
            const useInternalProviderRadioButton = radioButtons[1]

            expect(useDefaultProviderRadioButton).toBeEnabled()
            expect(useInternalProviderRadioButton).toBeEnabled()

            if (useDefaultProviderSettingEnabled) {
                expect(useDefaultProviderRadioButton).toBeChecked()
                expect(useInternalProviderRadioButton).not.toBeChecked()
            } else {
                expect(useInternalProviderRadioButton).toBeChecked()
                expect(useDefaultProviderRadioButton).not.toBeChecked()
            }
        }
    )

    it.each([IntegrationType.Outlook, IntegrationType.Gmail])(
        'should render initial state with default provider setting enabled on and domain verified. [%s]',
        async (integrationType) => {
            const newIntegration = generateIntegration(
                true,
                false,
                EmailProvider.Sendgrid,
                integrationType as
                    | IntegrationType.Gmail
                    | IntegrationType.Outlook
            )
            const props = {
                integration: fromJS(newIntegration),
            }
            const {getAllByRole, getByText} = renderWithStore(props)
            const radioButtons = getAllByRole('radio')
            const useDefaultProviderRadioButton = radioButtons[0]
            const useInternalProviderRadioButton = radioButtons[1]

            expect(useDefaultProviderRadioButton).toBeEnabled()
            expect(useDefaultProviderRadioButton).toBeChecked()
            expect(useInternalProviderRadioButton).toBeDisabled()
            expect(useInternalProviderRadioButton).not.toBeChecked()

            const infoIcon = getByText('info_outline')
            expect(infoIcon).toBeInTheDocument()

            fireEvent.mouseOver(infoIcon)
            await waitFor(() => {
                const tooltip_ = screen.getByRole('tooltip')
                expect(tooltip_).toBeInTheDocument()
                const expectedTooltipLink = `/app/settings/channels/email/1/${
                    newIntegration.meta.provider === EmailProvider.Sendgrid
                        ? 'outbound-verification'
                        : 'dns'
                }`
                expect(tooltip_.innerHTML).toContain(
                    `to="${expectedTooltipLink}"`
                )
            })
        }
    )
})
