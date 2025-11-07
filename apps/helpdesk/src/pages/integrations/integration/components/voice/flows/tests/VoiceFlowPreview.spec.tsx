import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockCallRoutingFlow,
    mockEmailIntegration,
    mockGetIntegrationHandler,
    mockPhoneIntegration,
} from '@gorgias/helpdesk-mocks'

import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'

import VoiceFlowPreview from '../VoiceFlowPreview'

jest.mock('@gorgias/realtime')
jest.mock('../VoiceFlow', () => ({
    VoiceFlow: ({ preview }: { preview: boolean }) => (
        <div data-testid="voice-flow" data-preview={preview}>
            VoiceFlow
        </div>
    ),
}))

jest.mock('pages/common/components/Loader/Loader', () => () => (
    <div data-testid="loader">Loading...</div>
))

const server = setupServer()

describe('VoiceFlowPreview', () => {
    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    afterEach(() => {
        server.resetHandlers()
    })

    afterAll(() => {
        server.close()
    })

    const renderComponent = (integrationId: number = 123) => {
        return renderWithStoreAndQueryClientProvider(
            <VoiceFlowPreview integrationId={integrationId} />,
        )
    }

    it('should render loader while fetching integration', async () => {
        const mockHandler = mockGetIntegrationHandler()
        server.use(mockHandler.handler)

        renderComponent()

        expect(screen.getByTestId('loader')).toBeInTheDocument()
    })

    it('should render VoiceFlow with preview=true when integration has a flow', async () => {
        const mockFlow = mockCallRoutingFlow()
        const mockIntegration = mockPhoneIntegration({
            meta: {
                flow: mockFlow,
            },
        })
        const mockHandler = mockGetIntegrationHandler(async () =>
            HttpResponse.json(mockIntegration),
        )
        server.use(mockHandler.handler)

        renderComponent()

        await waitFor(() => {
            const voiceFlow = screen.getByTestId('voice-flow')
            expect(voiceFlow).toBeInTheDocument()
            expect(voiceFlow).toHaveAttribute('data-preview', 'true')
        })
    })

    it('should render empty box when integration has no flow', async () => {
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
            expect(screen.queryByTestId('loader')).not.toBeInTheDocument()
            expect(screen.queryByTestId('voice-flow')).not.toBeInTheDocument()
            expect(
                container.querySelector('[class*="previewBox"]'),
            ).toBeInTheDocument()
        })
    })

    it('should render empty box when integration fetch fails', async () => {
        const mockHandler = mockGetIntegrationHandler(async () =>
            HttpResponse.json({} as any, { status: 500 }),
        )
        server.use(mockHandler.handler)

        const { container } = renderComponent()

        await waitFor(() => {
            expect(screen.queryByTestId('loader')).not.toBeInTheDocument()
            expect(screen.queryByTestId('voice-flow')).not.toBeInTheDocument()
            expect(
                container.querySelector('[class*="previewBox"]'),
            ).toBeInTheDocument()
        })
    })

    it('should render empty box when integration is not a phone integration', async () => {
        const mockIntegration = mockEmailIntegration()
        const mockHandler = mockGetIntegrationHandler(async () =>
            HttpResponse.json(mockIntegration),
        )
        server.use(mockHandler.handler)

        const { container } = renderComponent()

        await waitFor(() => {
            expect(screen.queryByTestId('voice-flow')).not.toBeInTheDocument()
            expect(
                container.querySelector('[class*="previewBox"]'),
            ).toBeInTheDocument()
        })
    })

    it('should use custom width and height props', async () => {
        const mockFlow = mockCallRoutingFlow()
        const mockIntegration = mockPhoneIntegration({
            meta: {
                flow: mockFlow,
            },
        })
        const mockHandler = mockGetIntegrationHandler(async () =>
            HttpResponse.json(mockIntegration),
        )
        server.use(mockHandler.handler)

        const { container } = renderWithStoreAndQueryClientProvider(
            <VoiceFlowPreview
                integrationId={123}
                width="800px"
                height="400px"
            />,
        )

        await waitFor(() => {
            const box = container.querySelector('[class*="previewBox"]')
            expect(box).toHaveStyle({ width: '800px', height: '400px' })
        })
    })
})
