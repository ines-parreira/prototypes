import React from 'react'

import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'

import { integrationsState } from 'fixtures/integrations'
import type { PhoneIntegration } from 'models/integration/types'
import { IntegrationType } from 'models/integration/types'
import { PhoneFunction } from 'models/phoneNumber/types'
import { mockStore, renderWithRouter } from 'utils/testing'

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

describe('<VoiceIntegrationSecondaryNavigation />', () => {
    let integration: PhoneIntegration

    beforeEach(() => {
        integration = {
            id: 1,
            type: IntegrationType.Phone,
        } as PhoneIntegration
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
        renderComponent({
            ...integration,
            meta: {
                ...integration.meta,
                function: PhoneFunction.Ivr,
            },
        })

        expect(screen.getByText('Preferences')).toBeInTheDocument()
        expect(screen.getByText('Voicemail')).toBeInTheDocument()
        expect(screen.getByText('IVR')).toBeInTheDocument()
    })

    it('should render the secondary navigation without integration', () => {
        renderComponent()

        expect(screen.getByText('About')).toBeInTheDocument()
        expect(screen.getByText('Integrations')).toBeInTheDocument()
        expect(screen.getByText('Queues')).toBeInTheDocument()
    })

    it('should not render anything if integration is not IVR', () => {
        const { container } = renderComponent({
            ...integration,
            meta: { ...integration.meta, function: PhoneFunction.Standard },
        })

        expect(container).toBeEmptyDOMElement()
    })
})
