import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import {
    TrialAlertBanner,
    TrialAlertBannerProps,
} from '../components/TrialAlertBanner'

describe('TrialAlertBanner', () => {
    const defaultProps: TrialAlertBannerProps = {
        title: 'Test Trial Alert',
    }

    it('should render with title only', () => {
        render(<TrialAlertBanner {...defaultProps} />)

        expect(screen.getByText('Test Trial Alert')).toBeInTheDocument()
    })

    it('should render with title and description when expanded', () => {
        const props = {
            ...defaultProps,
            description: 'This is a test description',
        }

        render(<TrialAlertBanner {...props} />)

        expect(screen.getByText('Test Trial Alert')).toBeInTheDocument()
        expect(
            screen.getByText('This is a test description'),
        ).toBeInTheDocument()
    })

    it('should start in expanded state by default', () => {
        render(<TrialAlertBanner {...defaultProps} />)

        const upArrow = screen.getByText('expand_less')
        expect(upArrow).toBeInTheDocument()
    })

    it('should toggle between expanded and collapsed states', async () => {
        const user = userEvent.setup()
        const props = {
            ...defaultProps,
            description: 'This is a test description',
        }

        render(<TrialAlertBanner {...props} />)

        // Initially expanded
        expect(screen.getByText('expand_less')).toBeInTheDocument()
        expect(
            screen.getByText('This is a test description'),
        ).toBeInTheDocument()

        // Click to collapse
        await act(async () => {
            await user.click(screen.getByText('expand_less'))
        })

        // Should be collapsed
        expect(screen.getByText('expand_more')).toBeInTheDocument()
        expect(
            screen.queryByText('This is a test description'),
        ).not.toBeInTheDocument()

        // Click to expand again
        await act(async () => {
            await user.click(screen.getByText('expand_more'))
        })

        // Should be expanded again
        expect(screen.getByText('expand_less')).toBeInTheDocument()
        expect(
            screen.getByText('This is a test description'),
        ).toBeInTheDocument()
    })

    it('should render primary action when expanded', async () => {
        const user = userEvent.setup()
        const mockOnClick = jest.fn()
        const props = {
            ...defaultProps,
            primaryAction: {
                label: 'Primary Action',
                onClick: mockOnClick,
            },
        }

        render(<TrialAlertBanner {...props} />)

        const button = screen.getByRole('button', { name: 'Primary Action' })
        expect(button).toBeInTheDocument()

        await user.click(button)
        expect(mockOnClick).toHaveBeenCalledTimes(1)
    })

    it('should render secondary action when expanded', async () => {
        const user = userEvent.setup()
        const mockOnClick = jest.fn()
        const props = {
            ...defaultProps,
            secondaryAction: {
                label: 'Secondary Action',
                onClick: mockOnClick,
            },
        }

        render(<TrialAlertBanner {...props} />)

        const button = screen.getByRole('button', { name: 'Secondary Action' })
        expect(button).toBeInTheDocument()

        await user.click(button)
        expect(mockOnClick).toHaveBeenCalledTimes(1)
    })

    it('should render both actions when expanded', () => {
        const props = {
            ...defaultProps,
            primaryAction: {
                label: 'Primary Action',
                onClick: jest.fn(),
            },
            secondaryAction: {
                label: 'Secondary Action',
                onClick: jest.fn(),
            },
        }

        render(<TrialAlertBanner {...props} />)

        expect(
            screen.getByRole('button', { name: 'Primary Action' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Secondary Action' }),
        ).toBeInTheDocument()
    })

    it('should render primary action in collapsed state', async () => {
        const user = userEvent.setup()
        const mockOnClick = jest.fn()
        const props = {
            ...defaultProps,
            primaryAction: {
                label: 'Primary Action',
                onClick: mockOnClick,
            },
        }

        render(<TrialAlertBanner {...props} />)

        // Collapse the banner
        await act(async () => {
            await user.click(screen.getByText('expand_less'))
        })

        // Primary action should still be visible as a button
        const button = screen.getByRole('button', { name: 'Primary Action' })
        expect(button).toBeInTheDocument()

        await user.click(button)
        expect(mockOnClick).toHaveBeenCalledTimes(1)
    })

    it('should not render secondary action in collapsed state', async () => {
        const user = userEvent.setup()
        const props = {
            ...defaultProps,
            secondaryAction: {
                label: 'Secondary Action',
                onClick: jest.fn(),
            },
        }

        render(<TrialAlertBanner {...props} />)

        // Collapse the banner
        await act(async () => {
            await user.click(screen.getByText('expand_less'))
        })

        // Secondary action should not be visible
        expect(
            screen.queryByRole('button', { name: 'Secondary Action' }),
        ).not.toBeInTheDocument()
    })

    it('should not render description in collapsed state', async () => {
        const user = userEvent.setup()
        const props = {
            ...defaultProps,
            description: 'This is a test description',
        }

        render(<TrialAlertBanner {...props} />)

        // Collapse the banner
        await act(async () => {
            await user.click(screen.getByText('expand_less'))
        })

        // Description should not be visible
        expect(
            screen.queryByText('This is a test description'),
        ).not.toBeInTheDocument()
    })

    it('should handle disabled primary action', () => {
        const props = {
            ...defaultProps,
            primaryAction: {
                label: 'Primary Action',
                onClick: jest.fn(),
                disabled: true,
            },
        }

        render(<TrialAlertBanner {...props} />)

        // Note: The component doesn't actually use the disabled prop
        // This test documents the current behavior
        const button = screen.getByRole('button', { name: 'Primary Action' })
        expect(button).toBeInTheDocument()
    })

    it('should handle variant prop for primary action', () => {
        const props = {
            ...defaultProps,
            primaryAction: {
                label: 'Primary Action',
                onClick: jest.fn(),
                variant: 'secondary' as const,
            },
        }

        render(<TrialAlertBanner {...props} />)

        // Note: The component doesn't actually use the variant prop
        // This test documents the current behavior
        const button = screen.getByRole('button', { name: 'Primary Action' })
        expect(button).toBeInTheDocument()
    })

    it('should apply correct CSS classes', () => {
        const { container } = render(<TrialAlertBanner {...defaultProps} />)

        expect(container.querySelector('.container')).toBeInTheDocument()
        expect(container.querySelector('.header')).toBeInTheDocument()
        expect(container.querySelector('.title')).toBeInTheDocument()
        expect(container.querySelector('.expanderIcon')).toBeInTheDocument()
    })

    it('should apply correct CSS classes with actions', () => {
        const props = {
            ...defaultProps,
            description: 'Test description',
            primaryAction: {
                label: 'Primary',
                onClick: jest.fn(),
            },
        }

        const { container } = render(<TrialAlertBanner {...props} />)

        expect(container.querySelector('.description')).toBeInTheDocument()
        expect(container.querySelector('.actions')).toBeInTheDocument()
        expect(
            container.querySelector('.primaryActionButton'),
        ).toBeInTheDocument()
    })

    it('should maintain collapsed state when primary action is clicked', async () => {
        const user = userEvent.setup()
        const mockOnClick = jest.fn()
        const props = {
            ...defaultProps,
            description: 'Test description',
            primaryAction: {
                label: 'Primary Action',
                onClick: mockOnClick,
            },
        }

        render(<TrialAlertBanner {...props} />)

        // Collapse the banner
        await act(async () => {
            await user.click(screen.getByText('expand_less'))
        })

        // Click primary action
        await user.click(screen.getByRole('button', { name: 'Primary Action' }))

        // Should still be collapsed
        expect(screen.getByText('expand_more')).toBeInTheDocument()
        expect(screen.queryByText('Test description')).not.toBeInTheDocument()
        expect(mockOnClick).toHaveBeenCalledTimes(1)
    })

    it('should render correctly with all props provided', () => {
        const props = {
            title: 'Full Feature Alert',
            description: 'This alert has all features enabled',
            primaryAction: {
                label: 'Upgrade Now',
                onClick: jest.fn(),
            },
            secondaryAction: {
                label: 'Learn More',
                onClick: jest.fn(),
            },
        }

        render(<TrialAlertBanner {...props} />)

        expect(screen.getByText('Full Feature Alert')).toBeInTheDocument()
        expect(
            screen.getByText('This alert has all features enabled'),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Upgrade Now' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Learn More' }),
        ).toBeInTheDocument()
    })

    it('should handle empty actions gracefully', () => {
        render(<TrialAlertBanner {...defaultProps} />)

        // Should render without errors when no actions are provided
        expect(screen.getByText('Test Trial Alert')).toBeInTheDocument()
        expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('should not show expand/collapse icon when collapsible is false', () => {
        const props = {
            ...defaultProps,
            collapsible: false,
            description: 'This description should always be visible',
        }

        render(<TrialAlertBanner {...props} />)

        // Should not have expand/collapse arrows
        expect(screen.queryByText('expand_less')).not.toBeInTheDocument()
        expect(screen.queryByText('expand_more')).not.toBeInTheDocument()

        // Description should always be visible
        expect(
            screen.getByText('This description should always be visible'),
        ).toBeInTheDocument()
    })

    it('should always show expanded view when collapsible is false', () => {
        const props = {
            ...defaultProps,
            collapsible: false,
            description: 'Always visible description',
            primaryAction: {
                label: 'Primary Action',
                onClick: jest.fn(),
            },
            secondaryAction: {
                label: 'Secondary Action',
                onClick: jest.fn(),
            },
        }

        render(<TrialAlertBanner {...props} />)

        // All content should be visible
        expect(screen.getByText('Test Trial Alert')).toBeInTheDocument()
        expect(
            screen.getByText('Always visible description'),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Primary Action' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Secondary Action' }),
        ).toBeInTheDocument()

        // No expand/collapse functionality
        expect(screen.queryByText('expand_less')).not.toBeInTheDocument()
        expect(screen.queryByText('expand_more')).not.toBeInTheDocument()
    })

    it('should start collapsed when defaultExpanded is false', () => {
        const props = {
            ...defaultProps,
            defaultExpanded: false,
            description: 'This should be hidden initially',
        }

        render(<TrialAlertBanner {...props} />)

        // Should start collapsed
        expect(screen.getByText('expand_more')).toBeInTheDocument()
        expect(
            screen.queryByText('This should be hidden initially'),
        ).not.toBeInTheDocument()
    })

    it('should respect defaultExpanded prop', async () => {
        const user = userEvent.setup()
        const props = {
            ...defaultProps,
            defaultExpanded: false,
            description: 'Initially hidden description',
            primaryAction: {
                label: 'Primary Action',
                onClick: jest.fn(),
            },
        }

        render(<TrialAlertBanner {...props} />)

        // Initially collapsed
        expect(screen.getByText('expand_more')).toBeInTheDocument()
        expect(
            screen.queryByText('Initially hidden description'),
        ).not.toBeInTheDocument()

        // Primary action should be visible as button in collapsed state
        expect(
            screen.getByRole('button', { name: 'Primary Action' }),
        ).toBeInTheDocument()

        // Click to expand
        await act(async () => {
            await user.click(screen.getByText('expand_more'))
        })

        // Should now be expanded
        expect(screen.getByText('expand_less')).toBeInTheDocument()
        expect(
            screen.getByText('Initially hidden description'),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Primary Action' }),
        ).toBeInTheDocument()
    })
})
