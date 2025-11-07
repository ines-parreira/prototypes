import { assumeMock } from '@repo/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { useFlag } from 'core/flags'

import { CONTENT_TYPE } from '../constant'
import ScrapedDomainContentView from '../ScrapedDomainContentView'

const mockDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockDispatch)
jest.mock('state/notifications/actions')
jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))
const mockUseFlag = assumeMock(useFlag)

const mockOnSelect = jest.fn()
const mockOnFetchNextItems = jest.fn()
const mockOnFetchPrevItems = jest.fn()
const mockOnSearch = jest.fn()
const mockOnUpdateStatus = jest.fn().mockResolvedValue(undefined)
const mockOnUpdateAllStatus = jest.fn().mockResolvedValue(undefined)
const mockSetIsAllEnabled = jest.fn()

const mockContent = [
    {
        id: 1,
        title: 'Sample Question or Product',
        image: { src: 'https://example.com/image.jpg' },
        article_id: 101,
    },
]

// Mock Image constructor
beforeAll(() => {
    global.Image = jest.fn().mockImplementation(() => ({
        onload: null,
        onerror: null,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        set src(value: string) {
            // Simulate successful image load
            setTimeout(() => {
                if (this.onload) {
                    this.onload()
                }
            }, 0)
        },
    })) as any
})

const setup = (propsOverride = {}) => {
    const defaultProps = {
        isLoading: false,
        contents: mockContent,
        onSelect: mockOnSelect,
        pageType: CONTENT_TYPE.QUESTION,
        hasNextItems: false,
        hasPrevItems: false,
        fetchNextItems: mockOnFetchNextItems,
        fetchPrevItems: mockOnFetchPrevItems,
        searchValue: '',
        onSearch: mockOnSearch,
        onUpdateStatus: mockOnUpdateStatus,
    }

    return render(
        <ScrapedDomainContentView
            {...(defaultProps as any)}
            {...propsOverride}
        />,
    )
}

