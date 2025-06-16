import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

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

const mockContent = [
    {
        id: 1,
        title: 'Sample Question or Product',
        image: { src: 'https://example.com/image.jpg' },
    },
]

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
        expect(mockOnSelect).toHaveBeenCalledWith(mockContent[0].id)
    })

    it('calls onUpdateStatus when toggle is changed', () => {
        setup()
        const toggle = screen.getByRole('switch')
        fireEvent.click(toggle)
        expect(mockOnUpdateStatus).toHaveBeenCalled()
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
})
