import { render } from '@repo/testing'
import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { JOURNEY_TYPES } from 'AIJourney/constants'

import { Preview } from './Preview'

jest.mock('AIJourney/providers/JourneyProvider/JourneyProvider', () => ({
    ...jest.requireActual(
        'AIJourney/providers/JourneyProvider/JourneyProvider',
    ),
    useJourneyContext: jest.fn(),
}))

jest.mock('pages/common/hooks/useCollapsibleColumn', () => ({
    useCollapsibleColumn: jest.fn(),
}))

jest.mock('react-hook-form', () => ({
    ...jest.requireActual('react-hook-form'),
    useFormContext: jest.fn(),
    useWatch: jest.fn(),
}))

jest.mock('AIJourney/hooks', () => ({
    ...jest.requireActual('AIJourney/hooks'),
    useGeneratePlaygroundMessage: jest.fn(),
    useAiJourneyStoreConfiguration: jest.fn(),
}))

jest.mock('AIJourney/components', () => ({
    TestingProductCard: jest.fn(({ onProductChange }) => (
        <div>
            <span>TestingProductCard</span>
            <button
                onClick={() =>
                    onProductChange?.({
                        id: 'prod-1',
                        title: 'Test Product',
                        image: { src: 'img.jpg', alt: 'product' },
                        handle: 'test-product',
                        status: 'active',
                        variants: [{ id: 'v1', price: '10.00' }],
                    })
                }
            >
                Change Product
            </button>
        </div>
    )),
    MessageGuidanceCard: jest.fn(() => <div>MessageGuidanceCard</div>),
    PlaygroundPreview: jest.fn(({ onGenerateMessages }) => (
        <div>
            <span>PlaygroundPreview</span>
            <button onClick={onGenerateMessages}>Generate messages</button>
        </div>
    )),
}))

const mockUseJourneyContext =
    require('AIJourney/providers/JourneyProvider/JourneyProvider')
        .useJourneyContext as jest.Mock

const mockUseCollapsibleColumn =
    require('pages/common/hooks/useCollapsibleColumn')
        .useCollapsibleColumn as jest.Mock

const mockUseFormContext = require('react-hook-form')
    .useFormContext as jest.Mock
const mockUseWatch = require('react-hook-form').useWatch as jest.Mock

const mockUseGeneratePlaygroundMessage = require('AIJourney/hooks')
    .useGeneratePlaygroundMessage as jest.Mock

const mockUseAiJourneyStoreConfiguration = require('AIJourney/hooks')
    .useAiJourneyStoreConfiguration as jest.Mock

const mockUseFlag = require('@repo/feature-flags').useFlag as jest.Mock

const mockSetValue = jest.fn()
const mockSetIsCollapsibleColumnOpen = jest.fn()
const mockWarpToCollapsibleColumn = jest.fn(
    (children: React.ReactNode) => children,
)
const mockHandleGenerateMessages = jest.fn()

const defaultJourneyData = {
    id: 'journey-1',
    type: JOURNEY_TYPES.CART_ABANDONMENT,
    configuration: {
        max_follow_up_messages: 2,
        include_image: false,
    },
}

const defaultContextValue = {
    journeyData: defaultJourneyData,
    journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
    currentIntegration: { id: 1, name: 'test-shop' },
    isLoading: false,
    isErrorJourneyData: false,
    shopName: 'test-store',
}

