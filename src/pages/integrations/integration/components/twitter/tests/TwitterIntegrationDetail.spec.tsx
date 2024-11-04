import {fireEvent, render} from '@testing-library/react'
import {fromJS, Map} from 'immutable'
import {mockFlags} from 'jest-launchdarkly-mock'
import React from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {IntegrationType} from 'models/integration/types'
import TwitterIntegrationDetail from 'pages/integrations/integration/components/twitter/TwitterIntegrationDetail'
import {
    INTEGRATION_REMOVAL_CONFIGURATION_TEXT,
    INTEGRATION_SAVED_FILTERS_REMOVAL_CONFIRMATION_TEXT,
} from 'pages/integrations/integration/constants'

describe('<TwitterIntegrationDetail/>', () => {
    let updateOrCreateIntegration: jest.MockedFunction<any>
    let deleteIntegration: jest.MockedFunction<any>
    let integration: Map<string, any>

    beforeEach(() => {
        updateOrCreateIntegration = jest.fn()
        deleteIntegration = jest.fn()

        integration = fromJS({
            id: 1,
            name: 'Fake twitter integration',
            description: '@faketwitterintegration',
            type: IntegrationType.Twitter,
            meta: {
                about: 'Foo bar',
                picture: 'https://some-random-url.com/picture.jpeg',
                settings: {
                    mentions_enabled: false,
                    tweets_replies_enabled: false,
                    direct_messages_enabled: false,
                },
            },
        })

        // Bootstrap uses the current date to generate an ID for each button that is linked to a popover
        jest.spyOn(global.Date, 'now').mockImplementation(() => 1615240000000)

        mockFlags({
            [FeatureFlagKey.AnalyticsSavedFilters]: false,
        })
    })

    afterEach(() => {
        ;(global.Date.now as unknown as jest.SpyInstance).mockRestore()
    })

    describe('render()', () => {
        it('should render', () => {
            const {container} = render(
                <TwitterIntegrationDetail
                    integration={integration}
                    actions={{updateOrCreateIntegration, deleteIntegration}}
                    redirectUri="https://this-is-an-url.com"
                />
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should display delete warning message and it should not contain text about "saved filters"', () => {
            const {getByRole, getByText, queryByText} = render(
                <TwitterIntegrationDetail
                    integration={integration}
                    actions={{updateOrCreateIntegration, deleteIntegration}}
                    redirectUri="https://this-is-an-url.com"
                />
            )
            fireEvent.click(
                getByRole('button', {
                    name: /Remove twitter account/i,
                })
            )

            expect(
                getByText(INTEGRATION_REMOVAL_CONFIGURATION_TEXT)
            ).toBeInTheDocument()
            expect(
                queryByText(INTEGRATION_SAVED_FILTERS_REMOVAL_CONFIRMATION_TEXT)
            ).not.toBeInTheDocument()
        })

        it('should display delete warning message and it should contain text about "saved filters"', () => {
            mockFlags({
                [FeatureFlagKey.AnalyticsSavedFilters]: true,
            })

            const {getByRole, getByText} = render(
                <TwitterIntegrationDetail
                    integration={integration}
                    actions={{updateOrCreateIntegration, deleteIntegration}}
                    redirectUri="https://this-is-an-url.com"
                />
            )
            fireEvent.click(
                getByRole('button', {
                    name: /Remove twitter account/i,
                })
            )

            expect(
                getByText(
                    `${INTEGRATION_REMOVAL_CONFIGURATION_TEXT} ${INTEGRATION_SAVED_FILTERS_REMOVAL_CONFIRMATION_TEXT}`
                )
            ).toBeInTheDocument()
        })
    })
})
