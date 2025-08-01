import { assumeMock } from '@repo/testing'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'

import { updateVoiceQueue } from '@gorgias/helpdesk-client'
import { VoiceQueueStatus } from '@gorgias/helpdesk-queries'

import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

import VoiceQueueStatusToggle from '../VoiceQueueStatusToggle'

jest.mock('@gorgias/helpdesk-client')

const mockNotify = {
    success: jest.fn(),
    error: jest.fn(),
}
jest.mock('hooks/useNotify', () => ({
    useNotify: () => mockNotify,
}))

const updateVoiceQueueMock = assumeMock(updateVoiceQueue)

const mockQueueId = 123

const renderComponent = (isEnabled: boolean) => {
    return renderWithQueryClientProvider(
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

        expect(mockNotify.success).toHaveBeenCalledWith(
            'Queue was successfully enabled',
        )
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

        expect(mockNotify.success).toHaveBeenCalledWith(
            'Queue was successfully disabled',
        )
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

        await waitFor(() => {
            expect(mockNotify.error).toHaveBeenCalledWith(
                'Failed to update queue status',
            )
        })
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
