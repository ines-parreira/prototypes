import React from 'react'

import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'

import { useFlag } from 'core/flags'
import { integrationsState } from 'fixtures/integrations'
import { IntegrationType, PhoneIntegration } from 'models/integration/types'
import { assumeMock, mockStore, renderWithRouter } from 'utils/testing'

import VoiceIntegrationSecondaryNavigation from '../VoiceIntegrationSecondaryNavigation'

jest.mock('hooks/useAppSelector', () => (fn: () => void) => fn())
jest.mock('core/flags')
jest.mock('state/integrations/selectors', () => ({
    getPhoneIntegrations: jest.fn(),
}))
jest.mock('pages/integrations/integration/utils/defaultRoutes', () => ({
    getDefaultRoutes: jest.fn(() => ({
        integrations: ['/integrations'],
        about: ['/integrations/about'],
    })),
}))

const defaultState = {
    integrations: fromJS(integrationsState),
}

const useFlagMock = assumeMock(useFlag)

describe('<VoiceIntegrationSecondaryNavigation />', () => {
    let integration: PhoneIntegration

    beforeEach(() => {
        integration = {
            id: 1,
            type: IntegrationType.Phone,
        } as PhoneIntegration
        useFlagMock.mockReturnValue(true)
    })

    const renderComponent = (integration?: PhoneIntegration) =>
        renderWithRouter(
            <Provider store={mockStore(defaultState as any)}>
                <VoiceIntegrationSecondaryNavigation
                    integration={integration}
                />
            </Provider>,
        )

    it('should render the secondary navigation with integration', () => {
        renderComponent(integration)

        expect(screen.getByText('Preferences')).toBeInTheDocument()
        expect(screen.getByText('Voicemail')).toBeInTheDocument()
    })

    it('should render the secondary navigation without integration', () => {
        renderComponent()

        expect(screen.getByText('About')).toBeInTheDocument()
        expect(screen.getByText('Integrations')).toBeInTheDocument()
    })

    it('should render Queues link when exposeQueues flag is on', () => {
        renderComponent()

        expect(screen.getByText('Queues')).toBeInTheDocument()
    })

    it('should not render Queues link when exposeQueues flag is off', () => {
        useFlagMock.mockReturnValue(false)
        renderComponent()

        expect(screen.queryByText('Queues')).toBeNull()
    })
})
