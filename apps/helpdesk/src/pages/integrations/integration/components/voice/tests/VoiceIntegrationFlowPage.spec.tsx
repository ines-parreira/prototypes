import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockCallRoutingFlow,
    mockEmailIntegration,
    mockGetIntegrationHandler,
    mockPhoneIntegration,
} from '@gorgias/helpdesk-mocks'

import { renderWithStoreAndQueryClientAndRouter } from 'tests/renderWithStoreAndQueryClientAndRouter'

import VoiceIntegrationFlowPage from '../VoiceIntegrationFlowPage'

jest.mock('pages/common/components/Loader/Loader', () => () => (
    <div>Loading...</div>
))
jest.mock(
    'pages/integrations/integration/components/voice/flows/VoiceFlow',
    () => ({
        VoiceFlow: () => <div>VoiceFlow</div>,
    }),
)
jest.mock('@gorgias/realtime')

const server = setupServer()

describe('VoiceIntegrationFlowPage', () => {
    const renderComponent = () => {
        return renderWithStoreAndQueryClientAndRouter(
            <VoiceIntegrationFlowPage />,
            {},
            {
                route: '/123',
                path: '/:integrationId',
            },
        )
    }
    beforeAll(() => {
        server.listen()
    })

    afterEach(() => {
        server.resetHandlers()
    })

    afterAll(() => {
        server.close()
    })

    it('should show loader while fetching integration', async () => {
        const mockHandler = mockGetIntegrationHandler()
        server.use(mockHandler.handler)

        renderComponent()

        await waitFor(() => {
            expect(screen.getByText('Loading...')).toBeInTheDocument()
        })
    })

    it('should render flow content when integration is loaded', async () => {
        const mockIntegration = mockPhoneIntegration({
            meta: {
                flow: mockCallRoutingFlow(),
            },
        })
        const mockHandler = mockGetIntegrationHandler(async () =>
            HttpResponse.json(mockIntegration),
        )
        server.use(mockHandler.handler)

        renderComponent()

        await waitFor(() => {
            expect(screen.getByText('VoiceFlow')).toBeInTheDocument()
        })
    })

    it('should not render anything when integration has no flow', async () => {
        const mockIntegration = mockPhoneIntegration({
            meta: {
                flow: null as any,
            },
        })
        const mockHandler = mockGetIntegrationHandler(async () =>
            HttpResponse.json(mockIntegration),
        )
        server.use(mockHandler.handler)

        const { container } = renderComponent()

        await waitFor(() => {
            expect(container).toBeEmptyDOMElement()
        })
    })

    it('should render empty div when integration fetch fails', async () => {
        const mockHandler = mockGetIntegrationHandler(async () =>
            HttpResponse.json({} as any, { status: 500 }),
        )
        server.use(mockHandler.handler)

        const { container } = renderComponent()

        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
            expect(screen.queryByText('flow')).not.toBeInTheDocument()
            expect(container.querySelector('div:empty')).toBeInTheDocument()
        })
    })

    it('should render empty div when integration is not a phone integration', async () => {
        const mockIntegration = mockEmailIntegration()
        const mockHandler = mockGetIntegrationHandler(async () =>
            HttpResponse.json(mockIntegration),
        )
        server.use(mockHandler.handler)

        const { container } = renderComponent()

        await waitFor(() => {
            expect(screen.queryByText('flow')).not.toBeInTheDocument()
            expect(container.querySelector('div:empty')).toBeInTheDocument()
        })
    })
})
