import { screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'

import { render } from '../../../tests/render.utils'
import { AudioPlayer } from '../components/AudioPlayer'

beforeAll(() => {
    window.HTMLMediaElement.prototype.play = vi
        .fn()
        .mockResolvedValue(undefined)
    window.HTMLMediaElement.prototype.pause = vi.fn()
})

function renderComponent(
    props: Partial<{
        url: string
        initialDuration: number
        onDelete: () => void
    }> = {},
) {
    return render(
        <AudioPlayer url="https://example.com/audio.mp3" {...props} />,
    )
}

describe('AudioPlayer', () => {
    it('renders the play button', () => {
        renderComponent()
        expect(
            screen.getByRole('button', { name: /play/i }),
        ).toBeInTheDocument()
    })

    it('displays the initial duration', () => {
        renderComponent({ initialDuration: 90 })
        expect(screen.getByText('0:00 / 1:30')).toBeInTheDocument()
    })

    it('does not show Delete in the more options menu when onDelete is not provided', async () => {
        const { user } = renderComponent()
        await user.click(screen.getByRole('button', { name: /more options/i }))
        await waitFor(() => {
            expect(
                screen.getByRole('menuitem', { name: /download/i }),
            ).toBeInTheDocument()
        })
        expect(
            screen.queryByRole('menuitem', { name: /delete/i }),
        ).not.toBeInTheDocument()
    })

    it('shows Delete in the more options menu when onDelete is provided', async () => {
        const onDelete = vi.fn()
        const { user } = renderComponent({ onDelete })
        await user.click(screen.getByRole('button', { name: /more options/i }))
        await waitFor(() => {
            expect(
                screen.getByRole('menuitem', { name: /delete/i }),
            ).toBeInTheDocument()
        })
    })

    it('shows confirmation modal when Delete is clicked', async () => {
        const onDelete = vi.fn()
        const { user } = renderComponent({ onDelete })
        await user.click(screen.getByRole('button', { name: /more options/i }))
        await waitFor(() => {
            expect(
                screen.getByRole('menuitem', { name: /delete/i }),
            ).toBeInTheDocument()
        })
        await user.click(screen.getByRole('menuitem', { name: /delete/i }))
        expect(screen.getByText('Delete recording')).toBeInTheDocument()
        expect(onDelete).not.toHaveBeenCalled()
    })

    it('calls onDelete when confirmed in the modal', async () => {
        const onDelete = vi.fn()
        const { user } = renderComponent({ onDelete })
        await user.click(screen.getByRole('button', { name: /more options/i }))
        await waitFor(() => {
            expect(
                screen.getByRole('menuitem', { name: /delete/i }),
            ).toBeInTheDocument()
        })
        await user.click(screen.getByRole('menuitem', { name: /delete/i }))
        await user.click(screen.getByRole('button', { name: /^delete$/i }))
        expect(onDelete).toHaveBeenCalledTimes(1)
    })

    it('does not call onDelete when cancelled in the modal', async () => {
        const onDelete = vi.fn()
        const { user } = renderComponent({ onDelete })
        await user.click(screen.getByRole('button', { name: /more options/i }))
        await waitFor(() => {
            expect(
                screen.getByRole('menuitem', { name: /delete/i }),
            ).toBeInTheDocument()
        })
        await user.click(screen.getByRole('menuitem', { name: /delete/i }))
        await user.click(screen.getByRole('button', { name: /cancel/i }))
        expect(onDelete).not.toHaveBeenCalled()
    })

    it('shows Pause button after clicking Play', async () => {
        const { user } = renderComponent()
        await user.click(screen.getByRole('button', { name: /play/i }))
        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /pause/i }),
            ).toBeInTheDocument()
        })
    })

    it('renders playback speed options in the more options menu', async () => {
        const { user } = renderComponent()
        await user.click(screen.getByRole('button', { name: /more options/i }))
        await waitFor(() => {
            expect(
                screen.getByRole('menuitem', { name: /playback speed/i }),
            ).toBeInTheDocument()
        })
    })

    it('renders the volume button', () => {
        renderComponent()
        expect(
            screen.getByRole('button', { name: /volume/i }),
        ).toBeInTheDocument()
    })
})
