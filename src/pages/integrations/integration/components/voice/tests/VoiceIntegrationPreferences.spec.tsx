import React from 'react'
import {RenderResult, cleanup, screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import {integrationsState} from 'fixtures/integrations'
import {IntegrationType} from 'models/integration/constants'
import {mockStore} from 'utils/testing'
import {renderWithQueryClientProvider} from 'tests/reactQueryTestingUtils'
import VoiceIntegrationPreferences from '../VoiceIntegrationPreferences'

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

    afterEach(() => {
        cleanup()
    })

    it('should render the component', () => {
        renderComponent(props)
        expect(screen.getByText('App title')).toBeInTheDocument()
    })
})
