import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
    PromoCardContent,
    PromoCardVariant,
} from '../../types/ShoppingAssistant'
import { LeadNotify } from '../LeadNotify'

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
    MockPromoCard.VideoThumbnail = (props: any) => (
        <div data-testid="video-thumbnail" {...props} />
    )
    MockPromoCard.VideoModal = ({
        ctaButton,
        ...props
    }: {
        ctaButton?: any
    }) => (
        <div data-testid="video-modal" {...props}>
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
    variant: PromoCardVariant.LeadNotify,
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

describe('LeadNotify', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renders the component with basic promo content', () => {
        render(<LeadNotify promoContent={mockPromoContent} />)
        expect(screen.getByText('Test Title')).toBeInTheDocument()
        expect(screen.getByText('Test Description')).toBeInTheDocument()
        expect(screen.getByText('Primary')).toBeInTheDocument()
        expect(screen.getByText('Secondary')).toBeInTheDocument()
    })

    it('shows video content when showVideo is true', () => {
        render(<LeadNotify promoContent={mockPromoContent} />)
        expect(screen.getByTestId('video-thumbnail')).toBeInTheDocument()
        expect(screen.getByTestId('video-modal')).toBeInTheDocument()
    })

    it('does not show video content when showVideo is false', () => {
        render(
            <LeadNotify
                promoContent={{ ...mockPromoContent, showVideo: false }}
            />,
        )
        expect(screen.queryByTestId('video-thumbnail')).not.toBeInTheDocument()
        expect(screen.queryByTestId('video-modal')).not.toBeInTheDocument()
    })

    it('shows notification icon on buttons when shouldShowNotificationIcon is true', () => {
        render(
            <LeadNotify
                promoContent={{
                    ...mockPromoContent,
                    shouldShowNotificationIcon: true,
                }}
            />,
        )
        expect(screen.getAllByTestId('action-button-icon')).toHaveLength(1)
        expect(screen.getByTestId('video-modal-cta-icon')).toBeInTheDocument()
    })

    it('does not show notification icon on buttons when shouldShowNotificationIcon is false', () => {
        render(<LeadNotify promoContent={mockPromoContent} />)
        expect(
            screen.queryByTestId('action-button-icon'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByTestId('video-modal-cta-icon'),
        ).not.toBeInTheDocument()
    })

    it('handles clicks on primary, secondary, and video modal buttons', async () => {
        const user = userEvent.setup()
        render(<LeadNotify promoContent={mockPromoContent} />)

        await user.click(screen.getByText('Primary'))
        expect(mockPromoContent.primaryButton.onClick).toHaveBeenCalled()

        await user.click(screen.getByText('Secondary'))
        expect(mockPromoContent.secondaryButton!.onClick).toHaveBeenCalled()

        await user.click(screen.getByText('Watch Video'))
        expect(mockPromoContent.videoModalButton!.onClick).toHaveBeenCalled()
    })

    it('does not render secondary button if not provided', () => {
        render(
            <LeadNotify
                promoContent={{
                    ...mockPromoContent,
                    secondaryButton: undefined,
                }}
            />,
        )
        expect(screen.queryByText('Secondary')).not.toBeInTheDocument()
    })

    it('does not render video modal CTA if not provided', () => {
        render(
            <LeadNotify
                promoContent={{
                    ...mockPromoContent,
                    videoModalButton: undefined,
                }}
            />,
        )
        expect(screen.queryByTestId('video-modal-cta')).not.toBeInTheDocument()
    })
})
