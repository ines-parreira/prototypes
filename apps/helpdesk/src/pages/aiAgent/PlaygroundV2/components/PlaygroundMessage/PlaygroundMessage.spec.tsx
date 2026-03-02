import type { ComponentProps } from 'react'

import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { JourneyTypeEnum } from '@gorgias/convert-client'

import {
    AgentSkill,
    AiAgentMessageType,
    MessageType,
    type PlaygroundTextMessage,
} from 'models/aiAgentPlayground/types'
import { AI_AGENT } from 'pages/aiAgent/constants'
import { storeWithActiveSubscriptionWithConvert } from 'pages/settings/new_billing/fixtures'

import {
    playgroundAttachmentFixture,
    playgroundErrorMessageFixture,
    playgroundInternalNoteMessageFixture,
    playgroundMessageFixture,
    playgroundPlaceholderMessageFixture,
    playgroundPromptMessageFixture,
    playgroundTicketEventMessageFixture,
} from '../../../fixtures/playgroundMessages.fixture'
import { CoreProvider } from '../../contexts/CoreContext'
import { SettingsProvider } from '../../contexts/SettingsContext'
import PlaygroundMessage from './PlaygroundMessage'

const mockUseMessagesContext = jest.fn()
const mockUseAIJourneyContext = jest.fn()
let mockIsPolling = false

jest.mock('@repo/routing', () => ({
    ...jest.requireActual('@repo/routing'),
    useSearchParams: jest.fn(() => [new URLSearchParams(), jest.fn()]),
}))

jest.mock('../../contexts/MessagesContext', () => ({
    useMessagesContext: () => mockUseMessagesContext(),
}))

jest.mock('../../contexts/AIJourneyContext', () => ({
    useAIJourneyContext: () => mockUseAIJourneyContext(),
}))

jest.mock('pages/aiAgent/PlaygroundV2/hooks/useTestSession', () => ({
    useTestSession: () => ({
        testSessionId: 'test-session-id',
        isTestSessionLoading: false,
        createTestSession: jest.fn(),
    }),
}))

jest.mock('pages/aiAgent/PlaygroundV2/hooks/usePlaygroundPolling', () => ({
    usePlaygroundPolling: () => ({
        testSessionLogs: undefined,
        isPolling: mockIsPolling,
        startPolling: jest.fn(),
        stopPolling: jest.fn(),
    }),
}))

jest.mock('pages/aiAgent/PlaygroundV2/hooks/useAiAgentHttpIntegration', () => ({
    useAiAgentHttpIntegration: () => ({
        baseUrl: 'http://test.com',
    }),
}))

jest.mock('pages/aiAgent/PlaygroundV2/hooks/usePlaygroundChannel', () => ({
    usePlaygroundChannel: () => ({
        channel: 'chat',
        channelAvailability: 'online',
        onChannelChange: jest.fn(),
        onChannelAvailabilityChange: jest.fn(),
        resetToDefaultChannel: jest.fn(),
    }),
}))

