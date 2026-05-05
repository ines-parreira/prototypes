import { render } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'

import { KlaviyoSetupCard } from './KlaviyoSetupCard'

describe('<KlaviyoSetupCard />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders the webhook URL', () => {
        render(
            <KlaviyoSetupCard webhookUrl="https://app.gorgias.com/webhooks/journey/abc123" />,
        )

        expect(
            screen.getByDisplayValue(
                'https://app.gorgias.com/webhooks/journey/abc123',
            ),
        ).toBeInTheDocument()
    })

    it('renders a copy button for the webhook URL', () => {
        render(
            <KlaviyoSetupCard webhookUrl="https://app.gorgias.com/webhooks/journey/abc123" />,
        )

        const copyButtons = screen.getAllByRole('button', { name: /copy/i })
        expect(copyButtons.length).toBeGreaterThanOrEqual(1)
    })

    it('copies webhook URL to clipboard when copy button is clicked', async () => {
        const { user } = render(
            <KlaviyoSetupCard webhookUrl="https://app.gorgias.com/webhooks/journey/abc123" />,
        )
        const writeTextSpy = jest
            .spyOn(navigator.clipboard, 'writeText')
            .mockResolvedValue(undefined)

        const copyButtons = screen.getAllByRole('button', { name: /copy/i })
        await user.click(copyButtons[0])

        await waitFor(() => {
            expect(writeTextSpy).toHaveBeenCalledWith(
                'https://app.gorgias.com/webhooks/journey/abc123',
            )
        })
    })

    it('renders the payload template without integration_id', () => {
        render(
            <KlaviyoSetupCard webhookUrl="https://app.gorgias.com/webhooks/journey/abc123" />,
        )

        expect(screen.queryByText(/integration_id/)).not.toBeInTheDocument()
    })

    it('copies payload template to clipboard when payload copy button is clicked', async () => {
        const { user } = render(
            <KlaviyoSetupCard webhookUrl="https://app.gorgias.com/webhooks/journey/abc123" />,
        )
        const writeTextSpy = jest
            .spyOn(navigator.clipboard, 'writeText')
            .mockResolvedValue(undefined)

        const copyButtons = screen.getAllByRole('button', { name: /copy/i })
        await user.click(copyButtons[1])

        await waitFor(() => {
            expect(writeTextSpy).toHaveBeenCalled()
        })

        const copiedText = writeTextSpy.mock.calls[0][0] as string
        expect(copiedText).toContain('"phone_number"')
        expect(copiedText).not.toContain('integration_id')
    })

    it('renders a note about event fields being empty for list/segment-triggered flows', () => {
        render(
            <KlaviyoSetupCard webhookUrl="https://app.gorgias.com/webhooks/journey/abc123" />,
        )

        expect(
            screen.getByText(/event.*empty string.*list.*segment/i),
        ).toBeInTheDocument()
    })

    it('uses document.execCommand fallback when navigator.clipboard is unavailable', async () => {
        document.execCommand = jest.fn().mockReturnValue(true)
        const mockExecCommand = document.execCommand as jest.Mock
        const appendSpy = jest.spyOn(document.body, 'appendChild')
        const removeSpy = jest.spyOn(document.body, 'removeChild')

        const { user } = render(
            <KlaviyoSetupCard webhookUrl="https://app.gorgias.com/webhooks/journey/abc123" />,
        )
        const originalClipboard = navigator.clipboard

        Object.defineProperty(navigator, 'clipboard', {
            value: undefined,
            writable: true,
            configurable: true,
        })

        const copyButtons = screen.getAllByRole('button', { name: /copy/i })
        await user.click(copyButtons[0])

        await waitFor(() => {
            expect(mockExecCommand).toHaveBeenCalledWith('copy')
        })
        expect(appendSpy).toHaveBeenCalled()
        expect(removeSpy).toHaveBeenCalled()

        const appendCalls = appendSpy.mock.calls.filter(
            ([node]) => node instanceof HTMLTextAreaElement,
        )
        const textarea = appendCalls[0][0] as HTMLTextAreaElement
        expect(textarea.value).toBe(
            'https://app.gorgias.com/webhooks/journey/abc123',
        )

        appendSpy.mockRestore()
        removeSpy.mockRestore()

        Object.defineProperty(navigator, 'clipboard', {
            value: originalClipboard,
            writable: true,
            configurable: true,
        })
    })

    it('shows "Copied!" feedback after clicking copy and reverts after timeout', async () => {
        const { user } = render(
            <KlaviyoSetupCard webhookUrl="https://app.gorgias.com/webhooks/journey/abc123" />,
        )

        const copyButtons = screen.getAllByRole('button', { name: /^copy$/i })
        expect(copyButtons).toHaveLength(2)

        await user.click(copyButtons[0])

        // handleCopy awaits navigator.clipboard.writeText before flipping
        // state to "Copied!"; findByRole waits for the post-await render.
        expect(
            await screen.findByRole('button', { name: 'Copied!' }),
        ).toBeInTheDocument()

        // The component sets a 1.5s timer to revert the state. waitFor
        // polls until the button label flips back.
        await waitFor(
            () => {
                const updatedCopyButtons = screen.getAllByRole('button', {
                    name: /^copy$/i,
                })
                expect(updatedCopyButtons).toHaveLength(2)
            },
            { timeout: 2500 },
        )
    })
})
