import { render } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockEmailIntegration,
    mockGmailIntegration,
    mockListIntegrationsHandler,
    mockListIntegrationsResponse,
} from '@gorgias/helpdesk-mocks'

import { ChatShopperExperienceCard } from './ChatShopperExperienceCard'

const supportEmailIntegration = mockEmailIntegration({
    id: 1,
    name: 'Support Email',
    meta: undefined,
    type: 'email',
})
const salesGmailIntegration = mockGmailIntegration({
    id: 2,
    name: 'Sales Gmail',
    meta: undefined,
    type: 'gmail',
})

const listIntegrationsHandler = mockListIntegrationsHandler(
    async ({ request }) => {
        const type = new URL(request.url).searchParams.get('type')

        if (type === 'email') {
            return HttpResponse.json(
                mockListIntegrationsResponse({
                    data: [supportEmailIntegration],
                }),
            )
        }

        if (type === 'gmail') {
            return HttpResponse.json(
                mockListIntegrationsResponse({
                    data: [salesGmailIntegration],
                }),
            )
        }

        return HttpResponse.json(mockListIntegrationsResponse({ data: [] }))
    },
)

const server = setupServer(listIntegrationsHandler.handler)

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

    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    beforeEach(() => {
        jest.clearAllMocks()
    })

    afterEach(() => {
        server.resetHandlers()
    })

    afterAll(() => {
        server.close()
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
        it('should show the selected email when linkedEmailIntegration matches an option', async () => {
            renderComponent({ linkedEmailIntegration: 1 })

            await waitFor(() => {
                expect(
                    screen.getByRole('textbox', { name: /Connect email/ }),
                ).toHaveValue('Support Email')
            })
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
            server.use(
                mockListIntegrationsHandler(async () =>
                    HttpResponse.json(
                        mockListIntegrationsResponse({ data: [] }),
                    ),
                ).handler,
            )
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
            server.use(
                mockListIntegrationsHandler(async () =>
                    HttpResponse.json(undefined),
                ).handler,
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
            server.use(
                mockListIntegrationsHandler(async ({ request }) => {
                    const type = new URL(request.url).searchParams.get('type')

                    return HttpResponse.json(
                        mockListIntegrationsResponse({
                            data:
                                type === 'email'
                                    ? [
                                          mockEmailIntegration({
                                              id: 1,
                                              name: 'Support Email',
                                              meta: {
                                                  ...mockEmailIntegration()
                                                      .meta,
                                                  address:
                                                      'support@example.com',
                                              },
                                          }),
                                      ]
                                    : [],
                        }),
                    )
                }).handler,
            )
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
