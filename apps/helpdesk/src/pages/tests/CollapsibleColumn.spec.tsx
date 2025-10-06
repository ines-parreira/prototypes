import { render, screen } from '@testing-library/react'

import { CollapsibleColumn } from '../CollapsibleColumn'

const mockUseCollapsibleColumn = jest.fn()

jest.mock('pages/common/hooks/useCollapsibleColumn', () => ({
    useCollapsibleColumn: () => mockUseCollapsibleColumn(),
}))

describe('CollapsibleColumn', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render closed state when isCollapsibleColumnOpen is false', () => {
        mockUseCollapsibleColumn.mockReturnValue({
            isCollapsibleColumnOpen: false,
            collapsibleColumnChildren: null,
        })

        const { container } = render(<CollapsibleColumn />)

        const columnElement = container.querySelector('.collapsible-column')
        expect(columnElement).toBeInTheDocument()
        expect(columnElement).toHaveClass('collapsible-column-closed')
        expect(columnElement).not.toHaveClass('collapsible-column-open')
    })

    it('should render open state when isCollapsibleColumnOpen is true', () => {
        mockUseCollapsibleColumn.mockReturnValue({
            isCollapsibleColumnOpen: true,
            collapsibleColumnChildren: null,
        })

        const { container } = render(<CollapsibleColumn />)

        const columnElement = container.querySelector('.collapsible-column')
        expect(columnElement).toBeInTheDocument()
        expect(columnElement).toHaveClass('collapsible-column-open')
        expect(columnElement).not.toHaveClass('collapsible-column-closed')
    })

    it('should not render children when column is closed', () => {
        const testContent = <div>Test Content</div>
        mockUseCollapsibleColumn.mockReturnValue({
            isCollapsibleColumnOpen: false,
            collapsibleColumnChildren: testContent,
        })

        render(<CollapsibleColumn />)

        expect(screen.queryByText('Test Content')).not.toBeInTheDocument()
    })

    it('should render children when column is open', () => {
        const testContent = <div>Test Content</div>
        mockUseCollapsibleColumn.mockReturnValue({
            isCollapsibleColumnOpen: true,
            collapsibleColumnChildren: testContent,
        })

        render(<CollapsibleColumn />)

        expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('should render complex children correctly when open', () => {
        const complexContent = (
            <div>
                <h1>Header</h1>
                <p>Paragraph content</p>
                <button>Click me</button>
            </div>
        )
        mockUseCollapsibleColumn.mockReturnValue({
            isCollapsibleColumnOpen: true,
            collapsibleColumnChildren: complexContent,
        })

        render(<CollapsibleColumn />)

        expect(
            screen.getByRole('heading', { name: 'Header' }),
        ).toBeInTheDocument()
        expect(screen.getByText('Paragraph content')).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Click me' }),
        ).toBeInTheDocument()
    })

    it('should apply correct CSS classes structure', () => {
        mockUseCollapsibleColumn.mockReturnValue({
            isCollapsibleColumnOpen: true,
            collapsibleColumnChildren: <div>Content</div>,
        })

        const { container } = render(<CollapsibleColumn />)

        const mainContainer = container.querySelector('.collapsible-column')
        expect(mainContainer).toHaveClass('flex-column', 'container')

        const contentWrapper = container.querySelector(
            '.collapsible-column-content',
        )
        expect(contentWrapper).toHaveClass(
            'd-flex',
            'flex-grow-1',
            'contentInfobar',
            'withCollapsibleColumn',
        )

        const innerContent = contentWrapper?.querySelector('.content')
        expect(innerContent).toHaveClass('d-flex', 'flex-grow-1')
    })

    it('should handle null children gracefully', () => {
        mockUseCollapsibleColumn.mockReturnValue({
            isCollapsibleColumnOpen: true,
            collapsibleColumnChildren: null,
        })

        const { container } = render(<CollapsibleColumn />)

        const contentElement = container.querySelector('.content')
        expect(contentElement).toBeInTheDocument()
        expect(contentElement).toBeEmptyDOMElement()
    })

    it('should handle undefined children gracefully', () => {
        mockUseCollapsibleColumn.mockReturnValue({
            isCollapsibleColumnOpen: true,
            collapsibleColumnChildren: undefined,
        })

        const { container } = render(<CollapsibleColumn />)

        const contentElement = container.querySelector('.content')
        expect(contentElement).toBeInTheDocument()
        expect(contentElement).toBeEmptyDOMElement()
    })

    it('should toggle between open and closed states', () => {
        const { rerender, container } = render(<CollapsibleColumn />)

        mockUseCollapsibleColumn.mockReturnValue({
            isCollapsibleColumnOpen: false,
            collapsibleColumnChildren: <div>Toggle Content</div>,
        })
        rerender(<CollapsibleColumn />)

        let columnElement = container.querySelector('.collapsible-column')
        expect(columnElement).toHaveClass('collapsible-column-closed')
        expect(screen.queryByText('Toggle Content')).not.toBeInTheDocument()

        mockUseCollapsibleColumn.mockReturnValue({
            isCollapsibleColumnOpen: true,
            collapsibleColumnChildren: <div>Toggle Content</div>,
        })
        rerender(<CollapsibleColumn />)

        columnElement = container.querySelector('.collapsible-column')
        expect(columnElement).toHaveClass('collapsible-column-open')
        expect(screen.getByText('Toggle Content')).toBeInTheDocument()
    })

    it('should update children content when prop changes', () => {
        const { rerender } = render(<CollapsibleColumn />)

        mockUseCollapsibleColumn.mockReturnValue({
            isCollapsibleColumnOpen: true,
            collapsibleColumnChildren: <div>Initial Content</div>,
        })
        rerender(<CollapsibleColumn />)

        expect(screen.getByText('Initial Content')).toBeInTheDocument()

        mockUseCollapsibleColumn.mockReturnValue({
            isCollapsibleColumnOpen: true,
            collapsibleColumnChildren: <div>Updated Content</div>,
        })
        rerender(<CollapsibleColumn />)

        expect(screen.queryByText('Initial Content')).not.toBeInTheDocument()
        expect(screen.getByText('Updated Content')).toBeInTheDocument()
    })
})
