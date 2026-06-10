import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useListIntegrations } from '@gorgias/helpdesk-queries'

import { ChatShopperExperienceCard } from './ChatShopperExperienceCard'

jest.mock('@gorgias/helpdesk-queries', () => ({
    useListIntegrations: jest.fn(),
}))

const mockUseListIntegrations = useListIntegrations as jest.MockedFunction<
    typeof useListIntegrations
>

const buildMockResponse = (
    integrations: Array<{ id: number; name: string; type: string }>,
) =>
    ({
        data: { data: { data: integrations } },
    }) as unknown as ReturnType<typeof useListIntegrations>

const emptyResponse = buildMockResponse([])

describe('ChatShopperExperienceCard', () => {
    const defaultProps = {
        linkedEmailIntegration: null,
        sendChatTranscript: false,
        sendCsat: false,
        onLinkedEmailIntegrationChange: jest.fn(),
        onSendChatTranscriptChange: jest.fn(),
        onSendCsatChange: jest.fn(),
    }

    const renderComponent = (props = {}) => {
        return render(
            <ChatShopperExperienceCard {...defaultProps} {...props} />,
        )
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseListIntegrations.mockImplementation((params) => {
            if (params?.type === 'email') {
                return buildMockResponse([
                    { id: 1, name: 'Support Email', type: 'email' },
                ])
            }
            if (params?.type === 'gmail') {
                return buildMockResponse([
                    { id: 2, name: 'Sales Gmail', type: 'gmail' },
                ])
            }
            return emptyResponse
        })
    })

    it('should render the card heading', () => {
        renderComponent()

        expect(
            screen.getByRole('heading', { name: 'Shopper experience' }),
        ).toBeInTheDocument()
    })

    it('should render the card description', () => {
        renderComponent()

        expect(
            screen.getByText(
                'Customize how shoppers experience chat after the conversation.',
            ),
        ).toBeInTheDocument()
    })

    it('should render the Connect email select field', () => {
        renderComponent()

        expect(
            screen.getByRole('button', { name: /Connect email/ }),
        ).toBeInTheDocument()
    })

    it('should render the select field caption', () => {
        renderComponent()

        expect(
            screen.getByText(
                'Used for conversation transcripts, offline confirmations, and satisfaction surveys.',
            ),
        ).toBeInTheDocument()
    })

    it('should render email integrations from all email types as options', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole('button', { name: /Connect email/ }))

        expect(
            await screen.findByRole('option', { name: 'Support Email' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('option', { name: 'Sales Gmail' }),
        ).toBeInTheDocument()
    })

    it('should render the Send conversation transcripts checkbox', () => {
        renderComponent()

        expect(
            screen.getByLabelText('Send conversation transcripts to shoppers'),
        ).toBeInTheDocument()
    })

    it('should render the Send CSAT checkbox', () => {
        renderComponent()

        expect(screen.getByLabelText('Send CSAT')).toBeInTheDocument()
    })

    describe('Send conversation transcripts checkbox state', () => {
        it('should render checked when sendChatTranscript is true', () => {
            renderComponent({ sendChatTranscript: true })

            expect(
                screen.getByLabelText(
                    'Send conversation transcripts to shoppers',
                ),
            ).toBeChecked()
        })

        it('should render unchecked when sendChatTranscript is false', () => {
            renderComponent({ sendChatTranscript: false })

            expect(
                screen.getByLabelText(
                    'Send conversation transcripts to shoppers',
                ),
            ).not.toBeChecked()
        })

        it('should call onSendChatTranscriptChange when toggled on', async () => {
            const user = userEvent.setup()
            const onSendChatTranscriptChange = jest.fn()
            renderComponent({
                sendChatTranscript: false,
                onSendChatTranscriptChange,
            })

            await user.click(
                screen.getByLabelText(
                    'Send conversation transcripts to shoppers',
                ),
            )

            expect(onSendChatTranscriptChange).toHaveBeenCalledWith(true)
        })

        it('should call onSendChatTranscriptChange when toggled off', async () => {
            const user = userEvent.setup()
            const onSendChatTranscriptChange = jest.fn()
            renderComponent({
                sendChatTranscript: true,
                onSendChatTranscriptChange,
            })

            await user.click(
                screen.getByLabelText(
                    'Send conversation transcripts to shoppers',
                ),
            )

            expect(onSendChatTranscriptChange).toHaveBeenCalledWith(false)
        })
    })

    describe('Send CSAT checkbox state', () => {
        it('should render checked when sendCsat is true', () => {
            renderComponent({ sendCsat: true })

            expect(screen.getByLabelText('Send CSAT')).toBeChecked()
        })

        it('should render unchecked when sendCsat is false', () => {
            renderComponent({ sendCsat: false })

            expect(screen.getByLabelText('Send CSAT')).not.toBeChecked()
        })

        it('should call onSendCsatChange when toggled on', async () => {
            const user = userEvent.setup()
            const onSendCsatChange = jest.fn()
            renderComponent({ sendCsat: false, onSendCsatChange })

            await user.click(screen.getByLabelText('Send CSAT'))

            expect(onSendCsatChange).toHaveBeenCalledWith(true)
        })

        it('should call onSendCsatChange when toggled off', async () => {
            const user = userEvent.setup()
            const onSendCsatChange = jest.fn()
            renderComponent({ sendCsat: true, onSendCsatChange })

            await user.click(screen.getByLabelText('Send CSAT'))

            expect(onSendCsatChange).toHaveBeenCalledWith(false)
        })
    })

    describe('Connect email select', () => {
        it('should show the selected email when linkedEmailIntegration matches an option', () => {
            renderComponent({ linkedEmailIntegration: 1 })

            expect(
                screen.getByRole('textbox', { name: /Connect email/ }),
            ).toHaveValue('Support Email')
        })

        it('should show the placeholder when linkedEmailIntegration is null', () => {
            renderComponent({ linkedEmailIntegration: null })

            expect(screen.getByPlaceholderText('Select an email')).toHaveValue(
                '',
            )
        })

        it('should call onLinkedEmailIntegrationChange with the selected id', async () => {
            const user = userEvent.setup()
            const onLinkedEmailIntegrationChange = jest.fn()
            renderComponent({ onLinkedEmailIntegrationChange })

            await user.click(
                screen.getByRole('button', { name: /Connect email/ }),
            )
            await user.click(
                await screen.findByRole('option', { name: 'Sales Gmail' }),
            )

            expect(onLinkedEmailIntegrationChange).toHaveBeenCalledWith(2)
        })

        it('should render empty list when no integrations are available', async () => {
            const user = userEvent.setup()
            mockUseListIntegrations.mockReturnValue(emptyResponse)
            renderComponent()

            await user.click(
                screen.getByRole('button', { name: /Connect email/ }),
            )

            expect(
                screen.queryByRole('option', { name: 'Support Email' }),
            ).not.toBeInTheDocument()
        })

        it('should handle undefined data from useListIntegrations gracefully', async () => {
            const user = userEvent.setup()
            mockUseListIntegrations.mockReturnValue(
                {} as unknown as ReturnType<typeof useListIntegrations>,
            )
            renderComponent()

            const trigger = screen.getByRole('button', {
                name: /Connect email/,
            })
            expect(trigger).toBeInTheDocument()

            await user.click(trigger)

            expect(
                screen.queryByRole('option', { name: 'Support Email' }),
            ).not.toBeInTheDocument()
        })

        it('should format option as "Name <address>" when integration has an address', async () => {
            const user = userEvent.setup()
            mockUseListIntegrations.mockImplementation((params) => {
                if (params?.type === 'email') {
                    return {
                        data: {
                            data: {
                                data: [
                                    {
                                        id: 1,
                                        name: 'Support Email',
                                        meta: {
                                            address: 'support@example.com',
                                        },
                                    },
                                ],
                            },
                        },
                    } as unknown as ReturnType<typeof useListIntegrations>
                }
                return emptyResponse
            })
            renderComponent()

            await user.click(
                screen.getByRole('button', { name: /Connect email/ }),
            )

            expect(
                await screen.findByRole('option', {
                    name: 'Support Email <support@example.com>',
                }),
            ).toBeInTheDocument()
        })
    })
})
