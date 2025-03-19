import { screen } from '@testing-library/react'

import { renderWithRouter } from 'utils/testing'

import { PHONE_INTEGRATION_BASE_URL as baseURL } from '../constants'
import VoiceIntegrationQueueRoutes from '../VoiceIntegrationQueueRoutes'

jest.mock(
    'pages/integrations/integration/components/voice/VoiceQueueCreatePage',
    () => () => <div>VoiceQueueCreatePage</div>,
)

jest.mock(
    'pages/integrations/integration/components/voice/VoiceQueueEditPage',
    () => () => <div>VoiceQueueEditPage</div>,
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

    it('should render VoiceQueueEditPage at /queues/:id', () => {
        renderComponent(baseURL + '/queues/123')

        expect(screen.getByText('VoiceQueueEditPage')).toBeInTheDocument()
    })
})
