import { render } from '@repo/testing'
import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { KlaviyoSetupCard } from './KlaviyoSetupCard'

jest.mock('AIJourney/utils/copyToClipboard', () => ({
    copyToClipboard: jest.fn(),
}))

const mockCopyToClipboard = require('AIJourney/utils/copyToClipboard')
    .copyToClipboard as jest.Mock

const WEBHOOK_URL = 'https://app.gorgias.com/webhooks/journey/abc123'

describe('<KlaviyoSetupCard />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockCopyToClipboard.mockResolvedValue(true)
    })

    describe('v2 (default)', () => {
        it('renders the webhook URL', () => {
            render(<KlaviyoSetupCard webhookUrl={WEBHOOK_URL} />)

            expect(screen.getByDisplayValue(WEBHOOK_URL)).toBeInTheDocument()
        })

        it('renders a copy button for the webhook URL', () => {
            render(<KlaviyoSetupCard webhookUrl={WEBHOOK_URL} />)

            const copyButtons = screen.getAllByRole('button', { name: /copy/i })
            expect(copyButtons.length).toBeGreaterThanOrEqual(1)
        })

        it('copies webhook URL to clipboard when copy button is clicked', async () => {
            const { user } = render(
                <KlaviyoSetupCard webhookUrl={WEBHOOK_URL} />,
            )

            const copyButtons = screen.getAllByRole('button', { name: /copy/i })
            await user.click(copyButtons[0])

            expect(mockCopyToClipboard).toHaveBeenCalledWith(WEBHOOK_URL)
        })

        it('renders the payload template without integration_id', () => {
            render(<KlaviyoSetupCard webhookUrl={WEBHOOK_URL} />)

            expect(screen.queryByText(/integration_id/)).not.toBeInTheDocument()
        })

        it('copies payload template to clipboard when payload copy button is clicked', async () => {
            const { user } = render(
                <KlaviyoSetupCard webhookUrl={WEBHOOK_URL} />,
            )

            const copyButtons = screen.getAllByRole('button', { name: /copy/i })
            await user.click(copyButtons[1])

            expect(mockCopyToClipboard).toHaveBeenCalledWith(
                expect.stringContaining('"phone_number"'),
            )
        })

        it('renders a note about event fields being empty for list/segment-triggered flows', () => {
            render(<KlaviyoSetupCard webhookUrl={WEBHOOK_URL} />)

            expect(
                screen.getByText(/event.*empty string.*list.*segment/i),
            ).toBeInTheDocument()
        })

        it('shows "Copied!" feedback after clicking copy and reverts after timeout', async () => {
            const { user } = render(
                <KlaviyoSetupCard webhookUrl={WEBHOOK_URL} />,
            )

            const copyButtons = screen.getAllByRole('button', {
                name: /^copy copy$/i,
            })
            expect(copyButtons).toHaveLength(2)

            await user.click(copyButtons[0])

            expect(
                await screen.findByRole('button', { name: /copied!/i }),
            ).toBeInTheDocument()

            await waitFor(
                () => {
                    const updatedCopyButtons = screen.getAllByRole('button', {
                        name: /^copy copy$/i,
                    })
                    expect(updatedCopyButtons).toHaveLength(2)
                },
                { timeout: 2500 },
            )
        })
    })

    describe('isV3Architecture', () => {
        describe('empty state (no webhookUrl)', () => {
            it('should render the empty state heading', () => {
                render(<KlaviyoSetupCard isV3Architecture />)

                expect(
                    screen.getByText(
                        /activate the flow.*to generate your webhook/is,
                    ),
                ).toBeInTheDocument()
            })

            it('should render the empty state description', () => {
                render(<KlaviyoSetupCard isV3Architecture />)

                expect(
                    screen.getByText(/the url and json body will appear here/i),
                ).toBeInTheDocument()
            })

            it('should not render any text input or textarea', () => {
                render(<KlaviyoSetupCard isV3Architecture />)

                expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
            })

            it('should not render any Copy button', () => {
                render(<KlaviyoSetupCard isV3Architecture />)

                expect(
                    screen.queryByRole('button', { name: /^copy copy$/i }),
                ).not.toBeInTheDocument()
            })
        })

        describe('webhook content (webhookUrl provided)', () => {
            it('should render the Webhook heading', () => {
                render(
                    <KlaviyoSetupCard
                        webhookUrl={WEBHOOK_URL}
                        isV3Architecture
                    />,
                )

                expect(
                    screen.getByRole('heading', { name: /webhook/i }),
                ).toBeInTheDocument()
            })

            it('should not show the event fields note', () => {
                render(
                    <KlaviyoSetupCard
                        webhookUrl={WEBHOOK_URL}
                        isV3Architecture
                    />,
                )

                expect(
                    screen.queryByText(/event.*empty string.*list.*segment/i),
                ).not.toBeInTheDocument()
            })

            it('should display the webhook URL in a read-only input', () => {
                render(
                    <KlaviyoSetupCard
                        webhookUrl={WEBHOOK_URL}
                        isV3Architecture
                    />,
                )

                expect(
                    screen.getByDisplayValue(WEBHOOK_URL),
                ).toBeInTheDocument()
            })

            it('should display the payload template in a textarea', () => {
                render(
                    <KlaviyoSetupCard
                        webhookUrl={WEBHOOK_URL}
                        isV3Architecture
                    />,
                )

                expect(screen.getByText('Payload template')).toBeInTheDocument()
                expect(
                    screen.getByDisplayValue(/"phone_number"/),
                ).toBeInTheDocument()
            })

            it('should render two Copy buttons (one for URL, one for payload)', () => {
                render(
                    <KlaviyoSetupCard
                        webhookUrl={WEBHOOK_URL}
                        isV3Architecture
                    />,
                )

                expect(
                    screen.getAllByRole('button', { name: /^copy copy$/i }),
                ).toHaveLength(2)
            })
        })

        describe('copy URL', () => {
            it('should call copyToClipboard with the webhook URL', async () => {
                const user = userEvent.setup()
                render(
                    <KlaviyoSetupCard
                        webhookUrl={WEBHOOK_URL}
                        isV3Architecture
                    />,
                )

                const [urlCopyButton] = screen.getAllByRole('button', {
                    name: /^copy copy$/i,
                })
                await user.click(urlCopyButton)

                expect(mockCopyToClipboard).toHaveBeenCalledWith(WEBHOOK_URL)
            })

            it('should show "Copied!" on the URL button after a successful copy', async () => {
                const user = userEvent.setup()
                render(
                    <KlaviyoSetupCard
                        webhookUrl={WEBHOOK_URL}
                        isV3Architecture
                    />,
                )

                const [urlCopyButton] = screen.getAllByRole('button', {
                    name: /^copy copy$/i,
                })
                await user.click(urlCopyButton)

                expect(
                    await screen.findByRole('button', { name: /copied!/i }),
                ).toBeInTheDocument()
            })

            it('should not show "Copied!" when copyToClipboard returns false', async () => {
                mockCopyToClipboard.mockResolvedValue(false)
                const user = userEvent.setup()
                render(
                    <KlaviyoSetupCard
                        webhookUrl={WEBHOOK_URL}
                        isV3Architecture
                    />,
                )

                const [urlCopyButton] = screen.getAllByRole('button', {
                    name: /^copy copy$/i,
                })
                await user.click(urlCopyButton)

                expect(
                    screen.queryByRole('button', { name: /copied!/i }),
                ).not.toBeInTheDocument()
            })
        })

        describe('copy payload', () => {
            it('should call copyToClipboard with the payload template JSON', async () => {
                const user = userEvent.setup()
                render(
                    <KlaviyoSetupCard
                        webhookUrl={WEBHOOK_URL}
                        isV3Architecture
                    />,
                )

                const copyButtons = screen.getAllByRole('button', {
                    name: /^copy copy$/i,
                })
                await user.click(copyButtons[1])

                expect(mockCopyToClipboard).toHaveBeenCalledWith(
                    expect.stringContaining('"phone_number"'),
                )
            })

            it('should show "Copied!" on the payload button after a successful copy', async () => {
                const user = userEvent.setup()
                render(
                    <KlaviyoSetupCard
                        webhookUrl={WEBHOOK_URL}
                        isV3Architecture
                    />,
                )

                const copyButtons = screen.getAllByRole('button', {
                    name: /^copy copy$/i,
                })
                await user.click(copyButtons[1])

                expect(
                    await screen.findByRole('button', { name: /copied!/i }),
                ).toBeInTheDocument()
            })

            it('should not show "Copied!" when copyToClipboard returns false', async () => {
                mockCopyToClipboard.mockResolvedValue(false)
                const user = userEvent.setup()
                render(
                    <KlaviyoSetupCard
                        webhookUrl={WEBHOOK_URL}
                        isV3Architecture
                    />,
                )

                const copyButtons = screen.getAllByRole('button', {
                    name: /^copy copy$/i,
                })
                await user.click(copyButtons[1])

                expect(
                    screen.queryByRole('button', { name: /copied!/i }),
                ).not.toBeInTheDocument()
            })
        })

        describe('copy feedback timer', () => {
            beforeEach(() => {
                jest.useFakeTimers()
            })

            afterEach(() => {
                jest.runOnlyPendingTimers()
                jest.useRealTimers()
            })

            it('should revert the URL "Copied!" label back to "Copy" after 1500ms', async () => {
                const user = userEvent.setup({
                    advanceTimers: jest.advanceTimersByTime,
                })
                render(
                    <KlaviyoSetupCard
                        webhookUrl={WEBHOOK_URL}
                        isV3Architecture
                    />,
                )

                const [urlCopyButton] = screen.getAllByRole('button', {
                    name: /^copy copy$/i,
                })
                await user.click(urlCopyButton)

                expect(
                    await screen.findByRole('button', { name: /copied!/i }),
                ).toBeInTheDocument()

                act(() => {
                    jest.advanceTimersByTime(1500)
                })

                await waitFor(() => {
                    expect(
                        screen.queryByRole('button', { name: /copied!/i }),
                    ).not.toBeInTheDocument()
                })
            })

            it('should revert the payload "Copied!" label back to "Copy" after 1500ms', async () => {
                const user = userEvent.setup({
                    advanceTimers: jest.advanceTimersByTime,
                })
                render(
                    <KlaviyoSetupCard
                        webhookUrl={WEBHOOK_URL}
                        isV3Architecture
                    />,
                )

                const copyButtons = screen.getAllByRole('button', {
                    name: /^copy copy$/i,
                })
                await user.click(copyButtons[1])

                expect(
                    await screen.findByRole('button', { name: /copied!/i }),
                ).toBeInTheDocument()

                act(() => {
                    jest.advanceTimersByTime(1500)
                })

                await waitFor(() => {
                    expect(
                        screen.queryByRole('button', { name: /copied!/i }),
                    ).not.toBeInTheDocument()
                })
            })
        })
    })
})
