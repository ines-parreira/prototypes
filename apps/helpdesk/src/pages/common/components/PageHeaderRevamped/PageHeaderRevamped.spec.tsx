import { render, screen } from '@testing-library/react'

import PageHeaderRevamped from './PageHeaderRevamped'

const renderComponent = (props: {
    title: React.ReactNode
    className?: string
    children?: React.ReactNode
}) => {
    return render(<PageHeaderRevamped {...props} />)
}

describe('PageHeaderRevamped', () => {
    it('renders title as string', () => {
        renderComponent({ title: 'Page Title' })

        expect(screen.getByText('Page Title')).toBeInTheDocument()
    })

    it('renders title as ReactNode', () => {
        renderComponent({
            title: (
                <div>
                    <h1>Custom Title</h1>
                    <span>Subtitle</span>
                </div>
            ),
        })

        expect(screen.getByText('Custom Title')).toBeInTheDocument()
        expect(screen.getByText('Subtitle')).toBeInTheDocument()
    })

    it('renders without children', () => {
        renderComponent({ title: 'Page Title' })

        expect(screen.getByText('Page Title')).toBeInTheDocument()
        expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('renders children when provided', () => {
        renderComponent({
            title: 'Page Title',
            children: <button>Action Button</button>,
        })

        expect(
            screen.getByRole('button', { name: 'Action Button' }),
        ).toBeInTheDocument()
    })

    it('renders multiple children', () => {
        renderComponent({
            title: 'Page Title',
            children: (
                <>
                    <button>Button 1</button>
                    <button>Button 2</button>
                </>
            ),
        })

        expect(
            screen.getByRole('button', { name: 'Button 1' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Button 2' }),
        ).toBeInTheDocument()
    })

    it('applies custom className to container', () => {
        const { container } = renderComponent({
            title: 'Page Title',
            className: 'custom-class',
        })

        const headerContainer = container.firstChild as HTMLElement
        expect(headerContainer).toHaveClass('custom-class')
    })
})
