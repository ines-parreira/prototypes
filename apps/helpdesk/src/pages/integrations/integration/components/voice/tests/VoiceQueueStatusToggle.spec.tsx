import { render } from '@repo/testing'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockUpdateVoiceQueueHandler,
    mockUpdateVoiceQueueResponse,
} from '@gorgias/helpdesk-mocks'
import { VoiceQueueStatus } from '@gorgias/helpdesk-queries'

import { VoiceQueueStatusToggle } from '../VoiceQueueStatusToggle'

const mockQueueId = 123
const updateVoiceQueueRequests: Request[] = []
const server = setupServer()

const renderComponent = (isEnabled: boolean) => {
    return render(
        <VoiceQueueStatusToggle queueId={mockQueueId} isEnabled={isEnabled} />,
    )
}

describe('VoiceQueueStatusToggle', () => {
    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    beforeEach(() => {
        updateVoiceQueueRequests.length = 0
    })

    afterEach(() => {
        server.resetHandlers()
    })

    afterAll(() => {
        server.close()
    })

    it('should render toggle with correct initial state when enabled', () => {
        renderComponent(true)

        expect(screen.getByText('Enable queue')).toBeInTheDocument()
        expect(screen.getByRole('switch')).toBeChecked()
    })

    it('should render toggle with correct initial state when disabled', () => {
        renderComponent(false)

        expect(screen.getByText('Enable queue')).toBeInTheDocument()
        expect(screen.getByRole('switch')).not.toBeChecked()
    })

    it('should enable queue when toggle is clicked and status is disabled', async () => {
        server.use(
            mockUpdateVoiceQueueHandler(async ({ request }) => {
                updateVoiceQueueRequests.push(request)

                return HttpResponse.json(
                    mockUpdateVoiceQueueResponse({
                        status: VoiceQueueStatus.Enabled,
                    }),
                )
            }).handler,
        )
        renderComponent(false)

        act(() => {
            fireEvent.click(screen.getByRole('switch'))
        })

        await waitFor(() => {
            expect(updateVoiceQueueRequests).toHaveLength(1)
        })
        await expect(updateVoiceQueueRequests[0].json()).resolves.toEqual({
            status: VoiceQueueStatus.Enabled,
        })

        const toastEl = await screen.findByRole('status', {
            name: 'Queue was successfully enabled',
        })
        expect(toastEl).toHaveAttribute('data-intent', 'success')
        await waitFor(() => {
            expect(screen.getByRole('switch')).toBeChecked()
        })
    })

    it('should disable queue when toggle is clicked and status is enabled', async () => {
        server.use(
            mockUpdateVoiceQueueHandler(async ({ request }) => {
                updateVoiceQueueRequests.push(request)

                return HttpResponse.json(
                    mockUpdateVoiceQueueResponse({
                        status: VoiceQueueStatus.Disabled,
                    }),
                )
            }).handler,
        )
        renderComponent(true)

        act(() => {
            fireEvent.click(screen.getByRole('switch'))
        })

        await waitFor(() => {
            expect(screen.getByText('Disable call queue?')).toBeInTheDocument()
        })

        act(() => {
            fireEvent.click(screen.getByRole('button', { name: 'Disable' }))
        })

        await waitFor(() => {
            expect(updateVoiceQueueRequests).toHaveLength(1)
        })
        await expect(updateVoiceQueueRequests[0].json()).resolves.toEqual({
            status: VoiceQueueStatus.Disabled,
        })

        const toastEl = await screen.findByRole('status', {
            name: 'Queue was successfully disabled',
        })
        expect(toastEl).toHaveAttribute('data-intent', 'success')
        await waitFor(() => {
            expect(screen.getByRole('switch')).not.toBeChecked()
        })
    })

    it('should display notification when request fails', async () => {
        server.use(
            mockUpdateVoiceQueueHandler(async () =>
                HttpResponse.json(mockUpdateVoiceQueueResponse(), {
                    status: 500,
                }),
            ).handler,
        )
        renderComponent(false)

        act(() => {
            fireEvent.click(screen.getByRole('switch'))
        })

        const toastEl = await screen.findByRole('status', {
            name: 'Failed to update queue status',
        })
        expect(toastEl).toHaveAttribute('data-intent', 'destructive')
    })

    it('should update queue status when isEnabled prop changes', async () => {
        const { rerender } = renderComponent(false)

        rerender(
            <VoiceQueueStatusToggle queueId={mockQueueId} isEnabled={true} />,
        )

        await waitFor(() => {
            expect(screen.getByRole('switch')).toBeChecked()
        })
    })
})