describe('ScrapedDomainContentView', () => {
    beforeEach(() => {
        mockUseFlag.mockImplementation(() => {
            return false
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renders header description for Question page based on pageType', () => {
        setup({ pageType: CONTENT_TYPE.QUESTION })
        expect(
            screen.getByText(/AI Agent automatically generates questions/i),
        ).toBeInTheDocument()
    })

    it('renders header description for Product page based on pageType', () => {
        setup({ pageType: CONTENT_TYPE.PRODUCT })
        expect(
            screen.getByText(
                /Products AI Agent can reference are synced automatically/i,
            ),
        ).toBeInTheDocument()
    })

    it('renders loader skeletons when isLoading is true', () => {
        setup({ isLoading: true, content: mockContent })
        const skeletonElement = document.querySelector(
            '.react-loading-skeleton',
        )
        expect(skeletonElement).toBeInTheDocument()
    })

    it('calls onSelect when row is clicked', () => {
        setup()
        const row = screen.getByText(mockContent[0].title)
        fireEvent.click(row)
        expect(mockOnSelect).toHaveBeenCalledWith(mockContent[0].article_id)
    })

    it('calls onUpdateStatus when toggle is changed', () => {
        setup()
        const toggle = screen.getByRole('switch')
        fireEvent.click(toggle)
        expect(mockOnUpdateStatus).toHaveBeenCalled()
    })

    it('calls onUpdateAllStatus when toggle is changed', () => {
        setup({
            onUpdateAllStatus: mockOnUpdateAllStatus,
            isAllEnabled: true,
            setIsAllEnabled: mockSetIsAllEnabled,
        })
        const toggle = screen.getAllByRole('switch')
        fireEvent.click(toggle[0])
        expect(mockOnUpdateAllStatus).toHaveBeenCalledWith({
            status: 'disabled',
        })
    })

    it('renders empty state for Question page when there is no content', () => {
        setup({ contents: [], pageType: CONTENT_TYPE.QUESTION })
        expect(screen.getByText(/No questions generated/i)).toBeInTheDocument()
    })

    it('renders empty state for Product page when there is no content', () => {
        setup({ contents: [], pageType: CONTENT_TYPE.PRODUCT })
        expect(screen.getByText(/No products available/i)).toBeInTheDocument()
    })

    it('renders correct description for QUESTION pageType', () => {
        setup({ pageType: CONTENT_TYPE.QUESTION })
        expect(
            screen.getByText(/AI Agent automatically generates questions/i),
        ).toBeInTheDocument()
    })

    it('renders correct description for QUESTION pageType', () => {
        mockUseFlag.mockImplementation(() => {
            return false
        })

        setup({ pageType: CONTENT_TYPE.QUESTION })
        expect(
            screen.getByText(
                /AI Agent automatically generates questions and answers from your website content as knowledge\. It also syncs product details to the/i,
            ),
        ).toBeInTheDocument()
    })

    it('renders correct description for PRODUCT pageType', () => {
        setup({ pageType: CONTENT_TYPE.PRODUCT })
        expect(
            screen.getByText(
                /Products AI Agent can reference are synced automatically from Shopify and your store website\. You can add additional information per product to give AI Agent extra context\./i,
            ),
        ).toBeInTheDocument()
    })

    it('renders correct description for PRODUCT pageType', () => {
        mockUseFlag.mockImplementation(() => {
            return false
        })

        setup({ pageType: CONTENT_TYPE.PRODUCT })
        expect(
            screen.getByText(
                /Products AI Agent can reference are synced automatically from Shopify and your store website\. You can add additional information per product to give AI Agent extra context\./i,
            ),
        ).toBeInTheDocument()
    })

    it('renders correct description for FILE_QUESTION pageType', () => {
        setup({ pageType: CONTENT_TYPE.FILE_QUESTION })
        expect(
            screen.getByText(
                /AI Agent generates questions and answers from the document to use when responding to customers\./i,
            ),
        ).toBeInTheDocument()
    })

    it('renders correct description for URL_QUESTION pageType', () => {
        setup({ pageType: CONTENT_TYPE.URL_QUESTION })
        expect(
            screen.getByText(
                /AI Agent generates questions and answers from the page content to use when responding to customers\./i,
            ),
        ).toBeInTheDocument()
    })

    it('renders empty description for unknown pageType', () => {
        setup({ pageType: 'UNKNOWN' })
        // Should not find any description text
        expect(screen.queryByText(/AI Agent/i)).not.toBeInTheDocument()
    })

    it('should set imagesLoaded to true and display the list of product when there is no image', () => {
        const mockContentWithoutImage = [
            {
                id: 1,
                title: 'Sample Product',
                image: { src: '' },
            },
        ]

        setup({
            pageType: CONTENT_TYPE.PRODUCT,
            contents: mockContentWithoutImage,
        })

        expect(screen.getByText('Sample Product')).toBeInTheDocument()
    })

    it('should set imagesLoaded to true and display the list of product when all images are loaded', async () => {
        const mockContentWithImage = [
            {
                id: 1,
                title: 'Sample Product',
                image: { src: 'https://example.com/image.jpg' },
            },
        ]

        setup({
            pageType: CONTENT_TYPE.PRODUCT,
            contents: mockContentWithImage,
        })

        // Wait for images to load
        await waitFor(() => {
            expect(screen.getByText('Sample Product')).toBeInTheDocument()
        })
    })

    it('should add the loaded class when image is loaded', async () => {
        setup({
            pageType: CONTENT_TYPE.PRODUCT,
            contents: mockContent,
        })

        const image = await screen.findByAltText('Product image 1')
        fireEvent.load(image)

        await waitFor(() => expect(image).toHaveClass('loaded'))
    })

    it('renders Navigation component when pagination props are provided', () => {
        const { container } = setup({
            hasNextItems: true,
            hasPrevItems: true,
            fetchNextItems: mockOnFetchNextItems,
            fetchPrevItems: mockOnFetchPrevItems,
        })

        const navigationElement = container.querySelector('.navigation')
        expect(navigationElement).toBeInTheDocument()
    })

    it('does not render Navigation component when pagination props are missing', () => {
        const { container } = setup({
            fetchNextItems: undefined,
            fetchPrevItems: undefined,
        })

        const navigationElement = container.querySelector('.navigation')
        expect(navigationElement).not.toBeInTheDocument()
    })

    it('handles error when updating status fails', async () => {
        const mockFailedUpdateStatus = jest
            .fn()
            .mockRejectedValue(new Error('Update failed'))

        setup({
            onUpdateStatus: mockFailedUpdateStatus,
            contents: [{ ...mockContent[0], status: 'enabled' }],
        })

        const toggle = screen.getByRole('switch')
        fireEvent.click(toggle)

        await waitFor(() => {
            expect(mockFailedUpdateStatus).toHaveBeenCalled()
        })
    })

    it('renders product with is_used_by_ai_agent as true', () => {
        const productContent = [
            {
                id: 1,
                title: 'Sample Product',
                image: { src: 'https://example.com/image.jpg' },
                is_used_by_ai_agent: true,
            },
        ]

        const { container } = setup({
            pageType: CONTENT_TYPE.PRODUCT,
            contents: productContent,
        })

        const checkIcon = container.querySelector('.checkIcon')
        expect(checkIcon).toBeInTheDocument()
    })

    it('renders product with is_used_by_ai_agent as false', () => {
        const productContent = [
            {
                id: 1,
                title: 'Sample Product',
                image: { src: 'https://example.com/image.jpg' },
                is_used_by_ai_agent: false,
            },
        ]

        const { container } = setup({
            pageType: CONTENT_TYPE.PRODUCT,
            contents: productContent,
        })

        const closeIcon = container.querySelector('.closeIcon')
        expect(closeIcon).toBeInTheDocument()
    })

    it('highlights selected row correctly', () => {
        const { container } = setup({
            contents: mockContent,
            selectedId: '101',
            pageType: CONTENT_TYPE.QUESTION,
        })

        const selectedRow = container.querySelector('.selected')
        expect(selectedRow).toBeInTheDocument()
    })

    it('handles image error correctly', async () => {
        global.Image = jest.fn().mockImplementation(() => ({
            onload: null,
            onerror: null,
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            set src(_value: string) {
                setTimeout(() => {
                    if (this.onerror) {
                        this.onerror()
                    }
                }, 0)
            },
        })) as any

        const mockContentWithImage = [
            {
                id: 1,
                title: 'Sample Product',
                image: { src: 'https://example.com/broken-image.jpg' },
            },
        ]

        setup({
            pageType: CONTENT_TYPE.PRODUCT,
            contents: mockContentWithImage,
        })

        await waitFor(() => {
            expect(screen.getByText('Sample Product')).toBeInTheDocument()
        })
    })

    it('calls onSelect with product id for PRODUCT pageType', () => {
        const productContent = [
            {
                id: 123,
                title: 'Sample Product',
                image: { src: 'https://example.com/image.jpg' },
            },
        ]

        setup({
            pageType: CONTENT_TYPE.PRODUCT,
            contents: productContent,
        })

        const row = screen.getByText('Sample Product')
        fireEvent.click(row)

        expect(mockOnSelect).toHaveBeenCalledWith(123)
    })

    it('stops propagation when clicking on toggle', () => {
        setup({
            pageType: CONTENT_TYPE.QUESTION,
            contents: mockContent,
        })

        const toggle = screen.getByRole('switch')
        const clickEvent = new MouseEvent('click', { bubbles: true })
        const stopPropagationSpy = jest.spyOn(clickEvent, 'stopPropagation')

        fireEvent(toggle.parentElement!, clickEvent)

        expect(stopPropagationSpy).toHaveBeenCalled()
    })

    it('renders with shopName prop correctly', () => {
        setup({
            shopName: 'test-shop',
            pageType: CONTENT_TYPE.QUESTION,
        })

        expect(
            screen.getByText(/AI Agent automatically generates questions/i),
        ).toBeInTheDocument()
    })

    it('renders IN USE BY AI AGENT header for PRODUCT pageType when not loading', () => {
        setup({
            pageType: CONTENT_TYPE.PRODUCT,
            isLoading: false,
            contents: mockContent,
        })

        expect(screen.getByText('IN USE BY AI AGENT')).toBeInTheDocument()
    })

    it('does not render IN USE BY AI AGENT header when loading', () => {
        setup({
            pageType: CONTENT_TYPE.PRODUCT,
            isLoading: true,
        })

        expect(screen.queryByText('IN USE BY AI AGENT')).not.toBeInTheDocument()
    })
})
