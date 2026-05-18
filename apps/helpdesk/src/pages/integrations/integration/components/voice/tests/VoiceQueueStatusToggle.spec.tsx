import { assumeMock, render } from '@repo/testing'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'

import { updateVoiceQueue } from '@gorgias/helpdesk-client'
import { VoiceQueueStatus } from '@gorgias/helpdesk-queries'

import VoiceQueueStatusToggle from '../VoiceQueueStatusToggle'

jest.mock('@gorgias/helpdesk-client')

const updateVoiceQueueMock = assumeMock(updateVoiceQueue)

const mockQueueId = 123

const renderComponent = (isEnabled: boolean) => {
    return render(
        <VoiceQueueStatusToggle queueId={mockQueueId} isEnabled={isEnabled} />,
    )
}

describe('VoiceQueueStatusToggle', () => {
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
        updateVoiceQueueMock.mockResolvedValue({
            data: {
                status: VoiceQueueStatus.Enabled,
            },
        } as any)
        renderComponent(false)

        act(() => {
            fireEvent.click(screen.getByRole('switch'))
        })

        await waitFor(() => {
            expect(updateVoiceQueueMock).toHaveBeenCalledWith(
                mockQueueId,
                {
                    status: VoiceQueueStatus.Enabled,
                },
                undefined,
            )
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
        updateVoiceQueueMock.mockResolvedValue({
            data: {
                status: VoiceQueueStatus.Disabled,
            },
        } as any)
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
            expect(updateVoiceQueueMock).toHaveBeenCalledWith(
                mockQueueId,
                {
                    status: VoiceQueueStatus.Disabled,
                },
                undefined,
            )
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
        updateVoiceQueueMock.mockRejectedValue(new Error('Test error'))
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