const renderComponent = (
    props?: Partial<ComponentProps<typeof PlaygroundMessage>>,
    supportedModes?: ('inbound' | 'outbound')[],
) => {
    return render(
        <Provider
            store={configureMockStore()(storeWithActiveSubscriptionWithConvert)}
        >
            <CoreProvider>
                <SettingsProvider supportedModes={supportedModes}>
                    <PlaygroundMessage
                        channel="email"
                        message={playgroundMessageFixture}
                        {...props}
                    />
                </SettingsProvider>
            </CoreProvider>
        </Provider>,
    )
}
describe('PlaygroundMessage', () => {
    beforeEach(() => {
        mockIsPolling = false
        mockUseMessagesContext.mockReturnValue({
            messages: [],
            onMessageSend: jest.fn(),
            isMessageSending: false,
            onNewConversation: jest.fn(),
            isWaitingResponse: false,
            draftMessage: '',
            draftSubject: '',
            setDraftMessage: jest.fn(),
            setDraftSubject: jest.fn(),
        })

        mockUseAIJourneyContext.mockReturnValue({
            aiJourneySettings: {
                journeyType: null,
                selectedProduct: null,
                totalFollowUp: 1,
                includeProductImage: false,
                includeDiscountCode: false,
                discountCodeValue: 0,
                discountCodeMessageIdx: 0,
                outboundMessageInstructions: '',
            },
            setAIJourneySettings: jest.fn(),
            resetAIJourneySettings: jest.fn(),
            saveAIJourneySettings: jest.fn(),
            shopifyIntegration: undefined,
            journeys: [],
            shopName: '',
            isLoadingJourneys: false,
            isLoadingJourneyData: false,
            isSavingJourneyData: false,
            followUpMessagesSent: 0,
            setFollowUpMessagesSent: jest.fn(),
            currentJourney: undefined,
            journeyConfiguration: undefined,
            productList: [],
            isLoadingProducts: false,
        })
    })

    it('should render placeholder message', () => {
        mockIsPolling = true
        renderComponent({ message: playgroundPlaceholderMessageFixture })

        expect(screen.getByText('Thinking...')).toBeInTheDocument()
    })

    it('should not render placeholder message when polling is disabled', () => {
        renderComponent({ message: playgroundPlaceholderMessageFixture })

        expect(screen.queryByText('Thinking...')).not.toBeInTheDocument()
    })

    it('should render error message', () => {
        renderComponent({ message: playgroundErrorMessageFixture })
        expect(
            screen.getByText(playgroundErrorMessageFixture.content as string),
        ).toBeInTheDocument()
        expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('should render message', () => {
        renderComponent({ message: playgroundMessageFixture })
        expect(
            screen.getByText(playgroundMessageFixture.content),
        ).toBeInTheDocument()
    })

    it('should render markdown content as HTML', () => {
        const { container } = renderComponent({
            message: {
                ...playgroundMessageFixture,
                content: '**bold text**',
            },
        })

        expect(screen.getByText('bold text')).toBeInTheDocument()
        expect(container.querySelector('strong')).toBeInTheDocument()
    })

    it('should render pre-existing HTML content without double-encoding (backwards compatibility with marked)', () => {
        const { container } = renderComponent({
            message: {
                ...playgroundMessageFixture,
                content: '<p>Hello <strong>world</strong></p>',
            },
        })

        expect(screen.getByText('world')).toBeInTheDocument()
        expect(container.querySelector('strong')).toBeInTheDocument()
        expect(screen.queryByText('<strong>')).not.toBeInTheDocument()
    })

    it('should render AI Agent internal note', () => {
        renderComponent({
            message: { ...playgroundMessageFixture, sender: AI_AGENT },
        })
        expect(screen.getByText(AI_AGENT)).toBeInTheDocument()
    })

    it('should render chat icon when channel is chat', () => {
        renderComponent({
            channel: 'chat',
            message: { ...playgroundMessageFixture, sender: AI_AGENT },
        })
        expect(screen.getByTitle('chat channel')).toBeInTheDocument()
        expect(screen.getByText('forum')).toBeInTheDocument()
        expect(screen.queryByText('Dark Roast')).not.toBeInTheDocument()
    })

    it('should render email icon when channel is email', () => {
        renderComponent({
            channel: 'email',
            message: { ...playgroundMessageFixture, sender: AI_AGENT },
        })
        expect(screen.getByTitle('email channel')).toBeInTheDocument()
        expect(screen.getByText('mail')).toBeInTheDocument()
    })

    it('should render sms icon when channel is sms', () => {
        renderComponent({
            channel: 'sms',
            message: { ...playgroundMessageFixture, sender: AI_AGENT },
        })
        expect(screen.getByTitle('sms channel')).toBeInTheDocument()
        expect(screen.getByText('sms')).toBeInTheDocument()
    })

    it('should render products carousel when message contains attachments', () => {
        renderComponent({
            channel: 'chat',
            message: {
                ...playgroundMessageFixture,
                sender: AI_AGENT,
                attachments: [playgroundAttachmentFixture],
            },
        })
        expect(screen.getByText('Dark Roast')).toBeInTheDocument()
    })

    it('should not render products carousel when not type application/productCard', () => {
        renderComponent({
            channel: 'chat',
            message: {
                ...playgroundMessageFixture,
                sender: AI_AGENT,
                attachments: [
                    { ...playgroundAttachmentFixture, content_type: 'random' },
                ],
            },
        })
        expect(screen.queryByText('Dark Roast')).not.toBeInTheDocument()
    })

    it('should open a new tab when user clicks on the product in the carousel', async () => {
        const user = userEvent.setup()
        renderComponent({
            channel: 'chat',
            message: {
                ...playgroundMessageFixture,
                sender: AI_AGENT,
                attachments: [playgroundAttachmentFixture],
            },
        })

        await user.click(screen.getByRole('button', { name: 'Select Options' }))

        expect(window.open).toHaveBeenCalledWith(
            'https://coffee-gorgias-store.myshopify.com/products/dark-roast?variant=35734251045016',
            '_blank',
        )
    })

    it.each([
        {
            type: MessageType.ERROR,
            messageFixture: playgroundErrorMessageFixture,
        },
        {
            type: MessageType.PLACEHOLDER,
            messageFixture: playgroundPlaceholderMessageFixture,
        },
        {
            type: MessageType.INTERNAL_NOTE,
            messageFixture: playgroundInternalNoteMessageFixture,
        },
        {
            type: MessageType.PROMPT,
            messageFixture: playgroundPromptMessageFixture,
        },
        {
            type: MessageType.TICKET_EVENT,
            messageFixture: playgroundTicketEventMessageFixture,
        },
    ])(
        "should not render agent's skill badge if message is of type $0",
        ({ messageFixture }) => {
            renderComponent({ message: messageFixture })
            expect(
                screen.queryByText(AgentSkill.SUPPORT),
            ).not.toBeInTheDocument()
            expect(screen.queryByText(AgentSkill.SALES)).not.toBeInTheDocument()
        },
    )

    it("should not render agent's skill badge if there is none", () => {
        renderComponent({
            message: { ...playgroundMessageFixture, sender: AI_AGENT },
        })
        expect(screen.queryByText('SUPPORT')).not.toBeInTheDocument()
        expect(screen.queryByText('SALES')).not.toBeInTheDocument()
    })

    it('should render children when provided', () => {
        const childContent = 'This is a child component'
        renderComponent({
            message: playgroundMessageFixture,
            children: <div data-testid="child-component">{childContent}</div>,
        })

        expect(screen.getByTestId('child-component')).toBeInTheDocument()
        expect(screen.getByText(childContent)).toBeInTheDocument()
    })

    it('should add hover class for AI agent messages', () => {
        const { container } = renderComponent({
            message: {
                ...playgroundMessageFixture,
                sender: AI_AGENT,
                type: MessageType.MESSAGE,
            },
        })

        const messageContainer = container.querySelector('.messageContainer')
        expect(messageContainer).toHaveClass('messageContainerHover')
    })

    it('should not add hover class for non-AI agent messages', () => {
        const { container } = renderComponent({
            message: {
                ...playgroundMessageFixture,
                sender: 'customer',
                type: MessageType.MESSAGE,
            },
        })

        const messageContainer = container.querySelector('.messageContainer')
        expect(messageContainer).not.toHaveClass('messageContainerHover')
    })

    it('should add data-agent-message attribute for AI agent messages', () => {
        const { container } = renderComponent({
            message: {
                ...playgroundMessageFixture,
                sender: AI_AGENT,
                type: MessageType.MESSAGE,
            },
        })

        const messageContainer = container.querySelector('.messageContainer')
        expect(messageContainer).toHaveAttribute('data-agent-message', 'true')
    })

    it('should add data-agent-message attribute for non-AI agent messages', () => {
        const { container } = renderComponent({
            message: {
                ...playgroundMessageFixture,
                sender: 'customer',
                type: MessageType.MESSAGE,
            },
        })

        const messageContainer = container.querySelector('.messageContainer')
        expect(messageContainer).toHaveAttribute('data-agent-message', 'false')
    })

    describe('Journey image rendering', () => {
        const mockProduct = {
            id: 123,
            title: 'Test Product',
            created_at: '2024-01-01',
            image: {
                id: 1,
                alt: 'Test Product Image',
                src: 'https://example.com/product.jpg',
                variant_ids: [],
            },
            images: [],
            options: [],
            variants: [],
        }

        it('should render journey image when it is the first message and includeProductImage is true', () => {
            const firstMessage = {
                ...playgroundMessageFixture,
                sender: AI_AGENT,
                createdDatetime: '2021-06-01T12:00:00',
            }

            mockUseMessagesContext.mockReturnValue({
                messages: [firstMessage],
                onMessageSend: jest.fn(),
                isMessageSending: false,
                onNewConversation: jest.fn(),
                isWaitingResponse: false,
                draftMessage: '',
                draftSubject: '',
                setDraftMessage: jest.fn(),
                setDraftSubject: jest.fn(),
            })

            mockUseAIJourneyContext.mockReturnValue({
                aiJourneySettings: {
                    journeyType: null,
                    selectedProduct: mockProduct,
                    totalFollowUp: 1,
                    includeProductImage: true,
                    includeDiscountCode: false,
                    discountCodeValue: 0,
                    discountCodeMessageIdx: 0,
                    outboundMessageInstructions: '',
                },
                setAIJourneySettings: jest.fn(),
                resetAIJourneySettings: jest.fn(),
                saveAIJourneySettings: jest.fn(),
                shopifyIntegration: undefined,
                journeys: [],
                shopName: '',
                isLoadingJourneys: false,
                isLoadingJourneyData: false,
                isSavingJourneyData: false,
                followUpMessagesSent: 0,
                setFollowUpMessagesSent: jest.fn(),
                currentJourney: undefined,
                journeyConfiguration: undefined,
                productList: [mockProduct],
                isLoadingProducts: false,
            })

            renderComponent({ message: firstMessage }, ['outbound'])

            const image = screen.getByAltText(mockProduct.title)
            expect(image).toBeInTheDocument()
            expect(image).toHaveAttribute('src', mockProduct.image.src)
        })

        it('should not render journey image when mode is inbound', () => {
            const firstMessage = {
                ...playgroundMessageFixture,
                sender: AI_AGENT,
                createdDatetime: '2021-06-01T12:00:00',
            }

            mockUseMessagesContext.mockReturnValue({
                messages: [firstMessage],
                onMessageSend: jest.fn(),
                isMessageSending: false,
                onNewConversation: jest.fn(),
                isWaitingResponse: false,
                draftMessage: '',
                draftSubject: '',
                setDraftMessage: jest.fn(),
                setDraftSubject: jest.fn(),
            })

            mockUseAIJourneyContext.mockReturnValue({
                aiJourneySettings: {
                    journeyType: null,
                    selectedProduct: mockProduct,
                    totalFollowUp: 1,
                    includeProductImage: true,
                    includeDiscountCode: false,
                    discountCodeValue: 0,
                    discountCodeMessageIdx: 0,
                    outboundMessageInstructions: '',
                },
                setAIJourneySettings: jest.fn(),
                resetAIJourneySettings: jest.fn(),
                saveAIJourneySettings: jest.fn(),
                shopifyIntegration: undefined,
                journeys: [],
                shopName: '',
                isLoadingJourneys: false,
                isLoadingJourneyData: false,
                isSavingJourneyData: false,
                followUpMessagesSent: 0,
                setFollowUpMessagesSent: jest.fn(),
                currentJourney: undefined,
                journeyConfiguration: undefined,
                productList: [mockProduct],
                isLoadingProducts: false,
            })

            renderComponent({ message: firstMessage }, ['inbound'])

            expect(
                screen.queryByAltText(mockProduct.title),
            ).not.toBeInTheDocument()
        })

        it('should not render journey image when includeProductImage is false', () => {
            const firstMessage = {
                ...playgroundMessageFixture,
                sender: AI_AGENT,
                createdDatetime: '2021-06-01T12:00:00',
            }

            mockUseMessagesContext.mockReturnValue({
                messages: [firstMessage],
                onMessageSend: jest.fn(),
                isMessageSending: false,
                onNewConversation: jest.fn(),
                isWaitingResponse: false,
                draftMessage: '',
                draftSubject: '',
                setDraftMessage: jest.fn(),
                setDraftSubject: jest.fn(),
            })

            mockUseAIJourneyContext.mockReturnValue({
                aiJourneySettings: {
                    journeyType: null,
                    selectedProduct: mockProduct,
                    totalFollowUp: 1,
                    includeProductImage: false,
                    includeDiscountCode: false,
                    discountCodeValue: 0,
                    discountCodeMessageIdx: 0,
                    outboundMessageInstructions: '',
                },
                setAIJourneySettings: jest.fn(),
                resetAIJourneySettings: jest.fn(),
                saveAIJourneySettings: jest.fn(),
                shopifyIntegration: undefined,
                journeys: [],
                shopName: '',
                isLoadingJourneys: false,
                isLoadingJourneyData: false,
                isSavingJourneyData: false,
                followUpMessagesSent: 0,
                setFollowUpMessagesSent: jest.fn(),
                currentJourney: undefined,
                journeyConfiguration: undefined,
                productList: [mockProduct],
                isLoadingProducts: false,
            })

            renderComponent({ message: firstMessage }, ['outbound'])

            expect(
                screen.queryByAltText(mockProduct.title),
            ).not.toBeInTheDocument()
        })

        it('should not render journey image when selectedProduct is null', () => {
            const firstMessage = {
                ...playgroundMessageFixture,
                sender: AI_AGENT,
                createdDatetime: '2021-06-01T12:00:00',
            }

            mockUseMessagesContext.mockReturnValue({
                messages: [firstMessage],
                onMessageSend: jest.fn(),
                isMessageSending: false,
                onNewConversation: jest.fn(),
                isWaitingResponse: false,
                draftMessage: '',
                draftSubject: '',
                setDraftMessage: jest.fn(),
                setDraftSubject: jest.fn(),
            })

            mockUseAIJourneyContext.mockReturnValue({
                aiJourneySettings: {
                    journeyType: null,
                    selectedProduct: null,
                    totalFollowUp: 1,
                    includeProductImage: true,
                    includeDiscountCode: false,
                    discountCodeValue: 0,
                    discountCodeMessageIdx: 0,
                    outboundMessageInstructions: '',
                },
                setAIJourneySettings: jest.fn(),
                resetAIJourneySettings: jest.fn(),
                saveAIJourneySettings: jest.fn(),
                shopifyIntegration: undefined,
                journeys: [],
                shopName: '',
                isLoadingJourneys: false,
                isLoadingJourneyData: false,
                isSavingJourneyData: false,
                followUpMessagesSent: 0,
                setFollowUpMessagesSent: jest.fn(),
                currentJourney: undefined,
                journeyConfiguration: undefined,
                productList: [],
                isLoadingProducts: false,
            })

            renderComponent({ message: firstMessage }, ['outbound'])

            expect(
                screen.queryByAltText(mockProduct.title),
            ).not.toBeInTheDocument()
        })

        it('should not render journey image when message is not the first message', () => {
            const firstMessage = {
                ...playgroundMessageFixture,
                sender: AI_AGENT,
                createdDatetime: '2021-06-01T12:00:00',
            }

            const secondMessage = {
                ...playgroundMessageFixture,
                sender: AI_AGENT,
                createdDatetime: '2021-06-01T12:01:00',
            }

            mockUseMessagesContext.mockReturnValue({
                messages: [firstMessage, secondMessage],
                onMessageSend: jest.fn(),
                isMessageSending: false,
                onNewConversation: jest.fn(),
                isWaitingResponse: false,
                draftMessage: '',
                draftSubject: '',
                setDraftMessage: jest.fn(),
                setDraftSubject: jest.fn(),
            })

            mockUseAIJourneyContext.mockReturnValue({
                aiJourneySettings: {
                    journeyType: null,
                    selectedProduct: mockProduct,
                    totalFollowUp: 1,
                    includeProductImage: true,
                    includeDiscountCode: false,
                    discountCodeValue: 0,
                    discountCodeMessageIdx: 0,
                    outboundMessageInstructions: '',
                },
                setAIJourneySettings: jest.fn(),
                resetAIJourneySettings: jest.fn(),
                saveAIJourneySettings: jest.fn(),
                shopifyIntegration: undefined,
                journeys: [],
                shopName: '',
                isLoadingJourneys: false,
                isLoadingJourneyData: false,
                isSavingJourneyData: false,
                followUpMessagesSent: 0,
                setFollowUpMessagesSent: jest.fn(),
                currentJourney: undefined,
                journeyConfiguration: undefined,
                productList: [mockProduct],
                isLoadingProducts: false,
            })

            renderComponent({ message: secondMessage }, ['outbound'])

            expect(
                screen.queryByAltText(mockProduct.title),
            ).not.toBeInTheDocument()
        })

        it('should render journey image with undefined src when product has no image', () => {
            const productWithoutImage = {
                ...mockProduct,
                image: null,
            }

            const firstMessage = {
                ...playgroundMessageFixture,
                sender: AI_AGENT,
                createdDatetime: '2021-06-01T12:00:00',
            }

            mockUseMessagesContext.mockReturnValue({
                messages: [firstMessage],
                onMessageSend: jest.fn(),
                isMessageSending: false,
                onNewConversation: jest.fn(),
                isWaitingResponse: false,
                draftMessage: '',
                draftSubject: '',
                setDraftMessage: jest.fn(),
                setDraftSubject: jest.fn(),
            })

            mockUseAIJourneyContext.mockReturnValue({
                aiJourneySettings: {
                    journeyType: null,
                    selectedProduct: productWithoutImage,
                    totalFollowUp: 1,
                    includeProductImage: true,
                    includeDiscountCode: false,
                    discountCodeValue: 0,
                    discountCodeMessageIdx: 0,
                    outboundMessageInstructions: '',
                },
                setAIJourneySettings: jest.fn(),
                resetAIJourneySettings: jest.fn(),
                saveAIJourneySettings: jest.fn(),
                shopifyIntegration: undefined,
                journeys: [],
                shopName: '',
                isLoadingJourneys: false,
                isLoadingJourneyData: false,
                isSavingJourneyData: false,
                followUpMessagesSent: 0,
                setFollowUpMessagesSent: jest.fn(),
                currentJourney: undefined,
                journeyConfiguration: undefined,
                productList: [productWithoutImage],
                isLoadingProducts: false,
            })

            renderComponent({ message: firstMessage }, ['outbound'])

            const image = screen.getByAltText(productWithoutImage.title)
            expect(image).toBeInTheDocument()
            expect(image).not.toHaveAttribute('src')
        })

        describe('Campaign journey image', () => {
            const mockMediaUrls = [
                {
                    url: 'https://example.com/campaign-image.jpg',
                    name: 'Campaign Image',
                },
            ]

            const firstMessage = {
                ...playgroundMessageFixture,
                sender: AI_AGENT,
                createdDatetime: '2021-06-01T12:00:00',
            }

            const campaignJourney = {
                type: JourneyTypeEnum.Campaign,
                id: 'campaign-1',
                state: 'active',
            }

            beforeEach(() => {
                mockUseMessagesContext.mockReturnValue({
                    messages: [firstMessage],
                    onMessageSend: jest.fn(),
                    isMessageSending: false,
                    onNewConversation: jest.fn(),
                    isWaitingResponse: false,
                    draftMessage: '',
                    draftSubject: '',
                    setDraftMessage: jest.fn(),
                    setDraftSubject: jest.fn(),
                })
            })

            it('should render campaign media image when journey is Campaign type and mediaUrls has items', () => {
                mockUseAIJourneyContext.mockReturnValue({
                    aiJourneySettings: {
                        journeyType: null,
                        selectedProduct: null,
                        totalFollowUp: 1,
                        includeProductImage: false,
                        includeDiscountCode: false,
                        discountCodeValue: 0,
                        discountCodeMessageIdx: 0,
                        outboundMessageInstructions: '',
                        mediaUrls: mockMediaUrls,
                    },
                    setAIJourneySettings: jest.fn(),
                    resetAIJourneySettings: jest.fn(),
                    saveAIJourneySettings: jest.fn(),
                    shopifyIntegration: undefined,
                    journeys: [],
                    shopName: '',
                    isLoadingJourneys: false,
                    isLoadingJourneyData: false,
                    isSavingJourneyData: false,
                    followUpMessagesSent: 0,
                    setFollowUpMessagesSent: jest.fn(),
                    currentJourney: campaignJourney,
                    journeyConfiguration: undefined,
                    productList: [],
                    isLoadingProducts: false,
                })

                renderComponent({ message: firstMessage }, ['outbound'])

                const image = screen.getByAltText(mockMediaUrls[0].name)
                expect(image).toBeInTheDocument()
                expect(image).toHaveAttribute('src', mockMediaUrls[0].url)
            })

            it('should not render image when journey is Campaign type but mediaUrls is empty', () => {
                mockUseAIJourneyContext.mockReturnValue({
                    aiJourneySettings: {
                        journeyType: null,
                        selectedProduct: null,
                        totalFollowUp: 1,
                        includeProductImage: false,
                        includeDiscountCode: false,
                        discountCodeValue: 0,
                        discountCodeMessageIdx: 0,
                        outboundMessageInstructions: '',
                        mediaUrls: [],
                    },
                    setAIJourneySettings: jest.fn(),
                    resetAIJourneySettings: jest.fn(),
                    saveAIJourneySettings: jest.fn(),
                    shopifyIntegration: undefined,
                    journeys: [],
                    shopName: '',
                    isLoadingJourneys: false,
                    isLoadingJourneyData: false,
                    isSavingJourneyData: false,
                    followUpMessagesSent: 0,
                    setFollowUpMessagesSent: jest.fn(),
                    currentJourney: campaignJourney,
                    journeyConfiguration: undefined,
                    productList: [],
                    isLoadingProducts: false,
                })

                renderComponent({ message: firstMessage }, ['outbound'])

                expect(
                    screen.queryByAltText(mockMediaUrls[0].name),
                ).not.toBeInTheDocument()
            })

            it('should not render image when journey is Campaign type but mediaUrls is undefined', () => {
                mockUseAIJourneyContext.mockReturnValue({
                    aiJourneySettings: {
                        journeyType: null,
                        selectedProduct: null,
                        totalFollowUp: 1,
                        includeProductImage: false,
                        includeDiscountCode: false,
                        discountCodeValue: 0,
                        discountCodeMessageIdx: 0,
                        outboundMessageInstructions: '',
                        mediaUrls: undefined,
                    },
                    setAIJourneySettings: jest.fn(),
                    resetAIJourneySettings: jest.fn(),
                    saveAIJourneySettings: jest.fn(),
                    shopifyIntegration: undefined,
                    journeys: [],
                    shopName: '',
                    isLoadingJourneys: false,
                    isLoadingJourneyData: false,
                    isSavingJourneyData: false,
                    followUpMessagesSent: 0,
                    setFollowUpMessagesSent: jest.fn(),
                    currentJourney: campaignJourney,
                    journeyConfiguration: undefined,
                    productList: [],
                    isLoadingProducts: false,
                })

                renderComponent({ message: firstMessage }, ['outbound'])

                expect(
                    screen.queryByAltText(mockMediaUrls[0].name),
                ).not.toBeInTheDocument()
            })

            it('should not render campaign image when mode is inbound even if mediaUrls has items', () => {
                mockUseAIJourneyContext.mockReturnValue({
                    aiJourneySettings: {
                        journeyType: null,
                        selectedProduct: null,
                        totalFollowUp: 1,
                        includeProductImage: false,
                        includeDiscountCode: false,
                        discountCodeValue: 0,
                        discountCodeMessageIdx: 0,
                        outboundMessageInstructions: '',
                        mediaUrls: mockMediaUrls,
                    },
                    setAIJourneySettings: jest.fn(),
                    resetAIJourneySettings: jest.fn(),
                    saveAIJourneySettings: jest.fn(),
                    shopifyIntegration: undefined,
                    journeys: [],
                    shopName: '',
                    isLoadingJourneys: false,
                    isLoadingJourneyData: false,
                    isSavingJourneyData: false,
                    followUpMessagesSent: 0,
                    setFollowUpMessagesSent: jest.fn(),
                    currentJourney: campaignJourney,
                    journeyConfiguration: undefined,
                    productList: [],
                    isLoadingProducts: false,
                })

                renderComponent({ message: firstMessage }, ['inbound'])

                expect(
                    screen.queryByAltText(mockMediaUrls[0].name),
                ).not.toBeInTheDocument()
            })
        })
    })

    describe('AuthenticationWarningBanner rendering', () => {
        it('should render authentication warning banner when message type is REQUEST_CUSTOMER_AUTHENTICATION in inbound mode', () => {
            const authenticationMessage: PlaygroundTextMessage = {
                ...playgroundMessageFixture,
                sender: AI_AGENT,
                aiAgentMessageType:
                    AiAgentMessageType.REQUEST_CUSTOMER_AUTHENTICATION,
            }

            renderComponent({ message: authenticationMessage }, ['inbound'])

            expect(
                screen.getByText(/Authentication doesn't work in test mode/i),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    /The AI Agent asked the customer to verify their identity/i,
                ),
            ).toBeInTheDocument()
            expect(screen.getByText('Select a customer')).toBeInTheDocument()
            expect(
                screen.getByText(
                    /in the test configuration to test order-related flows/i,
                ),
            ).toBeInTheDocument()
        })
    })
})