describe('<Preview />', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockUseJourneyContext.mockReturnValue(defaultContextValue)

        mockUseCollapsibleColumn.mockReturnValue({
            setIsCollapsibleColumnOpen: mockSetIsCollapsibleColumnOpen,
            warpToCollapsibleColumn: mockWarpToCollapsibleColumn,
        })

        mockUseFormContext.mockReturnValue({ setValue: mockSetValue })
        mockUseWatch.mockReturnValue('')

        mockUseGeneratePlaygroundMessage.mockReturnValue({
            handleGenerateMessages: mockHandleGenerateMessages,
            playgroundMessages: undefined,
            isGeneratingMessages: false,
        })

        mockUseFlag.mockReturnValue(false)

        mockUseAiJourneyStoreConfiguration.mockReturnValue({
            storeConfiguration: { sms_sender_integration_id: 123 },
            isLoading: false,
        })
    })

    describe('loading state', () => {
        it('should render loading spinner when journey data is loading', () => {
            mockUseJourneyContext.mockReturnValue({
                ...defaultContextValue,
                isLoading: true,
            })

            render(<Preview />)

            expect(
                screen.queryByText('MessageGuidanceCard'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText('PlaygroundPreview'),
            ).not.toBeInTheDocument()
        })
    })

    describe('not found state', () => {
        it('should render a message when journeyData is undefined', () => {
            mockUseJourneyContext.mockReturnValue({
                ...defaultContextValue,
                journeyData: undefined,
                isErrorJourneyData: false,
            })

            render(<Preview />)

            expect(
                screen.getByText(
                    'This flow could not be found. It may not have been created yet.',
                ),
            ).toBeInTheDocument()
        })

        it('should render an error message when journeyData failed to load', () => {
            mockUseJourneyContext.mockReturnValue({
                ...defaultContextValue,
                journeyData: undefined,
                isErrorJourneyData: true,
            })

            render(<Preview />)

            expect(
                screen.getByText(
                    'This flow could not be loaded. Please refresh the page or go back and try again.',
                ),
            ).toBeInTheDocument()
        })
    })

    describe('conditional rendering by journey type', () => {
        it('should render TestingProductCard, MessageGuidanceCard, and PlaygroundPreview for non-welcome non-campaign journeys', () => {
            render(<Preview />)

            expect(screen.getByText('TestingProductCard')).toBeInTheDocument()
            expect(screen.getByText('MessageGuidanceCard')).toBeInTheDocument()
            expect(screen.getByText('PlaygroundPreview')).toBeInTheDocument()
        })

        it('should not render TestingProductCard for welcome journey type', () => {
            mockUseJourneyContext.mockReturnValue({
                ...defaultContextValue,
                journeyData: {
                    ...defaultJourneyData,
                    type: JOURNEY_TYPES.WELCOME,
                },
                journeyType: JOURNEY_TYPES.WELCOME,
            })

            render(<Preview />)

            expect(
                screen.queryByText('TestingProductCard'),
            ).not.toBeInTheDocument()
            expect(screen.getByText('MessageGuidanceCard')).toBeInTheDocument()
            expect(screen.getByText('PlaygroundPreview')).toBeInTheDocument()
        })

        it('should not render TestingProductCard for win-back journey type', () => {
            mockUseJourneyContext.mockReturnValue({
                ...defaultContextValue,
                journeyData: {
                    ...defaultJourneyData,
                    type: JOURNEY_TYPES.WIN_BACK,
                },
                journeyType: JOURNEY_TYPES.WIN_BACK,
            })

            render(<Preview />)

            expect(
                screen.queryByText('TestingProductCard'),
            ).not.toBeInTheDocument()
            expect(screen.getByText('MessageGuidanceCard')).toBeInTheDocument()
            expect(screen.getByText('PlaygroundPreview')).toBeInTheDocument()
        })

        it('should not render TestingProductCard for campaign journey type', () => {
            mockUseJourneyContext.mockReturnValue({
                ...defaultContextValue,
                journeyData: {
                    ...defaultJourneyData,
                    type: JOURNEY_TYPES.CAMPAIGN,
                    configuration: {
                        ...defaultJourneyData.configuration,
                        media_urls: ['https://example.com/campaign.jpg'],
                    },
                },
                journeyType: JOURNEY_TYPES.CAMPAIGN,
            })

            render(<Preview />)

            expect(
                screen.queryByText('TestingProductCard'),
            ).not.toBeInTheDocument()
            expect(screen.getByText('MessageGuidanceCard')).toBeInTheDocument()
            expect(screen.getByText('PlaygroundPreview')).toBeInTheDocument()
        })
    })

    describe('collapsible column', () => {
        it('should open the collapsible column on mount', () => {
            render(<Preview />)

            expect(mockSetIsCollapsibleColumnOpen).toHaveBeenCalledWith(true)
        })

        it('should close the collapsible column on unmount', () => {
            const { unmount } = render(<Preview />)

            unmount()

            expect(mockSetIsCollapsibleColumnOpen).toHaveBeenCalledWith(false)
        })

        it('should wrap PlaygroundPreview using warpToCollapsibleColumn', () => {
            render(<Preview />)

            expect(mockWarpToCollapsibleColumn).toHaveBeenCalled()
            expect(screen.getByText('PlaygroundPreview')).toBeInTheDocument()
        })
    })

    describe('message instructions effect', () => {
        it('should call setValue with message_instructions when journey data has them', () => {
            mockUseJourneyContext.mockReturnValue({
                ...defaultContextValue,
                journeyData: {
                    ...defaultJourneyData,
                    message_instructions: 'Be helpful and concise',
                },
            })

            render(<Preview />)

            expect(mockSetValue).toHaveBeenCalledWith(
                'message_instructions',
                'Be helpful and concise',
            )
        })

        it('should not call setValue when journey data has no message_instructions', () => {
            render(<Preview />)

            expect(mockSetValue).not.toHaveBeenCalled()
        })
    })

    describe('generate messages', () => {
        it('should call handleGenerateMessages when PlaygroundPreview triggers onGenerateMessages', async () => {
            mockHandleGenerateMessages.mockResolvedValue(undefined)
            const user = userEvent.setup()

            render(<Preview />)

            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /generate messages/i }),
                )
            })

            await waitFor(() => {
                expect(mockHandleGenerateMessages).toHaveBeenCalledTimes(1)
            })
        })

        it('should pass campaign media url as campaignImage to PlaygroundPreview', () => {
            const MockPlaygroundPreview = require('AIJourney/components')
                .PlaygroundPreview as jest.Mock

            mockUseJourneyContext.mockReturnValue({
                ...defaultContextValue,
                journeyData: {
                    ...defaultJourneyData,
                    type: JOURNEY_TYPES.CAMPAIGN,
                    configuration: {
                        ...defaultJourneyData.configuration,
                        media_urls: ['https://example.com/campaign-img.jpg'],
                    },
                },
                journeyType: JOURNEY_TYPES.CAMPAIGN,
            })

            render(<Preview />)

            expect(MockPlaygroundPreview).toHaveBeenCalledWith(
                expect.objectContaining({
                    campaignImage: 'https://example.com/campaign-img.jpg',
                }),
                expect.anything(),
            )
        })

        it('should pass undefined campaignImage when campaign has no media_urls', () => {
            const MockPlaygroundPreview = require('AIJourney/components')
                .PlaygroundPreview as jest.Mock

            mockUseJourneyContext.mockReturnValue({
                ...defaultContextValue,
                journeyData: {
                    ...defaultJourneyData,
                    type: JOURNEY_TYPES.CAMPAIGN,
                    configuration: defaultJourneyData.configuration,
                },
                journeyType: JOURNEY_TYPES.CAMPAIGN,
            })

            render(<Preview />)

            expect(MockPlaygroundPreview).toHaveBeenCalledWith(
                expect.objectContaining({ campaignImage: undefined }),
                expect.anything(),
            )
        })

        it('should pass isGenerateDisabled=true to PlaygroundPreview when store settings enabled and sms sender is missing', () => {
            const MockPlaygroundPreview = require('AIJourney/components')
                .PlaygroundPreview as jest.Mock

            mockUseFlag.mockReturnValue(true)
            mockUseAiJourneyStoreConfiguration.mockReturnValue({
                storeConfiguration: { sms_sender_integration_id: null },
                isLoading: false,
            })

            render(<Preview />)

            expect(MockPlaygroundPreview).toHaveBeenCalledWith(
                expect.objectContaining({ isGenerateDisabled: true }),
                expect.anything(),
            )
        })

        it('should pass isGenerateDisabled=false to PlaygroundPreview when store settings enabled and sms sender is present', () => {
            const MockPlaygroundPreview = require('AIJourney/components')
                .PlaygroundPreview as jest.Mock

            mockUseFlag.mockReturnValue(true)
            mockUseAiJourneyStoreConfiguration.mockReturnValue({
                storeConfiguration: { sms_sender_integration_id: 123 },
                isLoading: false,
            })

            render(<Preview />)

            expect(MockPlaygroundPreview).toHaveBeenCalledWith(
                expect.objectContaining({ isGenerateDisabled: false }),
                expect.anything(),
            )
        })

        it('should pass isGenerateDisabled=false to PlaygroundPreview when store settings flag is disabled', () => {
            const MockPlaygroundPreview = require('AIJourney/components')
                .PlaygroundPreview as jest.Mock

            mockUseFlag.mockReturnValue(false)
            mockUseAiJourneyStoreConfiguration.mockReturnValue({
                storeConfiguration: { sms_sender_integration_id: null },
                isLoading: false,
            })

            render(<Preview />)

            expect(MockPlaygroundPreview).toHaveBeenCalledWith(
                expect.objectContaining({ isGenerateDisabled: false }),
                expect.anything(),
            )
        })

        it('should pass undefined sms params and isGenerateDisabled=true when storeConfiguration is null', () => {
            const MockPlaygroundPreview = require('AIJourney/components')
                .PlaygroundPreview as jest.Mock

            mockUseFlag.mockReturnValue(true)
            mockUseAiJourneyStoreConfiguration.mockReturnValue({
                storeConfiguration: null,
                isLoading: false,
            })

            render(<Preview />)

            expect(MockPlaygroundPreview).toHaveBeenCalledWith(
                expect.objectContaining({ isGenerateDisabled: true }),
                expect.anything(),
            )
            expect(mockUseGeneratePlaygroundMessage).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    smsSenderIntegrationId: undefined,
                    smsSenderNumber: undefined,
                    brandName: undefined,
                }),
            )
        })
    })
})
