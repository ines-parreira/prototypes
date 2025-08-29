import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
    PromoCardContent,
    PromoCardVariant,
    TrialType,
} from '../../types/ShoppingAssistant'
import { AdminTrial } from '../AdminTrial'

jest.mock('pages/common/components/PromoCard', () => {
    const MockPromoCard = ({
        children,
        ...props
    }: {
        children: React.ReactNode
    }) => <div {...props}>{children}</div>
    MockPromoCard.Media = ({
        children,
        ...props
    }: {
        children: React.ReactNode
    }) => <div {...props}>{children}</div>
    MockPromoCard.VideoThumbnail = ({
        videoUrl,
        poster,
        alt,
        ...domProps
    }: any) => (
        <div data-testid="video-thumbnail" {...domProps}>
            <img
                src={poster || 'test-file-stub'}
                alt={alt || 'test-alt'}
                data-testid="video-thumbnail-poster"
            />
            <div data-testid="video-thumbnail-url">
                {videoUrl || 'test-file-stub'}
            </div>
        </div>
    )
    MockPromoCard.VideoModal = ({
        ctaButton,
        videoUrl,
        ...domProps
    }: {
        ctaButton?: any
        videoUrl?: string
    }) => (
        <div data-testid="video-modal" {...domProps}>
            <div data-testid="video-modal-url">
                {videoUrl || 'test-file-stub'}
            </div>
            {ctaButton && (
                <button
                    data-testid="video-modal-cta"
                    onClick={ctaButton.onClick}
                >
                    {ctaButton.label}
                </button>
            )}
            {ctaButton?.Icon && <div data-testid="video-modal-cta-icon" />}
        </div>
    )
    MockPromoCard.Content = ({
        children,
        ...props
    }: {
        children: React.ReactNode
    }) => <div {...props}>{children}</div>
    MockPromoCard.Header = ({
        children,
        ...props
    }: {
        children: React.ReactNode
    }) => <div {...props}>{children}</div>
    MockPromoCard.Title = ({
        children,
        ...props
    }: {
        children: React.ReactNode
    }) => <h1 {...props}>{children}</h1>
    MockPromoCard.Description = ({
        children,
        ...props
    }: {
        children: React.ReactNode
    }) => <p {...props}>{children}</p>
    MockPromoCard.Actions = ({
        children,
        ...props
    }: {
        children: React.ReactNode
    }) => <div {...props}>{children}</div>
    MockPromoCard.ActionButton = ({
        Icon,
        ...props
    }: {
        Icon?: React.ElementType
        label: string
        onClick?: () => void
    }) => (
        <div>
            <button onClick={props.onClick}>{props.label}</button>
            {Icon && <div data-testid="action-button-icon" />}
        </div>
    )
    return { PromoCard: MockPromoCard }
})

const mockPromoContent: PromoCardContent = {
    title: 'Test Title',
    description: 'Test Description',
    variant: PromoCardVariant.AdminTrial,
    showVideo: true,
    shouldShowNotificationIcon: false,
    shouldShowDescriptionIcon: false,
    primaryButton: {
        label: 'Primary',
        href: '/primary',
        onClick: jest.fn(),
    },
    secondaryButton: {
        label: 'Secondary',
        href: '/secondary',
        onClick: jest.fn(),
    },
    videoModalButton: {
        label: 'Watch Video',
        onClick: jest.fn(),
    },
}

