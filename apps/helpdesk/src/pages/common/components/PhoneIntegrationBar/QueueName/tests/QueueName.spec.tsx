import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockGetVoiceQueueHandler,
    mockVoiceQueue,
} from '@gorgias/helpdesk-mocks'
import type { VoiceQueue } from '@gorgias/helpdesk-types'

import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

import QueueName from '../QueueName'

jest.mock('@repo/feature-flags')

const mockUseFlag = useFlag as jest.MockedFunction<typeof useFlag>
const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

const renderComponent = (props: {
    queueId: number | null
    primary?: boolean
}) => {
    return renderWithQueryClientProvider(<QueueName {...props} />)
}

describe('QueueName', () => {
    const mockQueue = mockVoiceQueue({ id: 1, name: 'Support Queue' })

    beforeEach(() => {
        mockUseFlag.mockReturnValue(true)
        const mockGetVoiceQueue = mockGetVoiceQueueHandler(async () =>
            HttpResponse.json(mockQueue),
        )
        server.use(mockGetVoiceQueue.handler)
    })

    afterEach(() => {
        server.resetHandlers()
        jest.clearAllMocks()
    })

    it('should display queue name with icon when data loads successfully', async () => {
        const { container } = renderComponent({ queueId: mockQueue.id })

        await waitFor(() => {
            expect(screen.getByText(mockQueue.name)).toBeInTheDocument()
        })

        const icon = container.querySelector('svg')
        expect(icon).toBeInTheDocument()
    })

    it('should render with primary prop', async () => {
        const { container } = renderComponent({
            queueId: mockQueue.id,
            primary: true,
        })

        await waitFor(() => {
            expect(screen.getByText(mockQueue.name)).toBeInTheDocument()
        })

        const queueContainer = container.querySelector('[data-color="green"]')
        expect(queueContainer).toBeInTheDocument()
    })

    it('should render without primary prop', async () => {
        const { container } = renderComponent({
            queueId: mockQueue.id,
            primary: false,
        })

        await waitFor(() => {
            expect(screen.getByText(mockQueue.name)).toBeInTheDocument()
        })

        const queueContainer = container.querySelector('span')
        expect(queueContainer).toBeInTheDocument()
    })

    it('should render nothing when queueId is null', () => {
        const { container } = renderComponent({ queueId: null })

        expect(container.firstChild).toBeNull()
    })

    it('should render nothing when API returns error', async () => {
        const mockGetVoiceQueue = mockGetVoiceQueueHandler(async () => {
            return HttpResponse.json(
                {
                    error: { msg: 'Queue not found' },
                } as unknown as VoiceQueue,
                { status: 404 },
            )
        })
        server.use(mockGetVoiceQueue.handler)

        const { container } = renderComponent({ queueId: 1 })

        await waitFor(() => {
            expect(container.firstChild).toBeNull()
        })
    })

    it('should render default when queue name is not available', async () => {
        const mockGetVoiceQueue = mockGetVoiceQueueHandler(async () =>
            HttpResponse.json({ ...mockVoiceQueue({ id: 1 }), name: '' }),
        )
        server.use(mockGetVoiceQueue.handler)

        renderComponent({ queueId: 1 })

        await waitFor(() => {
            expect(screen.getByText('Queue #1')).toBeInTheDocument()
        })
    })

    it('should render nothing when queue data is null', async () => {
        const mockGetVoiceQueue = mockGetVoiceQueueHandler(async () =>
            HttpResponse.json(null),
        )
        server.use(mockGetVoiceQueue.handler)

        const { container } = renderComponent({ queueId: 1 })

        await waitFor(() => {
            expect(container.firstChild).toBeNull()
        })
    })

    it('should render as span with restyling FF OFF', async () => {
        mockUseFlag.mockImplementation((flagKey) => {
            if (flagKey === FeatureFlagKey.CallBarRestyling) {
                return false
            }
            return false
        })

        const { container } = renderComponent({ queueId: mockQueue.id })

        await waitFor(() => {
            expect(screen.getByText(mockQueue.name)).toBeInTheDocument()
        })

        const tag = container.querySelector('[data-name="tag"]')
        expect(tag).not.toBeInTheDocument()
    })
})
