import React from 'react'

import { screen } from '@testing-library/react'

import { renderWithRouter } from 'utils/testing'

import { PHONE_INTEGRATION_BASE_URL as baseURL } from '../constants'
import VoiceIntegrationQueueRoutes from '../VoiceIntegrationQueueRoutes'

jest.mock(
    'pages/integrations/integration/components/voice/VoiceQueueCreatePage',
    () => () => <div>VoiceQueueCreatePage</div>,
)

describe('VoiceIntegrationQueueRoutes', () => {
    const renderComponent = (route: string = '') =>
        renderWithRouter(<VoiceIntegrationQueueRoutes />, { route })

    it('should render QUEUE LIST at /queues', () => {
        renderComponent(baseURL + '/queues')

        expect(screen.getByText('QUEUE LIST')).toBeInTheDocument()
    })

    it('should render VoiceQueueCreatePage at /queues/new', () => {
        renderComponent(baseURL + '/queues/new')

        expect(screen.getByText('VoiceQueueCreatePage')).toBeInTheDocument()
    })
})
