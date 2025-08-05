import React from 'react'

import { render, screen } from '@testing-library/react'

import {
    PromoCardVariant,
    useShoppingAssistantPromoCard,
} from '../hooks/useShoppingAssistantPromoCard'
import type { PromoCardContent } from '../hooks/useShoppingAssistantPromoCard'
import { ShoppingAssistantPromoCard } from '../ShoppingAssistantPromoCard'

jest.mock('../hooks/useShoppingAssistantPromoCard')

const mockUseShoppingAssistantPromoCard =
    useShoppingAssistantPromoCard as jest.MockedFunction<
        typeof useShoppingAssistantPromoCard
    >

describe('ShoppingAssistantPromoCard', () => {
    const mockOnClick = jest.fn()
    const mockVideoModalClick = jest.fn()
    const mockSecondaryClick = jest.fn()

    const basePromoContent: PromoCardContent = {
        variant: PromoCardVariant.AdminTrial,
        title: 'Unlock new AI Agent skills',
        description: 'Go beyond automation and grow revenue by 1.5%',
        shouldShowDescriptionIcon: false,
        showVideo: true,
        shouldShowNotificationIcon: false,
        primaryButton: {
            label: 'Try for 14 days',
            onClick: mockOnClick,
        },
        secondaryButton: {
            label: 'Learn more',
            href: 'https://example.com/learn',
            onClick: mockSecondaryClick,
        },
        videoModalButton: {
            label: 'Try for 14 days',
            onClick: mockVideoModalClick,
        },
    }

    beforeEach(() => {
        jest.resetAllMocks()
    })

    describe('Null rendering', () => {
        it('should return null when hook returns null', () => {
            mockUseShoppingAssistantPromoCard.mockReturnValue(null)

            const { container } = render(<ShoppingAssistantPromoCard />)

            expect(container.firstChild).toBeNull()
        })
    })

    describe('Admin Trial Progress variant', () => {
        const adminTrialProgressContent: PromoCardContent = {
            variant: PromoCardVariant.AdminTrialProgress,
            title: 'Shopping Assistant Trial',
            description: '$1250 GMV influenced',
            shouldShowDescriptionIcon: true,
            showVideo: false,
            shouldShowNotificationIcon: false,
            primaryButton: {
                label: 'Upgrade now',
                onClick: mockOnClick,
            },
            secondaryButton: {
                label: 'Manage Trial',
                onClick: mockSecondaryClick,
            },
            videoModalButton: undefined,
            showProgressBar: true,
            progressPercentage: 100,
            progressText: '14 days left',
        }

        it('should render trial progress content with progress bar', () => {
            mockUseShoppingAssistantPromoCard.mockReturnValue(
                adminTrialProgressContent,
            )
            render(<ShoppingAssistantPromoCard />)

            expect(
                screen.getByText('Shopping Assistant Trial'),
            ).toBeInTheDocument()
            expect(screen.getByText('$1250 GMV influenced')).toBeInTheDocument()
            expect(screen.getByText('14 days left')).toBeInTheDocument()
        })

        it('should render as collapsible card when in trial progress', () => {
            mockUseShoppingAssistantPromoCard.mockReturnValue(
                adminTrialProgressContent,
            )
            render(<ShoppingAssistantPromoCard />)

            // Check for collapsible button which indicates it's a collapsible card
            const collapseButton = screen.getByLabelText('Collapse')
            expect(collapseButton).toBeInTheDocument()
        })

        it('should render upgrade and manage trial buttons', () => {
            mockUseShoppingAssistantPromoCard.mockReturnValue(
                adminTrialProgressContent,
            )
            render(<ShoppingAssistantPromoCard />)

            expect(
                screen.getByRole('button', { name: /upgrade now/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /manage trial/i }),
            ).toBeInTheDocument()
        })

        it('should not render video content during trial progress', () => {
            mockUseShoppingAssistantPromoCard.mockReturnValue(
                adminTrialProgressContent,
            )
            render(<ShoppingAssistantPromoCard />)

            expect(
                screen.queryByAltText('Shopping Assistant Demo'),
            ).not.toBeInTheDocument()
        })
    })

    describe('Lead Trial Progress variant', () => {
        const leadTrialProgressContent: PromoCardContent = {
            variant: PromoCardVariant.LeadTrialProgress,
            title: 'Shopping Assistant Trial',
            description: '$1250 GMV influenced',
            shouldShowDescriptionIcon: true,
            showVideo: false,
            shouldShowNotificationIcon: false,
            primaryButton: {
                label: '',
                disabled: true,
            },
            secondaryButton: undefined,
            videoModalButton: undefined,
            showProgressBar: true,
            progressPercentage: 100,
            progressText: '14 days left',
        }

        it('should render trial progress content with progress bar but no CTAs', () => {
            mockUseShoppingAssistantPromoCard.mockReturnValue(
                leadTrialProgressContent,
            )
            render(<ShoppingAssistantPromoCard />)

            expect(
                screen.getByText('Shopping Assistant Trial'),
            ).toBeInTheDocument()
            expect(screen.getByText('$1250 GMV influenced')).toBeInTheDocument()
            expect(screen.getByText('14 days left')).toBeInTheDocument()
        })

        it('should render as collapsible card when in trial progress', () => {
            mockUseShoppingAssistantPromoCard.mockReturnValue(
                leadTrialProgressContent,
            )
            render(<ShoppingAssistantPromoCard />)

            // Check for collapsible button which indicates it's a collapsible card
            const collapseButton = screen.getByLabelText('Collapse')
            expect(collapseButton).toBeInTheDocument()
        })

        it('should not render any action buttons for lead users when no CTA available', () => {
            mockUseShoppingAssistantPromoCard.mockReturnValue(
                leadTrialProgressContent,
            )
            render(<ShoppingAssistantPromoCard />)

            // Should not render primary/secondary buttons (excluding collapsible button)
            expect(
                screen.queryByRole('button', { name: /upgrade now/i }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: /manage trial/i }),
            ).not.toBeInTheDocument()
            expect(screen.queryByRole('link')).not.toBeInTheDocument()
        })

        it('should not render video content during trial progress', () => {
            mockUseShoppingAssistantPromoCard.mockReturnValue(
                leadTrialProgressContent,
            )
            render(<ShoppingAssistantPromoCard />)

            expect(
                screen.queryByAltText('Shopping Assistant Demo'),
            ).not.toBeInTheDocument()
        })
    })

    describe('Switch statement coverage', () => {
        it('should render AdminTrial component for AdminTrial variant', () => {
            const adminTrialContent: PromoCardContent = {
                ...basePromoContent,
                variant: PromoCardVariant.AdminTrial,
            }

            mockUseShoppingAssistantPromoCard.mockReturnValue(adminTrialContent)
            render(<ShoppingAssistantPromoCard />)

            expect(
                screen.getByText('Unlock new AI Agent skills'),
            ).toBeInTheDocument()
        })

        it('should render AdminDemo component for AdminDemo variant', () => {
            const adminDemoContent: PromoCardContent = {
                ...basePromoContent,
                variant: PromoCardVariant.AdminDemo,
                primaryButton: {
                    label: 'Book a demo',
                    href: 'https://example.com/demo',
                },
            }

            mockUseShoppingAssistantPromoCard.mockReturnValue(adminDemoContent)
            render(<ShoppingAssistantPromoCard />)

            expect(
                screen.getByRole('link', { name: /book a demo/i }),
            ).toBeInTheDocument()
        })

        it('should render LeadNotify component for LeadNotify variant', () => {
            const leadNotifyContent: PromoCardContent = {
                ...basePromoContent,
                variant: PromoCardVariant.LeadNotify,
                primaryButton: {
                    label: 'Notify admin',
                    onClick: mockOnClick,
                },
                shouldShowNotificationIcon: true,
            }

            mockUseShoppingAssistantPromoCard.mockReturnValue(leadNotifyContent)
            render(<ShoppingAssistantPromoCard />)

            expect(
                screen.getByRole('button', { name: /notify admin/i }),
            ).toBeInTheDocument()
        })

        it('should return null for Hidden variant', () => {
            const hiddenContent: PromoCardContent = {
                ...basePromoContent,
                variant: PromoCardVariant.Hidden,
            }

            mockUseShoppingAssistantPromoCard.mockReturnValue(hiddenContent)
            const { container } = render(<ShoppingAssistantPromoCard />)

            expect(container.firstChild).toBeNull()
        })

        it('should return null for unknown variant', () => {
            const unknownContent: PromoCardContent = {
                ...basePromoContent,
                variant: 'unknown-variant' as PromoCardVariant,
            }

            mockUseShoppingAssistantPromoCard.mockReturnValue(unknownContent)
            const { container } = render(<ShoppingAssistantPromoCard />)

            expect(container.firstChild).toBeNull()
        })
    })

    describe('Props passing', () => {
        it('should pass className prop to child components', () => {
            mockUseShoppingAssistantPromoCard.mockReturnValue(basePromoContent)
            render(<ShoppingAssistantPromoCard className="test-class" />)

            // Verify className is passed to the rendered component
            const promoCard = screen
                .getByText('Unlock new AI Agent skills')
                .closest('[class*="test-class"]')
            expect(promoCard).toBeInTheDocument()
        })

        it('should pass promoContent prop to AdminTrialProgress component', () => {
            const adminTrialProgressContent: PromoCardContent = {
                variant: PromoCardVariant.AdminTrialProgress,
                title: 'Shopping Assistant Trial',
                description: '$1250 GMV influenced',
                shouldShowDescriptionIcon: true,
                showVideo: false,
                shouldShowNotificationIcon: false,
                primaryButton: {
                    label: 'Upgrade now',
                    onClick: mockOnClick,
                },
                showProgressBar: true,
                progressPercentage: 75,
                progressText: '5 days left',
            }

            mockUseShoppingAssistantPromoCard.mockReturnValue(
                adminTrialProgressContent,
            )
            render(
                <ShoppingAssistantPromoCard className="admin-trial-progress" />,
            )

            // Verify all content from promoContent is rendered
            expect(
                screen.getByText('Shopping Assistant Trial'),
            ).toBeInTheDocument()
            expect(screen.getByText('$1250 GMV influenced')).toBeInTheDocument()
            expect(screen.getByText('5 days left')).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /upgrade now/i }),
            ).toBeInTheDocument()
        })

        it('should pass promoContent prop to LeadTrialProgress component', () => {
            const leadTrialProgressContent: PromoCardContent = {
                variant: PromoCardVariant.LeadTrialProgress,
                title: 'Shopping Assistant Trial',
                description: '$2500 GMV influenced',
                shouldShowDescriptionIcon: true,
                showVideo: false,
                shouldShowNotificationIcon: false,
                primaryButton: {
                    label: '',
                    disabled: true,
                },
                showProgressBar: true,
                progressPercentage: 40,
                progressText: '8 days left',
            }

            mockUseShoppingAssistantPromoCard.mockReturnValue(
                leadTrialProgressContent,
            )
            render(
                <ShoppingAssistantPromoCard className="lead-trial-progress" />,
            )

            // Verify all content from promoContent is rendered
            expect(
                screen.getByText('Shopping Assistant Trial'),
            ).toBeInTheDocument()
            expect(screen.getByText('$2500 GMV influenced')).toBeInTheDocument()
            expect(screen.getByText('8 days left')).toBeInTheDocument()
        })
    })
})
