import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { logEvent } from 'common/segment/segment'
import { SegmentEvent } from 'common/segment/types'

import {
    PromoCardContent,
    PromoCardVariant,
    TrialType,
} from '../../types/ShoppingAssistant'
import { AdminTrialProgress } from '../AdminTrialProgress'

jest.mock('common/segment/segment', () => ({
    logEvent: jest.fn(),
}))

jest.mock('@repo/hooks', () => ({
    useEffectOnce: jest.fn((callback) => callback()),
    useLocalStorage: jest.fn(() => [false, jest.fn(), jest.fn()]),
}))

const mockLogEvent = logEvent as jest.MockedFunction<typeof logEvent>

describe('AdminTrialProgress', () => {
    const mockPrimaryButton = {
        label: 'Primary Action',
        onClick: jest.fn(),
        disabled: false,
        isLoading: false,
    }

    const mockSecondaryButton = {
        label: 'Secondary Action',
        onClick: jest.fn(),
        disabled: false,
    }

    const basePromoContent: PromoCardContent = {
        variant: PromoCardVariant.AdminTrialProgress,
        title: 'Trial Progress Title',
        description: 'This is a trial progress description',
        shouldShowDescriptionIcon: false,
        showVideo: false,
        shouldShowNotificationIcon: false,
        primaryButton: mockPrimaryButton,
        showProgressBar: false,
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Basic Rendering', () => {
        it('should render with required props', () => {
            render(
                <AdminTrialProgress
                    promoContent={basePromoContent}
                    trialType={TrialType.ShoppingAssistant}
                />,
            )

            expect(screen.getByText('Trial Progress Title')).toBeInTheDocument()
            expect(
                screen.getByText('This is a trial progress description'),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /primary action/i }),
            ).toBeInTheDocument()
        })

        it('should apply custom className', () => {
            const customClass = 'custom-admin-trial-class'
            const { container } = render(
                <AdminTrialProgress
                    className={customClass}
                    promoContent={basePromoContent}
                    trialType={TrialType.ShoppingAssistant}
                />,
            )

            const promoCardElement = container.querySelector(`.${customClass}`)
            expect(promoCardElement).toBeInTheDocument()
        })

        it('should render with correct variant in promoContent', () => {
            render(
                <AdminTrialProgress
                    promoContent={basePromoContent}
                    trialType={TrialType.ShoppingAssistant}
                />,
            )

            expect(basePromoContent.variant).toBe(
                PromoCardVariant.AdminTrialProgress,
            )
        })
    })

    describe('Segment Event Logging', () => {
        it('should log TrialBannerSettingsViewed event on mount', () => {
            render(
                <AdminTrialProgress
                    promoContent={basePromoContent}
                    trialType={TrialType.ShoppingAssistant}
                />,
            )

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.TrialBannerSettingsViewed,
                {
                    trialType: TrialType.ShoppingAssistant,
                },
            )
            expect(mockLogEvent).toHaveBeenCalledTimes(1)
        })
    })

    describe('Description Icon', () => {
        it('should show description icon when shouldShowDescriptionIcon is true', () => {
            const promoContentWithIcon = {
                ...basePromoContent,
                shouldShowDescriptionIcon: true,
            }

            render(
                <AdminTrialProgress
                    promoContent={promoContentWithIcon}
                    trialType={TrialType.ShoppingAssistant}
                />,
            )

            const iconElement = document.querySelector('.descriptionIcon')
            expect(iconElement).toBeInTheDocument()
        })

        it('should hide description icon when shouldShowDescriptionIcon is false', () => {
            const promoContentWithoutIcon = {
                ...basePromoContent,
                shouldShowDescriptionIcon: false,
            }

            render(
                <AdminTrialProgress
                    promoContent={promoContentWithoutIcon}
                    trialType={TrialType.ShoppingAssistant}
                />,
            )

            const iconElement = document.querySelector('.descriptionIcon')
            expect(iconElement).not.toBeInTheDocument()
        })
    })

    describe('Progress Bar', () => {
        it('should show progress bar when showProgressBar is true and progressPercentage is defined', () => {
            const promoContentWithProgress = {
                ...basePromoContent,
                showProgressBar: true,
                progressPercentage: 75,
            }

            const { container } = render(
                <AdminTrialProgress
                    promoContent={promoContentWithProgress}
                    trialType={TrialType.ShoppingAssistant}
                />,
            )

            const progressBarTrack = container.querySelector(
                '[style*="width: 75%"]',
            )
            expect(progressBarTrack).toBeInTheDocument()
        })

        it('should not show progress bar when showProgressBar is false', () => {
            const promoContentWithoutProgress = {
                ...basePromoContent,
                showProgressBar: false,
                progressPercentage: 75,
            }

            const { container } = render(
                <AdminTrialProgress
                    promoContent={promoContentWithoutProgress}
                    trialType={TrialType.ShoppingAssistant}
                />,
            )

            const progressBarTrack = container.querySelector(
                '[style*="width: 75%"]',
            )
            expect(progressBarTrack).not.toBeInTheDocument()
        })

        it('should not show progress bar when progressPercentage is undefined', () => {
            const promoContentWithoutPercentage = {
                ...basePromoContent,
                showProgressBar: true,
                progressPercentage: undefined,
            }

            const { container } = render(
                <AdminTrialProgress
                    promoContent={promoContentWithoutPercentage}
                    trialType={TrialType.ShoppingAssistant}
                />,
            )

            const progressSection = container.querySelector(
                '[class*="progressSection"]',
            )
            expect(progressSection).not.toBeInTheDocument()
        })

        it('should show progress text when provided', () => {
            const progressText = '7 days remaining'
            const promoContentWithProgressText = {
                ...basePromoContent,
                showProgressBar: true,
                progressPercentage: 50,
                progressText,
            }

            render(
                <AdminTrialProgress
                    promoContent={promoContentWithProgressText}
                    trialType={TrialType.ShoppingAssistant}
                />,
            )

            expect(screen.getByText(progressText)).toBeInTheDocument()
        })

        it('should not show progress text when not provided', () => {
            const promoContentWithoutProgressText = {
                ...basePromoContent,
                showProgressBar: true,
                progressPercentage: 50,
            }

            const { container } = render(
                <AdminTrialProgress
                    promoContent={promoContentWithoutProgressText}
                    trialType={TrialType.ShoppingAssistant}
                />,
            )

            const progressTextElement =
                container.querySelector('[class*="text"]')
            expect(progressTextElement).not.toBeInTheDocument()
        })
    })

    describe('Action Buttons', () => {
        it('should render primary button with correct props', () => {
            const primaryButtonWithHref = {
                label: 'Upgrade Now',
                href: '/upgrade',
                target: '_blank',
                disabled: false,
                isLoading: false,
            }

            const promoContentWithHref = {
                ...basePromoContent,
                primaryButton: primaryButtonWithHref,
            }

            render(
                <AdminTrialProgress
                    promoContent={promoContentWithHref}
                    trialType={TrialType.ShoppingAssistant}
                />,
            )

            const primaryButton = screen.getByRole('link', {
                name: /upgrade now/i,
            })
            expect(primaryButton).toBeInTheDocument()
            expect(primaryButton).toHaveAttribute('href', '/upgrade')
            expect(primaryButton).toHaveAttribute('target', '_blank')
        })

        it('should handle primary button click', async () => {
            const user = userEvent.setup()
            render(
                <AdminTrialProgress
                    promoContent={basePromoContent}
                    trialType={TrialType.ShoppingAssistant}
                />,
            )

            const primaryButton = screen.getByRole('button', {
                name: /primary action/i,
            })
            await user.click(primaryButton)

            expect(mockPrimaryButton.onClick).toHaveBeenCalledTimes(1)
        })

        it('should render disabled primary button when disabled prop is true', () => {
            const disabledPrimaryButton = {
                ...mockPrimaryButton,
                disabled: true,
            }

            const promoContentWithDisabledButton = {
                ...basePromoContent,
                primaryButton: disabledPrimaryButton,
            }

            render(
                <AdminTrialProgress
                    promoContent={promoContentWithDisabledButton}
                    trialType={TrialType.ShoppingAssistant}
                />,
            )

            const primaryButton = screen.getByRole('button', {
                name: /primary action/i,
            })
            expect(primaryButton).toHaveAttribute('aria-disabled', 'true')
        })

        it('should render loading primary button when isLoading is true', () => {
            const loadingPrimaryButton = {
                ...mockPrimaryButton,
                isLoading: true,
            }

            const promoContentWithLoadingButton = {
                ...basePromoContent,
                primaryButton: loadingPrimaryButton,
            }

            render(
                <AdminTrialProgress
                    promoContent={promoContentWithLoadingButton}
                    trialType={TrialType.ShoppingAssistant}
                />,
            )

            const primaryButton = screen.getByRole('button', {
                name: /primary action/i,
            })
            expect(primaryButton).toBeInTheDocument()
            expect(
                primaryButton.querySelector('[class*="spinner"]'),
            ).toBeInTheDocument()
        })

        it('should render secondary button when provided', () => {
            const promoContentWithSecondary = {
                ...basePromoContent,
                secondaryButton: mockSecondaryButton,
            }

            render(
                <AdminTrialProgress
                    promoContent={promoContentWithSecondary}
                    trialType={TrialType.ShoppingAssistant}
                />,
            )

            expect(
                screen.getByRole('button', { name: /secondary action/i }),
            ).toBeInTheDocument()
        })

        it('should not render secondary button when not provided', () => {
            render(
                <AdminTrialProgress
                    promoContent={basePromoContent}
                    trialType={TrialType.ShoppingAssistant}
                />,
            )

            expect(
                screen.queryByRole('button', { name: /secondary action/i }),
            ).not.toBeInTheDocument()
        })

        it('should handle secondary button click', async () => {
            const user = userEvent.setup()
            const promoContentWithSecondary = {
                ...basePromoContent,
                secondaryButton: mockSecondaryButton,
            }

            render(
                <AdminTrialProgress
                    promoContent={promoContentWithSecondary}
                    trialType={TrialType.ShoppingAssistant}
                />,
            )

            const secondaryButton = screen.getByRole('button', {
                name: /secondary action/i,
            })
            await user.click(secondaryButton)

            expect(mockSecondaryButton.onClick).toHaveBeenCalledTimes(1)
        })

        it('should render secondary button with href as link', () => {
            const secondaryButtonWithHref = {
                ...mockSecondaryButton,
                href: '/manage-trial',
                target: '_self',
            }

            const promoContentWithSecondaryLink = {
                ...basePromoContent,
                secondaryButton: secondaryButtonWithHref,
            }

            render(
                <AdminTrialProgress
                    promoContent={promoContentWithSecondaryLink}
                    trialType={TrialType.ShoppingAssistant}
                />,
            )

            const secondaryButton = screen.getByRole('link', {
                name: /secondary action/i,
            })
            expect(secondaryButton).toHaveAttribute('href', '/manage-trial')
            expect(secondaryButton).toHaveAttribute('target', '_self')
        })
    })

    describe('PromoCard Configuration', () => {
        it('should render collapsible PromoCard with defaultCollapsed set to false', () => {
            render(
                <AdminTrialProgress
                    promoContent={basePromoContent}
                    trialType={TrialType.ShoppingAssistant}
                />,
            )

            const collapseButton = screen.queryByRole('button', {
                name: /collapse/i,
            })
            expect(collapseButton).toBeInTheDocument()
        })
    })

    describe('Edge Cases', () => {
        it('should render without description', () => {
            const promoContentWithoutDescription = {
                ...basePromoContent,
                description: '',
            }

            render(
                <AdminTrialProgress
                    promoContent={promoContentWithoutDescription}
                    trialType={TrialType.ShoppingAssistant}
                />,
            )

            expect(screen.getByText('Trial Progress Title')).toBeInTheDocument()
            expect(
                screen.queryByText('This is a trial progress description'),
            ).not.toBeInTheDocument()
        })

        it('should handle all possible button configurations together', () => {
            const complexPromoContent = {
                ...basePromoContent,
                shouldShowDescriptionIcon: true,
                showProgressBar: true,
                progressPercentage: 60,
                progressText: '12 out of 20 conversions',
                secondaryButton: mockSecondaryButton,
            }

            const { container } = render(
                <AdminTrialProgress
                    promoContent={complexPromoContent}
                    trialType={TrialType.ShoppingAssistant}
                />,
            )

            expect(screen.getByText('Trial Progress Title')).toBeInTheDocument()
            expect(
                screen.getByText('This is a trial progress description'),
            ).toBeInTheDocument()
            expect(
                container.querySelector('[class*="descriptionIcon"]'),
            ).toBeInTheDocument()
            expect(
                container.querySelector('[style*="width: 60%"]'),
            ).toBeInTheDocument()
            expect(
                screen.getByText('12 out of 20 conversions'),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /primary action/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /secondary action/i }),
            ).toBeInTheDocument()
        })
    })
})