describe('AdminTrial', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renders the component with basic promo content', () => {
        render(
            <AdminTrial
                promoContent={mockPromoContent}
                trialType={TrialType.ShoppingAssistant}
            />,
        )
        expect(screen.getByText('Test Title')).toBeInTheDocument()
        expect(screen.getByText('Test Description')).toBeInTheDocument()
        expect(screen.getByText('Primary')).toBeInTheDocument()
        expect(screen.getByText('Secondary')).toBeInTheDocument()
    })

    it('shows video content when showVideo is true', () => {
        render(
            <AdminTrial
                promoContent={mockPromoContent}
                trialType={TrialType.ShoppingAssistant}
            />,
        )
        expect(screen.getByTestId('video-thumbnail')).toBeInTheDocument()
        expect(screen.getByTestId('video-modal')).toBeInTheDocument()
    })

    it('does not show video content when showVideo is false', () => {
        render(
            <AdminTrial
                promoContent={{ ...mockPromoContent, showVideo: false }}
                trialType={TrialType.ShoppingAssistant}
            />,
        )
        expect(screen.queryByTestId('video-thumbnail')).not.toBeInTheDocument()
        expect(screen.queryByTestId('video-modal')).not.toBeInTheDocument()
    })

    it('shows notification icon on buttons when shouldShowNotificationIcon is true', () => {
        render(
            <AdminTrial
                promoContent={{
                    ...mockPromoContent,
                    shouldShowNotificationIcon: true,
                }}
                trialType={TrialType.ShoppingAssistant}
            />,
        )
        expect(screen.getAllByTestId('action-button-icon')).toHaveLength(1)
        expect(screen.getByTestId('video-modal-cta-icon')).toBeInTheDocument()
    })

    it('does not show notification icon on buttons when shouldShowNotificationIcon is false', () => {
        render(
            <AdminTrial
                promoContent={mockPromoContent}
                trialType={TrialType.ShoppingAssistant}
            />,
        )
        expect(
            screen.queryByTestId('action-button-icon'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByTestId('video-modal-cta-icon'),
        ).not.toBeInTheDocument()
    })

    it('handles clicks on primary, secondary, and video modal buttons', async () => {
        const user = userEvent.setup()
        render(
            <AdminTrial
                promoContent={mockPromoContent}
                trialType={TrialType.ShoppingAssistant}
            />,
        )

        await user.click(screen.getByText('Primary'))
        expect(mockPromoContent.primaryButton.onClick).toHaveBeenCalled()

        await user.click(screen.getByText('Secondary'))
        expect(mockPromoContent.secondaryButton!.onClick).toHaveBeenCalled()

        await user.click(screen.getByText('Watch Video'))
        expect(mockPromoContent.videoModalButton!.onClick).toHaveBeenCalled()
    })

    it('does not render secondary button if not provided', () => {
        render(
            <AdminTrial
                promoContent={{
                    ...mockPromoContent,
                    secondaryButton: undefined,
                }}
                trialType={TrialType.ShoppingAssistant}
            />,
        )
        expect(screen.queryByText('Secondary')).not.toBeInTheDocument()
    })

    it('does not render video modal CTA if not provided', () => {
        render(
            <AdminTrial
                promoContent={{
                    ...mockPromoContent,
                    videoModalButton: undefined,
                }}
                trialType={TrialType.ShoppingAssistant}
            />,
        )
        expect(screen.queryByTestId('video-modal-cta')).not.toBeInTheDocument()
    })

    describe('trialType prop handling', () => {
        it('renders with ShoppingAssistant trial type by default', () => {
            render(
                <AdminTrial
                    promoContent={mockPromoContent}
                    trialType={TrialType.ShoppingAssistant}
                />,
            )

            const videoThumbnail = screen.getByTestId('video-thumbnail')
            expect(videoThumbnail).toBeInTheDocument()
            const posterImage = screen.getByTestId('video-thumbnail-poster')
            expect(posterImage).toHaveAttribute(
                'alt',
                'Shopping Assistant Demo',
            )
        })

        it('renders with AI Agent trial type correctly', () => {
            render(
                <AdminTrial
                    promoContent={mockPromoContent}
                    trialType={TrialType.AiAgent}
                />,
            )

            const videoThumbnail = screen.getByTestId('video-thumbnail')
            expect(videoThumbnail).toBeInTheDocument()
            const posterImage = screen.getByTestId('video-thumbnail-poster')
            expect(posterImage).toHaveAttribute('alt', 'AI Agent Demo')
        })

        it('applies correct CSS class for ShoppingAssistant trial type', () => {
            render(
                <AdminTrial
                    promoContent={mockPromoContent}
                    trialType={TrialType.ShoppingAssistant}
                />,
            )

            const videoThumbnail = screen.getByTestId('video-thumbnail')
            expect(videoThumbnail).toHaveClass('videoThumbnail')
        })

        it('applies correct CSS class for AI Agent trial type', () => {
            render(
                <AdminTrial
                    promoContent={mockPromoContent}
                    trialType={TrialType.AiAgent}
                />,
            )

            const videoThumbnail = screen.getByTestId('video-thumbnail')
            expect(videoThumbnail).toHaveClass('videoThumbnailAiAgent')
        })

        it('handles trialType prop changes correctly', () => {
            const { rerender } = render(
                <AdminTrial
                    promoContent={mockPromoContent}
                    trialType={TrialType.ShoppingAssistant}
                />,
            )

            // Initial render with ShoppingAssistant
            let videoThumbnail = screen.getByTestId('video-thumbnail')
            let posterImage = screen.getByTestId('video-thumbnail-poster')
            expect(posterImage).toHaveAttribute(
                'alt',
                'Shopping Assistant Demo',
            )
            expect(videoThumbnail).toHaveClass('videoThumbnail')

            // Re-render with AI Agent
            rerender(
                <AdminTrial
                    promoContent={mockPromoContent}
                    trialType={TrialType.AiAgent}
                />,
            )

            videoThumbnail = screen.getByTestId('video-thumbnail')
            posterImage = screen.getByTestId('video-thumbnail-poster')
            expect(posterImage).toHaveAttribute('alt', 'AI Agent Demo')
            expect(videoThumbnail).toHaveClass('videoThumbnailAiAgent')
        })

        it('uses correct video URL for AI Agent trial', () => {
            render(
                <AdminTrial
                    promoContent={mockPromoContent}
                    trialType={TrialType.AiAgent}
                />,
            )

            expect(screen.getByTestId('video-thumbnail-url')).toHaveTextContent(
                'test-file-stub',
            )
            expect(screen.getByTestId('video-modal-url')).toHaveTextContent(
                'test-file-stub',
            )
        })

        it('uses correct video URL for Shopping Assistant trial', () => {
            render(
                <AdminTrial
                    promoContent={mockPromoContent}
                    trialType={TrialType.ShoppingAssistant}
                />,
            )

            expect(screen.getByTestId('video-thumbnail-url')).toHaveTextContent(
                'test-file-stub',
            )
            expect(screen.getByTestId('video-modal-url')).toHaveTextContent(
                'test-file-stub',
            )
        })

        it('uses correct poster image for AI Agent trial', () => {
            render(
                <AdminTrial
                    promoContent={mockPromoContent}
                    trialType={TrialType.AiAgent}
                />,
            )

            const posterImage = screen.getByTestId('video-thumbnail-poster')
            expect(posterImage).toHaveAttribute('src', 'test-file-stub')
        })

        it('uses correct poster image for Shopping Assistant trial', () => {
            render(
                <AdminTrial
                    promoContent={mockPromoContent}
                    trialType={TrialType.ShoppingAssistant}
                />,
            )

            const posterImage = screen.getByTestId('video-thumbnail-poster')
            expect(posterImage).toHaveAttribute('src', 'test-file-stub')
        })
    })
})
