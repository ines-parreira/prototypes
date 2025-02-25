import React from 'react'

import { render, screen } from '@testing-library/react'

import { getIntegrationConfig } from 'state/integrations/helpers'
import { assumeMock } from 'utils/testing'

import VoicePaywall from './VoicePaywall'

jest.mock('state/integrations/helpers')
jest.mock(
    'pages/common/components/HeroImageCarousel/HeroImageCarousel',
    () => () => <div>HeroImageCarousel</div>,
)

const getIntegrationConfigMock = assumeMock(getIntegrationConfig)

describe('VoicePaywall', () => {
    const renderComponent = () => render(<VoicePaywall />)

    it('should render all elements', () => {
        getIntegrationConfigMock.mockReturnValue({
            setupGuide: 'setupGuide',
            pricingLink: 'pricingLink',
        } as any)

        renderComponent()

        // title
        expect(screen.getByText('Voice')).toBeInTheDocument()
        expect(screen.getByText('Voice add-on features')).toBeInTheDocument()
        expect(screen.getByText('Add voice')).toBeInTheDocument()
        expect(screen.getByText('Learn more')).toBeInTheDocument()
        expect(screen.getByText('How to set up').closest('a')).toHaveAttribute(
            'href',
            'setupGuide',
        )
        expect(screen.getByText('Pricing').closest('a')).toHaveAttribute(
            'href',
            'pricingLink',
        )
        expect(screen.getByText('HeroImageCarousel')).toBeInTheDocument()

        const descriptions = [
            'Create phone numbers, answer incoming customer calls, and make outbound calls from your helpdesk.',
            'Manage and monitor call and agent performance.',
            'Gain insights into queue status and agent availability.',
            'Save time with call and voicemail transcriptions.',
        ]

        descriptions.forEach((description: string) => {
            expect(screen.getByText(description)).toBeInTheDocument()
        })
    })

    it('should default to empty url if integration config is not found', () => {
        getIntegrationConfigMock.mockReturnValue(null as any)

        renderComponent()

        expect(screen.getByText('How to set up').closest('a')).toHaveAttribute(
            'href',
            '',
        )
        expect(screen.getByText('Pricing').closest('a')).toHaveAttribute(
            'href',
            '',
        )
    })
})
