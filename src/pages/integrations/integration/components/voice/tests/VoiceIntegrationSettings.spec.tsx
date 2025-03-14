import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'

import { IntegrationType } from '@gorgias/api-client'

import { integrationsState } from 'fixtures/integrations'
import { PhoneIntegration } from 'models/integration/types'
import { RootState } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { mockStore, renderWithRouter } from 'utils/testing'

import VoiceIntegrationSettings from '../VoiceIntegrationSettings'

const phoneIntegration = integrationsState.integrations.find(
    (integration) => integration.type === IntegrationType.Phone,
) as unknown as PhoneIntegration

describe('VoiceIntegrationSettings', () => {
    const renderComponent = (
        storeState: RootState,
        integration: PhoneIntegration,
    ) => {
        return renderWithRouter(
            <QueryClientProvider client={mockQueryClient()}>
                <Provider store={mockStore(storeState)}>
                    <VoiceIntegrationSettings integration={integration} />
                </Provider>
            </QueryClientProvider>,
        )
    }

    it('should render', () => {
        const { getByText } = renderComponent({} as RootState, phoneIntegration)

        expect(getByText('Testing for now')).toBeInTheDocument()
    })
})
