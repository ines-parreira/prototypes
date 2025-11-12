import { logEvent, SegmentEvent } from '@repo/logging'
import { render, screen } from '@testing-library/react'

import { PromoCardVariant, TrialType } from '../../types/ShoppingAssistant'
import { LeadTrialProgress } from '../LeadTrialProgress'

jest.mock('@repo/logging', () => ({
    ...jest.requireActual('@repo/logging'),
    logEvent: jest.fn(),
}))

jest.mock('../SharedIcons', () => ({
    GMVIcon: ({ className }: { className?: string }) => (
        <span data-testid="gmv-icon" className={className}>
            GMV Icon
        </span>
    ),
    NotificationIcon: ({ className }: { className?: string }) => (
        <span data-testid="notification-icon" className={className}>
            Notification Icon
        </span>
    ),
}))

const mockLogEvent = logEvent as jest.MockedFunction<typeof logEvent>

const defaultPromoContent = {
    variant: PromoCardVariant.LeadTrialProgress,
    title: 'Test Title',
    description: 'Test Description',
    shouldShowDescriptionIcon: false,
    showVideo: false,
    shouldShowNotificationIcon: false,
    primaryButton: {
        label: 'Test Button',
        onClick: jest.fn(),
        disabled: false,
        isLoading: false,
    },
}

