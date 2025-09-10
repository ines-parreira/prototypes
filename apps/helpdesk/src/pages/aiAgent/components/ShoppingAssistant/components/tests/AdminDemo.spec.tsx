import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
    PromoCardContent,
    PromoCardVariant,
    TrialType,
} from '../../types/ShoppingAssistant'
import { AdminDemo } from '../AdminDemo'

let capturedPromoCardProps: any = {}

jest.mock('pages/common/components/PromoCard', () => {
    const MockPromoCard = ({
        children,
        dismissible,
        storageKey,
        collapsible,
        defaultCollapsed,
        ...domProps
    }: {
        children: React.ReactNode
        dismissible?: boolean
        storageKey?: string
        collapsible?: boolean
        defaultCollapsed?: boolean
    }) => {
        capturedPromoCardProps = {
            dismissible,
            storageKey,
            collapsible,
            defaultCollapsed,
        }
        return <div {...domProps}>{children}</div>
    }
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
    variant: PromoCardVariant.AdminDemo,
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

const renderAdminDemo = (
    trialType: TrialType = TrialType.ShoppingAssistant,
    storageKey?: string,
) => {
    return render(
        <AdminDemo
            promoContent={mockPromoContent}
            trialType={trialType}
            storageKey={storageKey}
        />,
    )
}

describe('AdminDemo', () => {
    beforeEach(() => {
        capturedPromoCardProps = {}
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renders the component with basic promo content', () => {
        renderAdminDemo()
        expect(screen.getByText('Test Title')).toBeInTheDocument()
        expect(screen.getByText('Test Description')).toBeInTheDocument()
        expect(screen.getByText('Primary')).toBeInTheDocument()
        expect(screen.getByText('Secondary')).toBeInTheDocument()
    })

    it('shows video content when showVideo is true', () => {
        renderAdminDemo()
        expect(screen.getByTestId('video-thumbnail')).toBeInTheDocument()
        expect(screen.getByTestId('video-modal')).toBeInTheDocument()
    })

    it('does not show video content when showVideo is false', () => {
        render(
            <AdminDemo
                promoContent={{ ...mockPromoContent, showVideo: false }}
                trialType={TrialType.ShoppingAssistant}
            />,
        )
        expect(screen.queryByTestId('video-thumbnail')).not.toBeInTheDocument()
        expect(screen.queryByTestId('video-modal')).not.toBeInTheDocument()
    })

    it('shows notification icon on buttons when shouldShowNotificationIcon is true', () => {
        render(
            <AdminDemo
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
        renderAdminDemo()
        expect(
            screen.queryByTestId('action-button-icon'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByTestId('video-modal-cta-icon'),
        ).not.toBeInTheDocument()
    })

    it('handles clicks on primary, secondary, and video modal buttons', async () => {
        const user = userEvent.setup()
        renderAdminDemo()

        await user.click(screen.getByText('Primary'))
        expect(mockPromoContent.primaryButton.onClick).toHaveBeenCalled()

        await user.click(screen.getByText('Secondary'))
        expect(mockPromoContent.secondaryButton!.onClick).toHaveBeenCalled()

        await user.click(screen.getByText('Watch Video'))
        expect(mockPromoContent.videoModalButton!.onClick).toHaveBeenCalled()
    })

    it('does not render secondary button if not provided', () => {
        render(
            <AdminDemo
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
            <AdminDemo
                promoContent={{
                    ...mockPromoContent,
                    videoModalButton: undefined,
                }}
                trialType={TrialType.ShoppingAssistant}
            />,
        )
        expect(screen.queryByTestId('video-modal-cta')).not.toBeInTheDocument()
    })

    describe('trial type conditional rendering', () => {
        it('renders AI Agent content when trialType is AiAgent', () => {
            renderAdminDemo(TrialType.AiAgent)

            // Check that AI Agent specific content is rendered
            expect(screen.getByTestId('video-thumbnail')).toBeInTheDocument()
            expect(screen.getByTestId('video-modal')).toBeInTheDocument()

            // Check that the video URL shows the AI Agent trial video
            expect(screen.getByTestId('video-thumbnail-url')).toHaveTextContent(
                'test-file-stub',
            )
            expect(screen.getByTestId('video-modal-url')).toHaveTextContent(
                'test-file-stub',
            )
        })

        it('renders Shopping Assistant content when trialType is ShoppingAssistant', () => {
            renderAdminDemo(TrialType.ShoppingAssistant)

            // Check that Shopping Assistant specific content is rendered
            expect(screen.getByTestId('video-thumbnail')).toBeInTheDocument()
            expect(screen.getByTestId('video-modal')).toBeInTheDocument()

            // Check that the video URL shows the Shopping Assistant video
            expect(screen.getByTestId('video-thumbnail-url')).toHaveTextContent(
                'test-file-stub',
            )
            expect(screen.getByTestId('video-modal-url')).toHaveTextContent(
                'test-file-stub',
            )
        })

        it('uses correct poster image for AI Agent trial', () => {
            renderAdminDemo(TrialType.AiAgent)

            const posterImage = screen.getByTestId('video-thumbnail-poster')
            expect(posterImage).toHaveAttribute('src', 'test-file-stub')
            expect(posterImage).toHaveAttribute('alt', 'AI Agent Demo')
        })

        it('uses correct poster image for Shopping Assistant trial', () => {
            renderAdminDemo(TrialType.ShoppingAssistant)

            const posterImage = screen.getByTestId('video-thumbnail-poster')
            expect(posterImage).toHaveAttribute('src', 'test-file-stub')
            expect(posterImage).toHaveAttribute(
                'alt',
                'Shopping Assistant Demo',
            )
        })
    })

    describe('dismissible and storageKey props', () => {
        it('passes dismissible=true and storageKey to PromoCard for AI Agent trial', () => {
            const testStorageKey = 'test-storage-key'
            renderAdminDemo(TrialType.AiAgent, testStorageKey)

            expect(capturedPromoCardProps.dismissible).toBe(true)
            expect(capturedPromoCardProps.storageKey).toBe(testStorageKey)
        })

        it('passes dismissible=false to PromoCard for Shopping Assistant trial', () => {
            const testStorageKey = 'test-storage-key'
            renderAdminDemo(TrialType.ShoppingAssistant, testStorageKey)

            expect(capturedPromoCardProps.dismissible).toBe(false)
            expect(capturedPromoCardProps.storageKey).toBe(testStorageKey)
        })

        it('handles missing storageKey prop gracefully', () => {
            renderAdminDemo(TrialType.AiAgent)

            expect(capturedPromoCardProps.dismissible).toBe(true)
            expect(capturedPromoCardProps.storageKey).toBeUndefined()
        })

        it('correctly determines dismissible based on trial type', () => {
            const { rerender } = render(
                <AdminDemo
                    promoContent={mockPromoContent}
                    trialType={TrialType.AiAgent}
                    storageKey="test-key"
                />,
            )
            expect(capturedPromoCardProps.dismissible).toBe(true)
            expect(capturedPromoCardProps.storageKey).toBe('test-key')

            rerender(
                <AdminDemo
                    promoContent={mockPromoContent}
                    trialType={TrialType.ShoppingAssistant}
                    storageKey="test-key"
                />,
            )
            expect(capturedPromoCardProps.dismissible).toBe(false)
            expect(capturedPromoCardProps.storageKey).toBe('test-key')
        })

        it('passes through other PromoCard props correctly', () => {
            renderAdminDemo(TrialType.AiAgent, 'test-key')

            expect(capturedPromoCardProps.collapsible).toBeUndefined()
            expect(capturedPromoCardProps.defaultCollapsed).toBeUndefined()
        })
    })
})
