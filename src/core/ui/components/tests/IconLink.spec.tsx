import React from 'react'

import { render, screen } from '@testing-library/react'

import IconLink from '../IconLink'

describe('IconLink', () => {
    const defaultProps = {
        content: 'Link Text',
        href: 'https://example.com',
        icon: 'link',
    }

    it('renders with default props', () => {
        render(<IconLink {...defaultProps} />)

        const link = screen.getByRole('link', { name: 'link' })
        expect(link).toHaveAttribute('href', 'https://example.com')
        expect(link).toHaveAttribute('rel', 'noopener noreferrer')
        expect(link).toHaveAttribute('target', '_blank')

        const icon = screen.getByText('link')
        expect(icon).toHaveClass('material-icons')
        expect(icon).toHaveClass('mr-2')

        expect(screen.getByText('Link Text')).toBeInTheDocument()
    })

    it('renders with custom props', () => {
        render(
            <IconLink
                {...defaultProps}
                className="custom-class"
                rel="nofollow"
                target="_self"
                iconPosition="suffix"
                iconClassNames="custom-icon"
                ariaLabel="custom link"
            />,
        )

        const link = screen.getByRole('link', { name: 'custom link' })
        expect(link).toHaveAttribute('href', 'https://example.com')
        expect(link).toHaveAttribute('rel', 'nofollow')
        expect(link).toHaveAttribute('target', '_self')
        expect(link).toHaveClass('custom-class')

        const icon = screen.getByText('link')
        expect(icon).toHaveClass('material-icons')
        expect(icon).toHaveClass('custom-icon')
        expect(icon).not.toHaveClass('mr-2') // suffix icons don't have mr-2

        // Check order for suffix position
        const linkElement = screen.getByRole('link')
        expect(linkElement.firstChild?.textContent).toBe('Link Text')
        expect(linkElement.lastChild?.textContent).toBe('link')
    })

    it('renders with prefix icon position', () => {
        render(<IconLink {...defaultProps} iconPosition="prefix" />)

        const linkElement = screen.getByRole('link')
        expect(linkElement.firstChild?.textContent).toBe('link')
        expect(linkElement.lastChild?.textContent).toBe('Link Text')
    })

    it('renders with suffix icon position', () => {
        render(<IconLink {...defaultProps} iconPosition="suffix" />)

        const linkElement = screen.getByRole('link')
        expect(linkElement.firstChild?.textContent).toBe('Link Text')
        expect(linkElement.lastChild?.textContent).toBe('link')
    })
})
