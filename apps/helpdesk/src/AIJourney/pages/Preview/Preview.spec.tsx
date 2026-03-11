import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { JOURNEY_TYPES } from 'AIJourney/constants'
import { renderWithRouter } from 'utils/testing'

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

jest.mock(
    'AIJourney/hooks/useAIJourneyProductList/useAIJourneyProductList',
    () => ({ useAIJourneyProductList: jest.fn() }),
)

jest.mock('AIJourney/hooks', () => ({
    ...jest.requireActual('AIJourney/hooks'),
    useGeneratePlaygroundMessage: jest.fn(),
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

const mockUseAIJourneyProductList =
    require('AIJourney/hooks/useAIJourneyProductList/useAIJourneyProductList')
        .useAIJourneyProductList as jest.Mock

const mockUseGeneratePlaygroundMessage = require('AIJourney/hooks')
    .useGeneratePlaygroundMessage as jest.Mock

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

        mockUseAIJourneyProductList.mockReturnValue({
            productList: [],
            isLoading: false,
        })

        mockUseGeneratePlaygroundMessage.mockReturnValue({
            handleGenerateMessages: mockHandleGenerateMessages,
            playgroundMessages: undefined,
            isGeneratingMessages: false,
        })
    })

    describe('loading state', () => {
        it('should render loading spinner when journey data is loading', () => {
            mockUseJourneyContext.mockReturnValue({
                ...defaultContextValue,
                isLoading: true,
            })

            renderWithRouter(<Preview />)

            expect(
                screen.queryByText('MessageGuidanceCard'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText('PlaygroundPreview'),
            ).not.toBeInTheDocument()
        })

        it('should render loading spinner when product list is loading', () => {
            mockUseAIJourneyProductList.mockReturnValue({
                productList: [],
                isLoading: true,
            })

            renderWithRouter(<Preview />)

            expect(
                screen.queryByText('MessageGuidanceCard'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText('PlaygroundPreview'),
            ).not.toBeInTheDocument()
        })
    })

    describe('not found state', () => {
        it('should render "Page not found." when journeyData is undefined', () => {
            mockUseJourneyContext.mockReturnValue({
                ...defaultContextValue,
                journeyData: undefined,
            })

            renderWithRouter(<Preview />)

            expect(screen.getByText('Page not found.')).toBeInTheDocument()
        })
    })

    describe('conditional rendering by journey type', () => {
        it('should render TestingProductCard, MessageGuidanceCard, and PlaygroundPreview for non-welcome non-campaign journeys', () => {
            renderWithRouter(<Preview />)

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

            renderWithRouter(<Preview />)

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

            renderWithRouter(<Preview />)

            expect(
                screen.queryByText('TestingProductCard'),
            ).not.toBeInTheDocument()
            expect(screen.getByText('MessageGuidanceCard')).toBeInTheDocument()
            expect(screen.getByText('PlaygroundPreview')).toBeInTheDocument()
        })
    })

    describe('collapsible column', () => {
        it('should open the collapsible column on mount', () => {
            renderWithRouter(<Preview />)

            expect(mockSetIsCollapsibleColumnOpen).toHaveBeenCalledWith(true)
        })

        it('should close the collapsible column on unmount', () => {
            const { unmount } = renderWithRouter(<Preview />)

            unmount()

            expect(mockSetIsCollapsibleColumnOpen).toHaveBeenCalledWith(false)
        })

        it('should wrap PlaygroundPreview using warpToCollapsibleColumn', () => {
            renderWithRouter(<Preview />)

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

            renderWithRouter(<Preview />)

            expect(mockSetValue).toHaveBeenCalledWith(
                'message_instructions',
                'Be helpful and concise',
            )
        })

        it('should not call setValue when journey data has no message_instructions', () => {
            renderWithRouter(<Preview />)

            expect(mockSetValue).not.toHaveBeenCalled()
        })
    })

    describe('product auto-selection', () => {
        it('should auto-select the first product when productList loads', async () => {
            const firstProduct = {
                id: 'p1',
                title: 'First Product',
                image: { src: 'img.jpg', alt: 'First' },
                handle: 'first-product',
                status: 'active',
                variants: [{ id: 'v1', price: '10.00' }],
            }

            mockUseAIJourneyProductList.mockReturnValue({
                productList: [firstProduct],
                isLoading: false,
            })

            renderWithRouter(<Preview />)

            await waitFor(() => {
                expect(
                    mockUseGeneratePlaygroundMessage,
                ).toHaveBeenLastCalledWith(
                    expect.objectContaining({ selectedProduct: firstProduct }),
                )
            })
        })

        it('should not override an already-selected product when productList changes', async () => {
            const firstProduct = {
                id: 'p1',
                title: 'First Product',
                image: { src: 'img1.jpg', alt: 'First' },
                handle: 'first',
                status: 'active',
                variants: [{ id: 'v1', price: '10.00' }],
            }
            const secondProduct = {
                id: 'p2',
                title: 'Second Product',
                image: { src: 'img2.jpg', alt: 'Second' },
                handle: 'second',
                status: 'active',
                variants: [{ id: 'v2', price: '20.00' }],
            }

            mockUseAIJourneyProductList.mockReturnValue({
                productList: [firstProduct],
                isLoading: false,
            })

            const { rerenderComponent } = renderWithRouter(<Preview />)

            await waitFor(() => {
                expect(
                    mockUseGeneratePlaygroundMessage,
                ).toHaveBeenLastCalledWith(
                    expect.objectContaining({ selectedProduct: firstProduct }),
                )
            })

            mockUseAIJourneyProductList.mockReturnValue({
                productList: [firstProduct, secondProduct],
                isLoading: false,
            })

            rerenderComponent(<Preview />)

            await waitFor(() => {
                expect(
                    mockUseGeneratePlaygroundMessage,
                ).toHaveBeenLastCalledWith(
                    expect.objectContaining({ selectedProduct: firstProduct }),
                )
            })
        })
    })

    describe('generate messages', () => {
        it('should call handleGenerateMessages when PlaygroundPreview triggers onGenerateMessages', async () => {
            mockHandleGenerateMessages.mockResolvedValue(undefined)
            const user = userEvent.setup()

            renderWithRouter(<Preview />)

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

            renderWithRouter(<Preview />)

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

            renderWithRouter(<Preview />)

            expect(MockPlaygroundPreview).toHaveBeenCalledWith(
                expect.objectContaining({ campaignImage: undefined }),
                expect.anything(),
            )
        })
    })
})
