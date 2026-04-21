import { render } from '@repo/testing/vitest'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CopyableField } from './CopyableField'

const mockCopyToClipboard = vi.fn()
const { useCopyToClipboard } = vi.hoisted(() => ({
    useCopyToClipboard: vi.fn(),
}))

vi.mock('@repo/hooks', () => ({
    useCopyToClipboard,
}))

describe('CopyableField', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        useCopyToClipboard.mockReturnValue([null, mockCopyToClipboard])
    })

    it('renders provided children', () => {
        render(
            <CopyableField value="raw-value">
                <span>Formatted</span>
            </CopyableField>,
        )
        expect(screen.getByText('Formatted')).toBeInTheDocument()
    })

    it('falls back to truncated value when no children are provided', () => {
        const longValue = 'a'.repeat(120)
        render(<CopyableField value={longValue} />)
        expect(screen.getByText(`${'a'.repeat(80)}...`)).toBeInTheDocument()
    })

    it('renders a button with default aria-label', () => {
        render(<CopyableField value="raw-value" />)
        expect(
            screen.getByRole('button', { name: /copy to clipboard/i }),
        ).toBeInTheDocument()
    })

    it('uses a custom aria-label when provided', () => {
        render(<CopyableField value="raw-value" ariaLabel="Copy SKU" />)
        expect(
            screen.getByRole('button', { name: /copy sku/i }),
        ).toBeInTheDocument()
    })

    it('copies the raw value to the clipboard when clicked', async () => {
        const { user } = render(
            <CopyableField value="raw-value">
                <span>Formatted display</span>
            </CopyableField>,
        )

        await user.click(
            screen.getByRole('button', { name: /copy to clipboard/i }),
        )

        expect(mockCopyToClipboard).toHaveBeenCalledWith('raw-value')
    })

    it('shows tooltip after copying', async () => {
        const { user } = render(<CopyableField value="raw-value" />)

        await user.click(
            screen.getByRole('button', { name: /copy to clipboard/i }),
        )

        expect(
            await screen.findByText('Copied to clipboard'),
        ).toBeInTheDocument()
    })

    it('hides tooltip on mouse leave', async () => {
        const { user } = render(<CopyableField value="raw-value" />)

        const copyButton = screen.getByRole('button', {
            name: /copy to clipboard/i,
        })

        await user.click(copyButton)

        expect(
            await screen.findByText('Copied to clipboard'),
        ).toBeInTheDocument()

        // The DOM structure is: span[onMouseLeave] > div[tooltip-trigger] > button
        // mouseleave doesn't bubble, so fire on the span directly
        const tooltipTriggerWrapper = copyButton.closest('span')!
        fireEvent.mouseLeave(tooltipTriggerWrapper)

        await waitFor(() => {
            expect(
                screen.queryByText('Copied to clipboard'),
            ).not.toBeInTheDocument()
        })
    })

    it('hides tooltip after 2 seconds', async () => {
        vi.useFakeTimers()

        render(<CopyableField value="raw-value" />)

        const copyButton = screen.getByRole('button', {
            name: /copy to clipboard/i,
        })

        await act(async () => {
            await copyButton.click()
        })

        await vi.waitFor(() => {
            expect(screen.getByText('Copied to clipboard')).toBeInTheDocument()
        })

        act(() => {
            vi.advanceTimersByTime(2000)
        })

        await vi.waitFor(() => {
            expect(
                screen.queryByText('Copied to clipboard'),
            ).not.toBeInTheDocument()
        })

        vi.useRealTimers()
    })

    it('stops click propagation so parent handlers do not fire', async () => {
        const parentClick = vi.fn()
        const { user } = render(
            <div role="presentation" onClick={parentClick}>
                <CopyableField value="raw-value">
                    <span>inside</span>
                </CopyableField>
            </div>,
        )

        await user.click(
            screen.getByRole('button', { name: /copy to clipboard/i }),
        )

        expect(parentClick).not.toHaveBeenCalled()
        expect(mockCopyToClipboard).toHaveBeenCalledWith('raw-value')
    })

    it('renders a tooltip trigger when value is long and tooltip is enabled', () => {
        const longValue = 'z'.repeat(120)
        render(<CopyableField value={longValue} tooltip />)
        expect(screen.getByText(`${'z'.repeat(80)}...`)).toBeInTheDocument()
    })

    it('does not render truncated text when children are provided', () => {
        const longValue = 'b'.repeat(120)
        render(
            <CopyableField value={longValue}>
                <span>Short display</span>
            </CopyableField>,
        )
        expect(screen.getByText('Short display')).toBeInTheDocument()
        expect(
            screen.queryByText(`${'b'.repeat(80)}...`),
        ).not.toBeInTheDocument()
    })
})
