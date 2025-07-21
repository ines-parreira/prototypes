import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { CONTENT_TYPE } from '../constant'
import ScrapedDomainContentView from '../ScrapedDomainContentView'

const mockDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockDispatch)
jest.mock('state/notifications/actions')

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
            screen.getByText(/AI Agent uses product details/i),
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
            screen.getByText(
                /AI Agent automatically generates questions and answers from your website content to use as knowledge\./i,
            ),
        ).toBeInTheDocument()
    })

    it('renders correct description for PRODUCT pageType', () => {
        setup({ pageType: CONTENT_TYPE.PRODUCT })
        expect(
            screen.getByText(
                /AI Agent uses product details from your Shopify app and store website\./i,
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
})
