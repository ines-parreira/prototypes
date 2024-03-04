import React from 'react'
import {RenderResult, cleanup, screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import {mockFlags, resetLDMocks} from 'jest-launchdarkly-mock'
import {integrationsState} from 'fixtures/integrations'
import {IntegrationType} from 'models/integration/constants'
import {mockStore} from 'utils/testing'
import {FeatureFlagKey} from 'config/featureFlags'
import {renderWithQueryClientProvider} from 'tests/reactQueryTestingUtils'
import VoiceIntegrationPreferences from '../VoiceIntegrationPreferences'

jest.mock('../VoiceIntegrationPreferencesHoldMusic', () => () => (
    <div data-testid="voice-integration-preferences-hold-music" />
))

const phoneIntegration = integrationsState.integrations.find(
    (integration) => integration.type === IntegrationType.Phone
)

describe('<VoiceIntegrationPreferences />', () => {
    const props = {
        integration: phoneIntegration,
    }

    const renderComponent = (props: any = {}): RenderResult => {
        return renderWithQueryClientProvider(
            <Provider store={mockStore({} as any)}>
                <VoiceIntegrationPreferences {...props} />
            </Provider>
        )
    }

    beforeEach(() => {
        resetLDMocks()
    })

    afterEach(() => {
        cleanup()
    })

    it('should not display the custom hold music setting when FF is off', () => {
        mockFlags({[FeatureFlagKey.CallOnHold]: false})
        renderComponent(props)

        expect(
            screen.queryByTestId('voice-integration-preferences-hold-music')
        ).not.toBeInTheDocument()
    })

    it('should display the custom hold music setting', () => {
        mockFlags({[FeatureFlagKey.CallOnHold]: true})
        renderComponent(props)

        expect(
            screen.queryByTestId('voice-integration-preferences-hold-music')
        ).toBeInTheDocument()
    })
})
