import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { PHONE_INTEGRATION_BASE_URL as baseURL } from '../constants'
import { VoiceIntegrationQueueRoutes } from '../VoiceIntegrationQueueRoutes'

jest.mock(
    'pages/integrations/integration/components/voice/VoiceQueueCreatePage',
    () => ({ VoiceQueueCreatePage: () => <div>VoiceQueueCreatePage</div> }),
)

jest.mock(
    'pages/integrations/integration/components/voice/VoiceQueueEditPage',
    () => ({ VoiceQueueEditPage: () => <div>VoiceQueueEditPage</div> }),
)

jest.mock(
    'pages/integrations/integration/components/voice/VoiceQueueListPage',
    () => ({ VoiceQueueListPage: () => <div>VoiceQueueListPage</div> }),
)

describe('VoiceIntegrationQueueRoutes', () => {
    const renderComponent = (route: string = '') =>
        render(<VoiceIntegrationQueueRoutes />, { initialEntries: [route] })

    it('should render QUEUE LIST at /queues', () => {
        renderComponent(baseURL + '/queues')

        expect(screen.getByText('VoiceQueueListPage')).toBeInTheDocument()
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