describe('LeadTrialProgress', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('when component mounts', () => {
        it('should log the trial banner settings viewed event', () => {
            render(
                <LeadTrialProgress
                    promoContent={defaultPromoContent}
                    trialType={TrialType.ShoppingAssistant}
                />,
            )

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.TrialBannerSettingsViewed,
                {
                    trialType: TrialType.ShoppingAssistant,
                },
            )
        })
    })

    describe('when rendering basic content', () => {
        it('should render the title and description', () => {
            render(
                <LeadTrialProgress
                    promoContent={defaultPromoContent}
                    trialType={TrialType.ShoppingAssistant}
                />,
            )

            expect(screen.getByText('Test Title')).toBeInTheDocument()
            expect(screen.getByText('Test Description')).toBeInTheDocument()
        })

        it('should render the primary button with correct label', () => {
            render(
                <LeadTrialProgress
                    promoContent={defaultPromoContent}
                    trialType={TrialType.ShoppingAssistant}
                />,
            )

            expect(
                screen.getByRole('button', { name: /test button/i }),
            ).toBeInTheDocument()
        })

        it('should apply custom className when provided', () => {
            const customClass = 'custom-test-class'
            const { container } = render(
                <LeadTrialProgress
                    className={customClass}
                    promoContent={defaultPromoContent}
                    trialType={TrialType.ShoppingAssistant}
                />,
            )

            const promoCard = container.querySelector('.promoCard')
            expect(promoCard).toHaveClass(customClass)
        })
    })

    describe('when description icon should be shown', () => {
        it('should render the GMV icon alongside description', () => {
            const promoContentWithIcon = {
                ...defaultPromoContent,
                shouldShowDescriptionIcon: true,
            }

            render(
                <LeadTrialProgress
                    promoContent={promoContentWithIcon}
                    trialType={TrialType.ShoppingAssistant}
                />,
            )

            expect(screen.getByTestId('gmv-icon')).toBeInTheDocument()
            expect(screen.getByText('Test Description')).toBeInTheDocument()
        })

        it('should not render the GMV icon when shouldShowDescriptionIcon is false', () => {
            render(
                <LeadTrialProgress
                    promoContent={defaultPromoContent}
                    trialType={TrialType.ShoppingAssistant}
                />,
            )

            expect(screen.queryByTestId('gmv-icon')).not.toBeInTheDocument()
        })
    })

    describe('when notification icon should be shown', () => {
        it('should render the notification icon on the button', () => {
            const promoContentWithNotification = {
                ...defaultPromoContent,
                shouldShowNotificationIcon: true,
            }

            render(
                <LeadTrialProgress
                    promoContent={promoContentWithNotification}
                    trialType={TrialType.ShoppingAssistant}
                />,
            )

            expect(screen.getByTestId('notification-icon')).toBeInTheDocument()
        })

        it('should not render the notification icon when shouldShowNotificationIcon is false', () => {
            render(
                <LeadTrialProgress
                    promoContent={defaultPromoContent}
                    trialType={TrialType.ShoppingAssistant}
                />,
            )

            expect(
                screen.queryByTestId('notification-icon'),
            ).not.toBeInTheDocument()
        })
    })

    describe('when progress bar should be shown', () => {
        it('should render progress bar with percentage and text', () => {
            const promoContentWithProgress = {
                ...defaultPromoContent,
                showProgressBar: true,
                progressPercentage: 75,
                progressText: '3 of 4 completed',
            }

            render(
                <LeadTrialProgress
                    promoContent={promoContentWithProgress}
                    trialType={TrialType.ShoppingAssistant}
                />,
            )

            expect(screen.getByText('3 of 4 completed')).toBeInTheDocument()
        })

        it('should render progress bar without text when progressText is not provided', () => {
            const promoContentWithProgress = {
                ...defaultPromoContent,
                showProgressBar: true,
                progressPercentage: 50,
            }

            render(
                <LeadTrialProgress
                    promoContent={promoContentWithProgress}
                    trialType={TrialType.ShoppingAssistant}
                />,
            )

            // Progress bar should be rendered but no progress text
            expect(screen.queryByText(/completed/)).not.toBeInTheDocument()
        })

        it('should not render progress bar when showProgressBar is false', () => {
            const promoContentWithoutProgress = {
                ...defaultPromoContent,
                showProgressBar: false,
                progressPercentage: 75,
                progressText: '3 of 4 completed',
            }

            render(
                <LeadTrialProgress
                    promoContent={promoContentWithoutProgress}
                    trialType={TrialType.ShoppingAssistant}
                />,
            )

            expect(
                screen.queryByText('3 of 4 completed'),
            ).not.toBeInTheDocument()
        })

        it('should not render progress bar when progressPercentage is undefined', () => {
            const promoContentWithoutPercentage = {
                ...defaultPromoContent,
                showProgressBar: true,
                progressText: '3 of 4 completed',
            }

            render(
                <LeadTrialProgress
                    promoContent={promoContentWithoutPercentage}
                    trialType={TrialType.ShoppingAssistant}
                />,
            )

            expect(
                screen.queryByText('3 of 4 completed'),
            ).not.toBeInTheDocument()
        })
    })

    describe('when primary button has different configurations', () => {
        it('should render disabled button when disabled prop is true', () => {
            const promoContentWithDisabledButton = {
                ...defaultPromoContent,
                primaryButton: {
                    ...defaultPromoContent.primaryButton,
                    disabled: true,
                },
            }

            render(
                <LeadTrialProgress
                    promoContent={promoContentWithDisabledButton}
                    trialType={TrialType.ShoppingAssistant}
                />,
            )

            const button = screen.getByRole('button', { name: /test button/i })
            expect(button).toHaveAttribute('aria-disabled', 'true')
        })

        it('should render button with href when provided', () => {
            const promoContentWithHref = {
                ...defaultPromoContent,
                primaryButton: {
                    ...defaultPromoContent.primaryButton,
                    href: 'https://example.com',
                    target: '_blank',
                },
            }

            render(
                <LeadTrialProgress
                    promoContent={promoContentWithHref}
                    trialType={TrialType.ShoppingAssistant}
                />,
            )

            const link = screen.getByRole('link', { name: /test button/i })
            expect(link).toHaveAttribute('href', 'https://example.com')
            expect(link).toHaveAttribute('target', '_blank')
        })
    })

    describe('when description is not provided', () => {
        it('should not render description section', () => {
            const promoContentWithoutDescription = {
                ...defaultPromoContent,
                description: '',
            }

            render(
                <LeadTrialProgress
                    promoContent={promoContentWithoutDescription}
                    trialType={TrialType.ShoppingAssistant}
                />,
            )

            expect(screen.getByText('Test Title')).toBeInTheDocument()
            expect(
                screen.queryByText('Test Description'),
            ).not.toBeInTheDocument()
        })
    })

    describe('when button label is not provided', () => {
        it('should not render the primary action button', () => {
            const promoContentWithoutButtonLabel = {
                ...defaultPromoContent,
                primaryButton: {
                    ...defaultPromoContent.primaryButton,
                    label: '',
                },
            }

            render(
                <LeadTrialProgress
                    promoContent={promoContentWithoutButtonLabel}
                    trialType={TrialType.ShoppingAssistant}
                />,
            )

            expect(
                screen.queryByRole('button', { name: /test button/i }),
            ).not.toBeInTheDocument()
        })
    })
})
