import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import { CONTENT_TYPE } from '../constant'
import ScrapedDomainContentView from '../ScrapedDomainContentView'
import type { ScrapedContent } from '../types'

const mockOnSelect = jest.fn()
const mockOnFetchNextItems = jest.fn()
const mockOnFetchPrevItems = jest.fn()
const mockOnSearch = jest.fn()

const mockContent: ScrapedContent[] = [
    {
        id: 1,
        title: 'Sample Question or Product',
        image: { src: 'https://example.com/image.jpg' },
    },
]

const setup = (propsOverride = {}) => {
    const defaultProps = {
        isLoading: false,
        content: mockContent,
        onSelect: mockOnSelect,
        pageType: CONTENT_TYPE.QUESTION,
        hasNextItems: false,
        hasPrevItems: false,
        fetchNextItems: mockOnFetchNextItems,
        fetchPrevItems: mockOnFetchPrevItems,
        searchValue: '',
        onSearch: mockOnSearch,
    }

    return render(
        <ScrapedDomainContentView {...defaultProps} {...propsOverride} />,
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
        expect(mockOnSelect).toHaveBeenCalledWith(mockContent[0])
    })

    it('renders empty state for Question page when there is no content', () => {
        setup({ content: [], pageType: CONTENT_TYPE.QUESTION })
        expect(screen.getByText(/No questions generated/i)).toBeInTheDocument()
    })

    it('renders empty state for Product page when there is no content', () => {
        setup({ content: [], pageType: CONTENT_TYPE.PRODUCT })
        expect(screen.getByText(/No products available/i)).toBeInTheDocument()
    })
})
