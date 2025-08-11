import React from 'react'

import { render, screen } from '@testing-library/react'

import { ConfigurationSection } from './ConfigurationSection'

// Mock CSS module
jest.mock('./ConfigurationSection.less', () => ({}))

jest.mock('@gorgias/axiom', () => ({
    __esModule: true,
    Badge: ({
        children,
        className,
    }: {
        children: React.ReactNode
        className?: string
    }) => <div className={className}>{children}</div>,
    ColorType: { Magenta: 'magenta' },
}))

describe('ConfigurationSection Component', () => {
    const defaultProps = {
        title: 'Test Title',
        children: <div>Test Children</div>,
    }

    it('renders with required props', () => {
        render(<ConfigurationSection {...defaultProps} />)
        expect(screen.getByText('Test Title')).toBeInTheDocument()
        expect(screen.getByText('Test Children')).toBeInTheDocument()
    })

    it('renders subtitle when provided', () => {
        render(
            <ConfigurationSection {...defaultProps} subtitle="Test Subtitle" />,
        )
        expect(screen.getByText('Test Subtitle')).toBeInTheDocument()
    })

    it('renders required indicator when isRequired is true', () => {
        render(<ConfigurationSection {...defaultProps} isRequired />)
        const requiredIndicator = screen.getByText('*')
        expect(requiredIndicator).toBeInTheDocument()
        expect(requiredIndicator).toHaveAttribute('title', 'required')
        expect(requiredIndicator).toHaveAttribute('aria-label', 'required')
    })

    it('does not render required indicator when isRequired is false', () => {
        render(<ConfigurationSection {...defaultProps} isRequired={false} />)
        expect(screen.queryByText('*')).not.toBeInTheDocument()
    })

    it('renders BETA badge when isBeta is true', () => {
        render(<ConfigurationSection {...defaultProps} isBeta />)
        expect(screen.getByText('BETA')).toBeInTheDocument()
    })

    it('does not render BETA badge when isBeta is false', () => {
        render(<ConfigurationSection {...defaultProps} isBeta={false} />)
        expect(screen.queryByText('BETA')).not.toBeInTheDocument()
    })

    it('h2 element has correct data attributes', () => {
        render(<ConfigurationSection {...defaultProps} />)
        const heading = screen.getByRole('heading', { level: 2 })
        expect(heading).toHaveAttribute(
            'data-candu-id',
            'ai-agent-configuration-knowledge',
        )
    })

    it('renders children inside content div', () => {
        render(<ConfigurationSection {...defaultProps} />)
        const contentDiv = screen.getByText('Test Children').parentElement
        expect(contentDiv).toBeInTheDocument()
    })
})
